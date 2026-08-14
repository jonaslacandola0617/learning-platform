const ALLOWED_TOPICS = {
  animals: "animals",
  verbs: "action verbs",
  adjectives: "describing words (adjectives)",
  objects: "everyday objects",
  values: "positive values and character traits",
};

const ALLOWED_COUNTS = new Set([5, 10, 15]);
const ALLOWED_WORD = /^[A-Z]{2,14}$/;

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
          },
          required: ["answer", "hint", "emoji"],
        },
      },
    },
    required: ["words"],
  };

  const model = process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite";

  try {
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
              text: "Create safe vocabulary for an elementary learning game. Use common, simple English only. Never use spaces, punctuation, proper names, obscure words, or repeated answers. Keep every answer between 2 and 14 letters. Make each clue one short, child-friendly English sentence. Return one relevant emoji per word.",
            }],
          },
          contents: [{
            role: "user",
            parts: [{ text: `Create exactly ${count} unique words about ${ALLOWED_TOPICS[topic]}.` }],
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: wordSchema,
            temperature: 0.9,
            maxOutputTokens: 2048,
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
    }));

    const uniqueAnswers = new Set(words?.map((item) => item.answer));
    if (!words || words.length !== count || uniqueAnswers.size !== count || words.some((item) => !ALLOWED_WORD.test(item.answer) || !item.hint)) {
      return json({ error: "The generated word set was invalid. Please try again." }, 502);
    }

    return json({ words, source: "gemini" });
  } catch {
    return json({ error: "Could not reach the word generation service." }, 500);
  }
}
