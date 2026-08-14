const ALLOWED_WORD = /^[A-Z]{2,14}$/;
const DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const ALLOWED_MODEL = /^@cf\/[a-z0-9-]+\/[a-z0-9.-]+$/;

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
  if (!ALLOWED_WORD.test(word)) {
    return json({ error: "Invalid word." }, 400);
  }

  const model = process.env.CLOUDFLARE_IMAGE_MODEL || DEFAULT_MODEL;
  if (!ALLOWED_MODEL.test(model)) {
    return json({ error: "Invalid Cloudflare image model configuration." }, 500);
  }

  const concept = word.toLocaleLowerCase("en-US");
  const sceneDirection = ["animals", "objects"].includes(topic)
    ? "Show one central, full-body subject with only a few simple environmental details."
    : "Show one simple action scene with no more than two friendly characters and only essential props.";
  const prompt = [
    "Create a wordless educational picture for a children's learning game. IMAGE ONLY.",
    `Clearly depict ${concept} as the main visual concept.`,
    clue ? `Communicate this meaning visually: ${clue}` : "Make the concept immediately recognizable without explanation.",
    sceneDirection,
    "Use the same Tuklas house style every time: polished 3D storybook illustration, soft rounded forms, clean edges, subtle matte textures, gentle depth, friendly proportions, and soft diffused daylight.",
    "Use a balanced royal-blue, sunny-yellow, leaf-green, coral, and warm-cream palette. Keep the background simple, bright, spacious, and uncluttered. Landscape composition, eye-level view, subject centered with comfortable margins.",
    "STRICTLY WORDLESS: do not include text, typography, words, letters, numbers, labels, captions, signs, speech bubbles, book covers, posters, logos, watermarks, borders, interface elements, or written symbols. Do not spell or display the concept anywhere in the image.",
  ].join(" ");

  try {
    const apiResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          steps: 4,
        }),
        cache: "no-store",
      },
    );

    const contentType = apiResponse.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      if (!apiResponse.ok) return json({ error: "Image generation failed." }, apiResponse.status);
      const image = Buffer.from(await apiResponse.arrayBuffer()).toString("base64");
      return json({ image: `data:${contentType.split(";")[0]};base64,${image}`, source: "cloudflare" }, 200, true);
    }

    const data = await apiResponse.json();
    if (!apiResponse.ok || data.success === false) {
      const message = data.errors?.[0]?.message || data.error?.message || "Image generation failed.";
      return json({ error: message }, apiResponse.status || 500);
    }

    const image = data.result?.image || data.image;
    if (typeof image !== "string" || !image) {
      return json({ error: "Cloudflare returned an invalid image." }, 502);
    }

    return json({ image: `data:image/jpeg;base64,${image}`, source: "cloudflare" }, 200, true);
  } catch {
    return json({ error: "Could not reach the image generation service." }, 500);
  }
}
