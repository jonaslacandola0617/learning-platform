"use client";

import { useEffect, useRef, useState } from "react";
import { FluentEmoji } from "./FluentEmoji";
import { getBuiltInDictionary, WORD_TOPICS } from "./topicWords";

const LETTER_CARDS = [
  ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Dog", "🐶"],
  ["E", "Elephant", "🐘"], ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "House", "🏠"],
  ["I", "Ice cream", "🍦"], ["J", "Juice", "🧃"], ["K", "Kite", "🪁"], ["L", "Lion", "🦁"],
  ["M", "Moon", "🌙"], ["N", "Nest", "🪺"], ["O", "Orange", "🍊"], ["P", "Pencil", "✏️"],
  ["Q", "Queen", "👑"], ["R", "Rabbit", "🐰"], ["S", "Sun", "☀️"], ["T", "Tree", "🌳"],
  ["U", "Umbrella", "☂️"], ["V", "Violin", "🎻"], ["W", "Whale", "🐋"], ["X", "Xylophone", "🎵"],
  ["Y", "Yo-yo", "🪀"], ["Z", "Zebra", "🦓"],
].map(([letter, word, emoji]) => ({ letter, word, emoji }));

const FLIP_CACHE_KEY = "tuklas.flip-word-cache.v2";
function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function uniqueCards(items) {
  const seen = new Set();
  return items.filter((item) => {
    const answer = String(item.answer || "").toLocaleUpperCase("en-US");
    if (!answer || seen.has(answer)) return false;
    seen.add(answer);
    return true;
  });
}

function builtInCards(topic) {
  const topics = topic === "mixed" ? WORD_TOPICS.map((item) => item.id) : [topic];
  return uniqueCards(topics.flatMap((topicId) => getBuiltInDictionary(topicId)));
}

function readFlipCache(topic) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FLIP_CACHE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return uniqueCards(saved.filter((item) => topic === "mixed" || item.topic === topic));
  } catch {
    return [];
  }
}

function saveFlipCache(entries) {
  try {
    const existing = JSON.parse(window.localStorage.getItem(FLIP_CACHE_KEY) || "[]");
    const next = uniqueCards([...(Array.isArray(existing) ? existing : []), ...entries]).slice(-300);
    window.localStorage.setItem(FLIP_CACHE_KEY, JSON.stringify(next));
  } catch {
    // The cards still work for this session when storage is unavailable.
  }
}

export function LetterFlashSetup({ brand, onBack, onStart }) {
  const [mode, setMode] = useState("sequential");
  return (
    <div className="platform-page flash-setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Back</button>{brand}<span className="nav-step">Letter flashcards</span></nav>
      <main className="setup-shell flash-setup-shell">
        <header className="setup-intro"><span className="eyebrow">LETTER FLASHCARDS</span><h1>Choose how letters appear</h1><p>Explore all 26 letters with a familiar word and illustration for every card.</p></header>
        <section className="setup-section">
          <div className="setup-section-title"><span>1</span><div><h2>Choose a mode</h2><p>You can switch modes later by returning to this screen.</p></div></div>
          <div className="flash-mode-options">
            <button className={mode === "sequential" ? "selected" : ""} onClick={() => setMode("sequential")}><span className="mode-preview"><b>A</b><i>→</i><b>B</b><i>→</i><b>C</b></span><strong>Sequential</strong><small>Show A through Z in order.</small></button>
            <button className={mode === "random" ? "selected" : ""} onClick={() => setMode("random")}><span className="mode-preview random-preview"><b>Q</b><b>F</b><b>M</b></span><strong>Random</strong><small>Show a different letter each time.</small></button>
          </div>
        </section>
        <div className="setup-footer"><span>26 letters • {mode === "sequential" ? "A to Z order" : "Random order"}</span><button className="primary-button" onClick={() => onStart(mode)}>Start flashcards <span>→</span></button></div>
      </main>
    </div>
  );
}

export function LetterFlashGame({ brand, mode, onExit }) {
  const [index, setIndex] = useState(() => mode === "random" ? Math.floor(Math.random() * LETTER_CARDS.length) : 0);
  const [autoPlay, setAutoPlay] = useState(false);
  const card = LETTER_CARDS[index];

  function nextCard() {
    if (mode === "sequential") setIndex((current) => (current + 1) % LETTER_CARDS.length);
    else setIndex((current) => {
      let next = current;
      while (next === current) next = Math.floor(Math.random() * LETTER_CARDS.length);
      return next;
    });
  }

  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = window.setInterval(nextCard, 2800);
    return () => window.clearInterval(timer);
  });

  return (
    <div className="game-page letter-flash-page">
      <header className="game-header"><button className="game-home" onClick={onExit}>← Games</button>{brand}<div className="flash-mode-badge">{mode === "sequential" ? "A–Z" : "Random"}</div></header>
      <main className="letter-flash-shell">
        <div className="flash-stage-heading"><div><span className="eyebrow">LETTER FLASHCARDS</span><h1>{mode === "sequential" ? `${index + 1} of 26` : "Random letters"}</h1></div><button className={`autoplay-button ${autoPlay ? "playing" : ""}`} onClick={() => setAutoPlay((current) => !current)}>{autoPlay ? "Ⅱ Pause" : "▶ Auto play"}</button></div>
        <section className="letter-flash-card" aria-live="polite">
          <div className="letter-display">{card.letter}</div>
          <div className="letter-example"><FluentEmoji emoji={card.emoji} name={card.word} alt={card.word} className="letter-card-emoji" size={190} /><strong>{card.word}</strong><small>{card.letter} is for {card.word}</small></div>
        </section>
        <div className="flash-card-navigation">
          {mode === "sequential" && <button className="secondary-button" onClick={() => setIndex((current) => (current - 1 + LETTER_CARDS.length) % LETTER_CARDS.length)}>← Previous</button>}
          <button className="primary-button" onClick={nextCard}>Next letter →</button>
        </div>
      </main>
    </div>
  );
}

