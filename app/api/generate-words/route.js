const ALLOWED_TOPICS = {
  animals: "animals",
  verbs: "action verbs",
  adjectives: "describing words (adjectives)",
  objects: "everyday objects",
  values: "positive values and character traits",
  mixed: "a balanced mix of animals, action verbs, describing words, everyday objects, and positive values",
};

const ALLOWED_COUNTS = new Set([5, 10, 15, 20]);
const ALLOWED_WORD = /^[A-Z]{2,14}$/;
const MAX_EXCLUDED_WORDS = 240;
const MAX_GENERATION_ATTEMPTS = 3;

export const runtime = "nodejs";
export const maxDuration = 60;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function getOutputText(data) {
  return data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
}

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return json({ error: "Gemini word generation is not configured yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const topic = String(body?.topic || "").toLocaleLowerCase("en-US");
  const count = Number(body?.count);
  if (!ALLOWED_TOPICS[topic] || !ALLOWED_COUNTS.has(count)) {
    return json({ error: "Choose a valid topic and word count." }, 400);
  }

  const excludedWords = [...new Set(
    (Array.isArray(body?.excludedWords) ? body.excludedWords : [])
      .map((word) => String(word || "").toLocaleUpperCase("en-US").replace(/[^A-Z]/g, ""))
      .filter((word) => ALLOWED_WORD.test(word)),
  )].slice(-MAX_EXCLUDED_WORDS);
  const excludedAnswers = new Set(excludedWords);

  const wordSchema = {
    type: "OBJECT",
    properties: {
      words: {
        type: "ARRAY",
        minItems: count,
        maxItems: count,
        items: {
          type: "OBJECT",
          properties: {
            answer: { type: "STRING" },
            hint: { type: "STRING" },
            emoji: { type: "STRING" },
            emojiIsExact: { type: "BOOLEAN" },
          },
          required: ["answer", "hint", "emoji", "emojiIsExact"],
        },
      },
    },
    required: ["words"],
  };

  const model = process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite";

  const forbiddenList = excludedWords.length ? excludedWords.join(", ") : "none";

  try {
    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "Create safe vocabulary for an elementary learning game. Use common, simple English only. Never use spaces, punctuation, proper names, obscure words, or repeated answers. Keep every answer between 2 and 14 letters. Make each clue one short, child-friendly English sentence. Return one relevant emoji per word. Set emojiIsExact to true only when the emoji literally and unmistakably depicts the answer itself. Set it to false for metaphors, symbols, raw materials, related objects, or approximate substitutes; examples: TABLE with a log is false and QUICK with a lightning bolt is false. The forbidden-word list is absolute: never return, reorder, rephrase, or reuse an answer from it.",
              }],
            },
            contents: [{
              role: "user",
              parts: [{
                text: `Create exactly ${count} NEW and varied words about ${ALLOWED_TOPICS[topic]}. Forbidden answers already shown to the learner: ${forbiddenList}. This is variation attempt ${attempt}; choose different concepts, not merely a different order.`,
              }],
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: wordSchema,
              temperature: 1.15,
              maxOutputTokens: count === 20 ? 4096 : 2048,
            },
          }),
          cache: "no-store",
        },
      );

      const data = await apiResponse.json();
      if (!apiResponse.ok) {
        return json({ error: data.error?.message || "Word generation failed." }, apiResponse.status);
      }

      const outputText = getOutputText(data);
      const parsed = outputText ? JSON.parse(outputText) : null;
      const words = parsed?.words?.map((item) => ({
        answer: String(item.answer || "").toLocaleUpperCase("en-US").replace(/[^A-Z]/g, ""),
        hint: String(item.hint || "").trim().slice(0, 100),
        emoji: String(item.emoji || "✨").trim().slice(0, 8),
        topic,
        useGeneratedVisual: item.emojiIsExact !== true,
      }));

      const uniqueAnswers = new Set(words?.map((item) => item.answer));
      const isValid = words
        && words.length === count
        && uniqueAnswers.size === count
        && words.every((item) => ALLOWED_WORD.test(item.answer) && item.hint)
        && words.every((item) => !excludedAnswers.has(item.answer));

      if (isValid) {
        return json({ words, source: "gemini" });
      }
    }

    return json({ error: "Gemini repeated previously shown words. Please generate again." }, 502);
  } catch {
    return json({ error: "Could not reach the word generation service." }, 500);
  }
}
