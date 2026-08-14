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

function stableSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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

  const prompt = `A warm, polished children's educational illustration for an elementary vocabulary game. Show one clear, child-friendly scene that visually represents the ${topic} word "${word}". ${clue ? `Context: ${clue}.` : ""} Cheerful but calm storybook style, rich blue, yellow, and green palette, soft natural lighting, clean composition, landscape framing, no written words, no letters, no logo, no watermark.`;

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
          seed: stableSeed(`${topic}:${word}:${clue}`),
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