export function WordFlipSetup({ brand, onBack, onStart }) {
  const [topic, setTopic] = useState("mixed");
  const options = [{ id: "mixed", label: "Mixed Words", icon: "🎲", description: "Words from every category" }, ...WORD_TOPICS];
  return (
    <div className="platform-page flash-setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Back</button>{brand}<span className="nav-step">Word flip cards</span></nav>
      <main className="setup-shell flash-setup-shell">
        <header className="setup-intro"><span className="eyebrow">WORD FLIP CARDS</span><h1>Choose a word collection</h1><p>Look at the illustration, guess the word, and flip the card to reveal the answer.</p></header>
        <section className="setup-section">
          <div className="setup-section-title"><span>1</span><div><h2>Choose a topic</h2><p>The game continues for as long as you want to play.</p></div></div>
          <div className="flip-topic-options">{options.map((option) => <button key={option.id} className={topic === option.id ? "selected" : ""} onClick={() => setTopic(option.id)}><FluentEmoji emoji={option.icon} className="topic-emoji" size={34} /><strong>{option.label}</strong><small>{option.description}</small></button>)}</div>
        </section>
        <div className="setup-footer"><span>Endless cards • Microsoft Fluent Emoji • Batched word generation</span><button className="primary-button" onClick={() => onStart(topic)}>Start flipping <span>→</span></button></div>
      </main>
    </div>
  );
}

export function WordFlipGame({ brand, topic, onExit }) {
  const [cards, setCards] = useState(() => shuffle(uniqueCards([...builtInCards(topic), ...readFlipCache(topic)])));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seenCount, setSeenCount] = useState(1);
  const [generationStatus, setGenerationStatus] = useState("");
  const requesting = useRef(false);
  const generationDisabled = useRef(false);
  const card = cards[index];

  async function requestNewBatch() {
    if (requesting.current || generationDisabled.current) return;
    requesting.current = true;
    setGenerationStatus("Adding 20 new words to your library…");
    const exclusions = uniqueCards([...builtInCards(topic), ...cards]).map((item) => item.answer).slice(-240);
    try {
      const response = await fetch("/api/generate-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: 20, excludedWords: exclusions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "New words are unavailable.");
      const additions = uniqueCards(data.words);
      saveFlipCache(additions);
      setCards((current) => uniqueCards([...current, ...shuffle(additions)]));
      setGenerationStatus(`${additions.length} new words saved for future games.`);
    } catch {
      generationDisabled.current = true;
      setGenerationStatus("Using your saved word library for this game.");
    } finally {
      requesting.current = false;
    }
  }

  function nextCard() {
    setFlipped(false);
    setSeenCount((current) => current + 1);
    const remaining = cards.length - index - 1;
    if (remaining <= 5) requestNewBatch();
    if (remaining > 0) setIndex((current) => current + 1);
    else {
      setCards((current) => shuffle(current));
      setIndex(0);
    }
  }

  return (
    <div className="game-page word-flip-page">
      <header className="game-header"><button className="game-home" onClick={onExit}>← Games</button>{brand}<div className="flash-mode-badge">Card {seenCount}</div></header>
      <main className="word-flip-shell">
        <div className="flash-stage-heading"><div><span className="eyebrow">WORD FLIP CARDS</span><h1>What word is this?</h1><p>Guess from the illustration, then tap the card to check.</p></div>{generationStatus && <span className="batch-status">{generationStatus}</span>}</div>
        <button className={`word-flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((current) => !current)} aria-label={flipped ? `Answer: ${card.answer}. Tap to see the illustration.` : "Tap to reveal the answer"}>
          <span className="flip-card-inner">
            <span className="flip-card-face flip-card-front"><FluentEmoji key={`${card.answer}:${card.emoji}`} emoji={card.emoji} name={card.answer} alt={card.answer} className="flip-card-emoji" size={330} /><small>Tap to reveal</small></span>
            <span className="flip-card-face flip-card-back"><small>The answer is</small><strong>{card.answer}</strong><p>{card.hint}</p><em>Tap to see the illustration</em></span>
          </span>
        </button>
        <div className="word-flip-actions"><button className="secondary-button" onClick={() => setFlipped((current) => !current)}>{flipped ? "Show illustration" : "Reveal answer"}</button><button className="primary-button" onClick={nextCard}>Next word →</button></div>
      </main>
    </div>
  );
}
