const ALLOWED_WORD = /^[A-ZÑ]{2,14}$/;

export const runtime = "nodejs";
export const maxDuration = 300;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY is not configured." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const word = String(body?.word || "").toLocaleUpperCase("en-US").trim();
  const clue = String(body?.clue || "").trim().slice(0, 120);
  const topic = String(body?.topic || "general vocabulary").trim().slice(0, 40);
  if (!ALLOWED_WORD.test(word)) {
    return json({ error: "Invalid word." }, 400);
  }

  const prompt = `A warm, polished children's educational illustration for an elementary vocabulary game. Show one clear, child-friendly scene that visually represents the ${topic} word "${word}". ${clue ? `Context: ${clue}.` : ""} Cheerful but calm storybook style, rich blue yellow and green palette, soft natural lighting, clean composition, landscape framing, no written words, no letters, no logo, no watermark.`;

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1-mini",
        prompt,
        size: "1536x1024",
        quality: "low",
        output_format: "webp",
      }),
      cache: "no-store",
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return json({ error: data.error?.message || "Image generation failed." }, apiResponse.status);
    }

    return json({ image: `data:image/webp;base64,${data.data[0].b64_json}` });
  } catch {
    return json({ error: "Could not reach the image service." }, 500);
  }
}
