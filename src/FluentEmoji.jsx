"use client";

import Image from "next/image";
import { useState } from "react";

const FLUENT_EMOJI_COMMIT = "62ecdc0d7ca5c6df32148c169556bc8d3782fca4";
const FLUENT_EMOJI_BASE_URL = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/${FLUENT_EMOJI_COMMIT}`;

const EMOJI_ASSET_NAMES = {
  "🐾": "Paw prints", "🏃": "Person running", "🌈": "Rainbow", "🎒": "Backpack", "💛": "Yellow heart", "🎲": "Game die",
  "🍎": "Red apple", "⚽": "Soccer ball", "🐱": "Cat face", "🐶": "Dog face", "🐘": "Elephant", "🐟": "Fish",
  "🍇": "Grapes", "🏠": "House", "🍦": "Soft ice cream", "🧃": "Beverage box", "🪁": "Kite", "🦁": "Lion",
  "🌙": "Crescent moon", "🪺": "Nest with eggs", "🍊": "Tangerine", "✏️": "Pencil", "👑": "Crown", "🐰": "Rabbit face",
  "☀️": "Sun", "🌳": "Deciduous tree", "☂️": "Umbrella", "🎻": "Violin", "🐋": "Whale", "🎵": "Musical note",
  "🪀": "Yo-yo", "🦓": "Zebra", "🦒": "Giraffe", "🐧": "Penguin", "🐬": "Dolphin", "🐯": "Tiger face",
  "🐢": "Turtle", "🐒": "Monkey", "🦘": "Kangaroo", "🐙": "Octopus", "🦋": "Butterfly", "🐊": "Crocodile",
  "🐿️": "Chipmunk", "🦩": "Flamingo", "🤸": "Person cartwheeling", "🏊": "Person swimming", "📖": "Open book",
  "✍️": "Writing hand", "🎤": "Microphone", "💃": "Woman dancing", "🧗": "Person climbing", "🧑‍🍳": "Cook",
  "🎨": "Artist palette", "😂": "Face with tears of joy", "😴": "Sleeping face", "🥎": "Softball", "👐": "Open hands",
  "🧱": "Brick", "😊": "Smiling face with smiling eyes", "🕊️": "Dove", "⚡": "High voltage", "🐌": "Snail",
  "🌴": "Palm tree", "🐜": "Ant", "🤫": "Shushing face", "📢": "Loudspeaker", "🧸": "Teddy bear",
  "💪": "Flexed biceps", "✨": "Sparkles", "😄": "Grinning face with smiling eyes", "🪑": "Chair", "🪵": "Wood",
  "🍼": "Baby bottle", "🕐": "One oclock", "📷": "Camera", "🥄": "Spoon", "🛏️": "Bed", "💡": "Light bulb",
  "⌨️": "Keyboard", "✂️": "Scissors", "🧺": "Basket", "🪟": "Window", "🫶": "Heart hands",
  "🗣️": "Speaking head", "🤝": "Handshake", "⏳": "Hourglass not done", "🙇": "Person bowing", "🫂": "People hugging",
  "🦸": "Person superhero", "⚖️": "Balance scale", "🤗": "Hugging face", "🫡": "Saluting face", "🎁": "Wrapped gift",
  "📋": "Clipboard", "🙏": "Folded hands", "🤔": "Thinking face", "👷": "Construction worker", "🌟": "Glowing star",
  "🏆": "Trophy", "🧩": "Puzzle piece", "⭐": "Star", "🍃": "Leaf fluttering in wind", "🛡️": "Shield",
  "⚓": "Anchor", "❤️": "Red heart", "🌍": "Globe showing Europe-Africa", "📚": "Books",
};

const DEFAULT_TONE_ASSETS = new Set([
  "Person running", "Person cartwheeling", "Person swimming", "Writing hand", "Woman dancing", "Person climbing", "Cook",
  "Open hands", "Flexed biceps", "Heart hands", "Person bowing", "Person superhero", "Folded hands", "Construction worker",
]);

function cleanAssetName(value) {
  return String(value || "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toLocaleUpperCase("en-US"));
}

function pathsForAssetName(value) {
  const name = cleanAssetName(value);
  if (!name) return [];
  const slug = name.toLocaleLowerCase("en-US").replace(/ /g, "_");
  const simplePath = `assets/${name}/3D/${slug}_3d.png`;
  const defaultPath = `assets/${name}/Default/3D/${slug}_3d_default.png`;
  return DEFAULT_TONE_ASSETS.has(name) ? [defaultPath, simplePath] : [simplePath, defaultPath];
}

function assetCandidates(emoji, name) {
  const paths = [
    ...pathsForAssetName(EMOJI_ASSET_NAMES[String(emoji || "")]),
    ...pathsForAssetName(name),
    ...pathsForAssetName("Sparkles"),
  ];
  return [...new Set(paths)].map((path) => `${FLUENT_EMOJI_BASE_URL}/${path.split("/").map(encodeURIComponent).join("/")}`);
}

function FluentEmojiImage({ emoji, name, alt, className, size }) {
  const candidates = assetCandidates(emoji, name);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const src = candidates[candidateIndex];

  if (!src) return <span className={`fluent-emoji ${className}`} aria-hidden="true">✦</span>;

  return (
    <span className={`fluent-emoji ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : "true"}>
      <Image src={src} width={size} height={size} sizes={`${size}px`} unoptimized alt="" draggable={false} onError={() => setCandidateIndex((current) => current + 1)} />
    </span>
  );
}

export function FluentEmoji({ emoji, name = "", alt = "", className = "", size = 256 }) {
  return <FluentEmojiImage key={`${emoji}:${name}`} emoji={emoji} name={name} alt={alt} className={className} size={size} />;
}
