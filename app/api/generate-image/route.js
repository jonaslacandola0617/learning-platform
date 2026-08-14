const ALLOWED_WORD = /^[A-Z]{2,14}$/;
const DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const ALLOWED_MODEL = /^@cf\/[a-z0-9-]+\/[a-z0-9.-]+$/;
const MAX_IMAGE_ATTEMPTS = 3;

export const runtime = "nodejs";
export const maxDuration = 60;

function json(data, status = 200, cacheable = false) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": cacheable
        ? "public, s-maxage=2592000, stale-while-revalidate=86400"
        : "private, no-store, max-age=0",
    },
  });
}

function getOutputText(data) {
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
}

async function generateCloudflareImage({ accountId, apiToken, model, prompt }) {
  const apiResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, steps: 4 }),
      cache: "no-store",
    },
  );

  const contentType = apiResponse.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) {
    if (!apiResponse.ok) throw new Error(`Cloudflare image generation failed (${apiResponse.status}).`);
    return {
      base64: Buffer.from(await apiResponse.arrayBuffer()).toString("base64"),
      mimeType: contentType.split(";")[0],
    };
  }

  const data = await apiResponse.json();
  if (!apiResponse.ok || data.success === false) {
    throw new Error(data.errors?.[0]?.message || data.error?.message || "Image generation failed.");
  }
  const image = data.result?.image || data.image;
  if (typeof image !== "string" || !image) throw new Error("Cloudflare returned an invalid image.");
  return { base64: image, mimeType: "image/jpeg" };
}

