"use client";

import Image from "next/image";
import { useState } from "react";

const FLUENT_EMOJI_BASE_URL = "https://emoji.fluent-cdn.com/1.0.0/100x100";
const FALLBACK_CODE = "2728";

function emojiCodes(emoji) {
  const exact = Array.from(String(emoji || ""), (character) => character.codePointAt(0).toString(16)).join("-");
  const withoutVariationSelectors = exact
    .split("-")
    .filter((code) => code !== "fe0f" && code !== "fe0e")
    .join("-");

  return [...new Set([exact, withoutVariationSelectors, FALLBACK_CODE].filter(Boolean))];
}

function FluentEmojiImage({ emoji, alt, className, size }) {
  const candidates = emojiCodes(emoji);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const code = candidates[candidateIndex];
  if (!code) return <span className={`fluent-emoji ${className}`} aria-hidden="true">✦</span>;

  return (
    <span className={`fluent-emoji ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : "true"}>
      <Image
        src={`${FLUENT_EMOJI_BASE_URL}/${code}.png`}
        width={size}
        height={size}
        sizes={`${size}px`}
        unoptimized
        alt=""
        draggable={false}
        onError={() => setCandidateIndex((current) => current + 1)}
      />
    </span>
  );
}

export function FluentEmoji({ emoji, alt = "", className = "", size = 100 }) {
  return <FluentEmojiImage key={emoji} emoji={emoji} alt={alt} className={className} size={size} />;
}
