import { notFound } from "next/navigation";
import App from "../../../src/App";

const GAMES = {
  "guess-the-word": "Guess the Word",
  tracing: "Tracing Practice",
  "letter-flashcards": "Letter Flashcards",
  "word-flip-cards": "Word Flip Cards",
  "draw-color": "Draw & Color",
};

export function generateStaticParams() {
  return Object.keys(GAMES).map((game) => ({ game }));
}

export async function generateMetadata({ params }) {
  const { game } = await params;
  const title = GAMES[game];
  if (!title) return {};
  return { title };
}

export default async function GamePage({ params }) {
  const { game } = await params;
  if (!GAMES[game]) notFound();
  return <App gameSlug={game} />;
}
