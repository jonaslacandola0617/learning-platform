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
  return data.output
    ?.flatMap((item) => item.content || [])
    .find((content) => content.type === "output_text")?.text;
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return json({ error: "AI word generation is not configured yet." }, 503);
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
    type: "object",
    properties: {
      words: {
        type: "array",
        items: {
          type: "object",
          properties: {
            answer: { type: "string" },
            hint: { type: "string" },
            emoji: { type: "string" },
          },
          required: ["answer", "hint", "emoji"],
          additionalProperties: false,
        },
      },
    },
    required: ["words"],
    additionalProperties: false,
  };

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
        store: false,
        instructions: "Create safe vocabulary for an elementary learning game. Use common, simple English only. Never use spaces, punctuation, proper names, obscure words, or repeated answers. Keep every answer between 2 and 14 letters. Make each clue one short, child-friendly English sentence. Return one relevant emoji per word.",
        input: `Create exactly ${count} unique words about ${ALLOWED_TOPICS[topic]}.`,
        text: {
          format: {
            type: "json_schema",
            name: "word_game_set",
            strict: true,
            schema: wordSchema,
          },
        },
      }),
      cache: "no-store",
    });

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

    return json({ words, source: "ai" });
  } catch {
    return json({ error: "Could not reach the word generation service." }, 500);
  }
}
