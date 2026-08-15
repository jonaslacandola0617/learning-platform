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
const MIN_CANDIDATES_PER_ATTEMPT = 20;
const MAX_CANDIDATES_PER_ATTEMPT = 30;
const VARIATION_DIRECTIONS = [
  "Cover many different concepts and starting letters.",
  "Prefer less obvious but still familiar elementary-school words and different starting letters.",
  "Search broadly across subcategories, habitats, situations, and everyday examples not used before.",
];

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

function createWordSchema(count) {
  return {
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
  const acceptedWords = [];

  const model = process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite";

  const forbiddenList = excludedWords.length ? excludedWords.join(", ") : "none";

  try {
    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const remainingCount = count - acceptedWords.length;
      const candidateCount = Math.min(
        MAX_CANDIDATES_PER_ATTEMPT,
        Math.max(MIN_CANDIDATES_PER_ATTEMPT, remainingCount * 2),
      );
      const attemptExclusions = [...excludedAnswers];
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
                text: "Create safe vocabulary for an elementary learning game. Use common, simple English only. Never use spaces, punctuation, proper names, obscure words, or repeated answers. Keep every answer between 2 and 14 letters. Make each clue one short, child-friendly English sentence. Return one relevant emoji per word. The forbidden-word list is absolute: never return, reorder, rephrase, or reuse an answer from it.",
              }],
            },
            contents: [{
              role: "user",
              parts: [{
                text: `Create exactly ${candidateCount} candidate words about ${ALLOWED_TOPICS[topic]}. We need ${remainingCount} usable new words from this broad candidate pool. Forbidden answers already shown to the learner: ${attemptExclusions.length ? attemptExclusions.join(", ") : forbiddenList}. ${VARIATION_DIRECTIONS[attempt - 1]} Never include a forbidden answer.`,
              }],
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: createWordSchema(candidateCount),
              temperature: 1.15,
              maxOutputTokens: 8192,
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
      let parsed;
      try {
        parsed = outputText ? JSON.parse(outputText) : null;
      } catch {
        console.warn("generate-words: Gemini returned malformed JSON", { attempt, topic });
        continue;
      }

      const words = parsed?.words?.map((item) => ({
        answer: String(item.answer || "").toLocaleUpperCase("en-US").replace(/[^A-Z]/g, ""),
        hint: String(item.hint || "").trim().slice(0, 100),
        emoji: String(item.emoji || "✨").trim().slice(0, 8),
        topic,
      })) || [];

      for (const word of words) {
        if (acceptedWords.length === count) break;
        if (!ALLOWED_WORD.test(word.answer) || !word.hint || excludedAnswers.has(word.answer)) continue;
        excludedAnswers.add(word.answer);
        acceptedWords.push(word);
      }

      if (acceptedWords.length === count) {
        return json({ words: acceptedWords, source: "gemini" });
      }

      console.warn("generate-words: retrying incomplete batch", {
        attempt,
        topic,
        requested: count,
        candidates: words.length,
        accepted: acceptedWords.length,
      });
    }

    return json({ error: "Gemini could not create enough unique words. Please try again." }, 502);
  } catch (error) {
    console.error("generate-words: request failed", {
      topic,
      message: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "Could not reach the word generation service." }, 500);
  }
}