async function inspectFlipcardImage({ base64, mimeType, concept, clue, needsCharacter }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite";
  const apiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            {
              text: [
                "Audit this children's flip-card image strictly.",
                `The intended concept is ${concept}.`,
                clue ? `The intended meaning is: ${clue}` : "",
                "Readable text includes any word, letter, number, caption, label, logo, or watermark anywhere in the image.",
                needsCharacter
                  ? "The main subject must be an adult human woman in a red flamenco dress, never a bean, potato, egg, blob, food mascot, baby, or bodysuit character."
                  : "The main subject must be a literal, recognizable depiction of the intended concept.",
                "The background must be plain pure white or transparent-looking white, without a colored backdrop.",
              ].filter(Boolean).join(" "),
            },
            { inlineData: { mimeType, data: base64 } },
          ],
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              hasReadableText: { type: "BOOLEAN" },
              matchesConcept: { type: "BOOLEAN" },
              isCorrectCharacter: { type: "BOOLEAN" },
              hasPlainWhiteBackground: { type: "BOOLEAN" },
            },
            required: ["hasReadableText", "matchesConcept", "isCorrectCharacter", "hasPlainWhiteBackground"],
          },
          temperature: 0,
          maxOutputTokens: 256,
        },
      }),
      cache: "no-store",
    },
  );

  if (!apiResponse.ok) return null;
  const data = await apiResponse.json();
  const outputText = getOutputText(data);
  if (!outputText) return null;
  try {
    return JSON.parse(outputText);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return json({ error: "Cloudflare image generation is not configured yet." }, 503);
  }

  const { searchParams } = new URL(request.url);
  const word = String(searchParams.get("word") || "").toLocaleUpperCase("en-US").trim();
  const clue = String(searchParams.get("clue") || "").trim().slice(0, 120);
  const topic = String(searchParams.get("topic") || "general vocabulary").trim().slice(0, 40);
  const variant = String(searchParams.get("variant") || "storybook");
  if (!ALLOWED_WORD.test(word)) return json({ error: "Invalid word." }, 400);
  if (!["storybook", "flipcard-icon"].includes(variant)) return json({ error: "Invalid image variant." }, 400);

  const model = process.env.CLOUDFLARE_IMAGE_MODEL || DEFAULT_MODEL;
  if (!ALLOWED_MODEL.test(model)) {
    return json({ error: "Invalid Cloudflare image model configuration." }, 500);
  }

  const concept = word.toLocaleLowerCase("en-US");
  const needsCharacter = !["animals", "objects"].includes(topic);
  const storybookDirection = ["animals", "objects"].includes(topic)
    ? "Show one central, full-body subject with only a few simple environmental details."
    : "Show one simple action scene with no more than two friendly characters and only essential props.";
  const flipcardDirection = topic === "objects"
    ? "Show the complete literal object, including its defining parts, from a clear three-quarter view. Do not show a raw material, ingredient, or related object instead."
    : topic === "animals"
      ? "Show one complete, anatomically recognizable animal in a friendly pose."
      : [
          "Always use the same adult human heroine: a warm medium-brown-skinned woman with a normal human head, torso, arms, hands, legs, and feet; large friendly brown eyes; long wavy dark-brown hair swept to her right; a red flower above her left ear; small gold hoop earrings; a fitted bright-red flamenco dress with a ruffled skirt and one-shoulder ruffle; and red low-heeled dance shoes.",
          `Show her clearly performing or expressing ${concept}. Change only her pose, gesture, facial expression, and an essential prop when needed. Keep her identity, face, hair, outfit, colors, age, and body proportions unchanged.`,
          "She must look like an adult human woman—not a potato, bean, egg, blob, food, baby, animal, mascot, bodysuit, or faceless shape.",
        ].join(" ");

  const basePrompt = variant === "flipcard-icon"
    ? [
        "Create one wordless polished 3D learning icon for a children's flip card. IMAGE ONLY.",
        `The exact concept is ${concept}.`,
        clue ? `Its exact child-friendly meaning is: ${clue}` : "Make the exact concept immediately recognizable without explanation.",
        flipcardDirection,
        "Literal accuracy is the highest priority. Do not replace the concept with a metaphor, symbol, material, tool, logo, or vaguely related item.",
        "Use a clean, bold silhouette, rounded but realistic human proportions when a person is shown, smooth polished clay-like surfaces, gentle highlights, subtle depth, and bright natural colors.",
        "Square centered composition. The single subject is fully visible and fills about 75 percent of the frame.",
        "BACKGROUND: pure solid white (#FFFFFF) only. No cream, beige, yellow, gradient, scenery, floor, backdrop, border, interface, or cast shadow. If true transparency is supported, transparent is also acceptable.",
        "STRICTLY WORDLESS: no text, letters, numbers, labels, captions, signs, speech bubbles, logos, watermarks, written symbols, or answer spelling anywhere in the image.",
      ].join(" ")
    : [
        "Create a wordless educational picture for a children's learning game. IMAGE ONLY.",
        `Clearly depict ${concept} as the main visual concept.`,
        clue ? `Communicate this meaning visually: ${clue}` : "Make the concept immediately recognizable without explanation.",
        storybookDirection,
        "Use the same Tuklas house style every time: polished 3D storybook illustration, soft rounded forms, clean edges, subtle matte textures, gentle depth, friendly proportions, and soft diffused daylight.",
        "Use a balanced royal-blue, sunny-yellow, leaf-green, coral, and warm-cream palette. Keep the background simple, bright, spacious, and uncluttered. Landscape composition, eye-level view, subject centered with comfortable margins.",
        "STRICTLY WORDLESS: do not include text, typography, words, letters, numbers, labels, captions, signs, speech bubbles, book covers, posters, logos, watermarks, borders, interface elements, or written symbols.",
      ].join(" ");

  try {
    const attempts = variant === "flipcard-icon" ? MAX_IMAGE_ATTEMPTS : 1;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const retryDirection = attempt === 1
        ? ""
        : " Previous result failed quality control. Regenerate from scratch and obey every identity, wordless, literal-meaning, and white-background requirement exactly.";
      const generated = await generateCloudflareImage({
        accountId,
        apiToken,
        model,
        prompt: `${basePrompt}${retryDirection}`,
      });

      if (variant !== "flipcard-icon") {
        return json({ image: `data:${generated.mimeType};base64,${generated.base64}`, source: "cloudflare" }, 200, true);
      }

      const audit = await inspectFlipcardImage({ ...generated, concept, clue, needsCharacter });
      const passed = audit
        && audit.hasReadableText === false
        && audit.matchesConcept === true
        && audit.isCorrectCharacter === true
        && audit.hasPlainWhiteBackground === true;
      if (passed) {
        return json({
          image: `data:${generated.mimeType};base64,${generated.base64}`,
          source: "cloudflare-verified",
        }, 200, true);
      }
    }

    return json({ error: "The generated visual did not pass the wordless character check." }, 422);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Could not reach the image generation service." }, 500);
  }
}
