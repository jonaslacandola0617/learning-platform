import fs from "node:fs";
import path from "node:path";

const patchPath = path.join(process.cwd(), "scripts", "patch-game-menu-pages.mjs");
let source = fs.readFileSync(patchPath, "utf8");
const start = source.indexOf("const routePage = ");
const writeLine = 'fs.writeFileSync(path.join(routeDir, "page.jsx"), routePage);';
const end = source.indexOf(writeLine, start);

if (start === -1 || end === -1) {
  throw new Error("Could not locate temporary routePage block");
}

const routeSource = [
  'import { notFound } from "next/navigation";',
  'import App from "../../../src/App";',
  '',
  'const GAMES = {',
  '  "guess-the-word": "Guess the Word",',
  '  tracing: "Tracing Practice",',
  '  "letter-flashcards": "Letter Flashcards",',
  '  "word-flip-cards": "Word Flip Cards",',
  '  "draw-color": "Draw & Color",',
  '};',
  '',
  'export function generateStaticParams() {',
  '  return Object.keys(GAMES).map((game) => ({ game }));',
  '}',
  '',
  'export async function generateMetadata({ params }) {',
  '  const { game } = await params;',
  '  const title = GAMES[game];',
  '  if (!title) return {};',
  '  return { title: title + " | Tuklas" };',
  '}',
  '',
  'export default async function GamePage({ params }) {',
  '  const { game } = await params;',
  '  if (!GAMES[game]) notFound();',
  '  return <App gameSlug={game} />;',
  '}',
  '',
].join("\n");

const replacement = `const routePage = ${JSON.stringify(routeSource)};\n`;
source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(patchPath, source);
console.log("Temporary patch script repaired.");
