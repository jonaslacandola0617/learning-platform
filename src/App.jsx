"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { puzzles as starterPuzzles } from "./puzzles";
import { getBuiltInWords, WORD_TOPICS } from "./topicWords";

const EXTRA_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function normalizeWord(value) {
  return value.toLocaleUpperCase("en-US").replace(/[^A-Z]/g, "").slice(0, 14);
}

function preparePuzzle(entry, index) {
  const answer = normalizeWord(entry.answer || entry.word || "");
  const revealCount = Math.max(1, Math.floor(answer.length * 0.32));
  const revealed = entry.revealed || shuffle(answer.split("").map((_, i) => i)).slice(0, revealCount);
  const poolExtra = entry.poolExtra || shuffle(EXTRA_LETTERS.filter((letter) => !answer.includes(letter))).slice(0, 6);
  return {
    id: `round-${index}-${answer}`,
    answer,
    image: entry.image || null,
    emoji: entry.emoji || ["📚", "🌟", "🤝", "🌱", "🎨"][index % 5],
    emojiLabel: entry.emojiLabel || `Illustration representing ${answer.toLocaleLowerCase("en-US")}`,
    hint: entry.hint?.trim() || `Think about what the word ${answer} means.`,
    description: entry.description?.trim() || "Which word matches this visual clue?",
    topic: entry.topic || "custom",
    revealed,
    poolExtra,
  };
}

function buildPool(puzzle) {
  return shuffle([...puzzle.answer, ...puzzle.poolExtra]).map((letter, id) => ({ id, letter, used: false }));
}

function initSlots(puzzle) {
  return puzzle.answer.split("").map((letter, index) => ({
    index,
    letter: puzzle.revealed.includes(index) ? letter : null,
    locked: puzzle.revealed.includes(index),
    poolId: null,
    wrong: false,
  }));
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark">T</span>
      <span><strong>Tuklas</strong><small>Learn. Play. Grow.</small></span>
    </div>
  );
}

function Dashboard({ onSelectGame }) {
  return (
    <div className="platform-page">
      <nav className="platform-nav">
        <Brand />
        <div className="nav-profile"><span>Welcome back!</span><span className="avatar">JL</span></div>
      </nav>

      <main className="dashboard-shell">
        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="eyebrow">YOUR LEARNING SPACE</span>
            <h1>Learn through every <em>game.</em></h1>
            <p>Choose an activity, test what you know, and make every lesson more enjoyable.</p>
            <button className="primary-button" onClick={onSelectGame}>Play the first game <span>→</span></button>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="sun-orbit"><span>★</span></div>
            <div className="art-card art-card-one">A</div>
            <div className="art-card art-card-two">B</div>
            <div className="art-card art-card-three">C</div>
            <div className="pencil">✎</div>
          </div>
        </section>

        <section className="games-section">
          <div className="section-heading"><div><span className="eyebrow">GAMES</span><h2>What would you like to play?</h2></div><span className="game-count">1 game available</span></div>
          <div className="game-grid">
            <article className="game-card featured-game" onClick={onSelectGame}>
              <div className="game-visual word-visual"><span className="letter-tile">M</span><span className="letter-tile">A</span><span className="letter-tile">B</span><span className="letter-tile">A</span><span className="letter-tile">I</span></div>
              <div className="game-card-body">
                <div className="card-tags"><span>Vocabulary</span><span>Words</span></div>
                <h3>Guess the Word</h3>
                <p>Use the picture and clue to build the correct word.</p>
                <button className="card-play">Play now <span>→</span></button>
              </div>
            </article>

            <article className="game-card coming-card">
              <div className="game-visual sequence-visual"><span>1</span><i>→</i><span>2</span><i>→</i><span>3</span></div>
              <div className="game-card-body"><div className="card-tags"><span>Logic</span></div><h3>Story Sequence</h3><p>Arrange events in the correct order.</p><span className="soon-label">Coming soon</span></div>
            </article>

            <article className="game-card coming-card">
              <div className="game-visual match-visual"><span>🍎</span><i>↔</i><span>A</span></div>
              <div className="game-card-body"><div className="card-tags"><span>Memory</span></div><h3>Find the Match</h3><p>Match each picture with the correct word.</p><span className="soon-label">Coming soon</span></div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

function GameSetup({ onBack, onStart }) {
  const [roundCount, setRoundCount] = useState(5);
  const [topic, setTopic] = useState("animals");
  const [imageMode, setImageMode] = useState("included");
  const [entries, setEntries] = useState(() => getBuiltInWords("animals", 5));
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNote, setGenerationNote] = useState("Your first word set is ready. You can edit every word and clue.");
  const generationRequest = useRef(0);

  async function generateWords(nextTopic, count, randomizeFallback = true) {
    const requestId = generationRequest.current + 1;
    generationRequest.current = requestId;
    setIsGenerating(true);
    setError("");
    setGenerationNote(`Creating ${count} ${WORD_TOPICS.find((item) => item.id === nextTopic)?.label.toLocaleLowerCase("en-US")}…`);

    try {
      const response = await fetch("/api/generate-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: nextTopic, count }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI generation is unavailable.");
      if (generationRequest.current !== requestId) return;
      setEntries(data.words.map((item) => ({
        ...item,
        emojiLabel: `${item.answer.toLocaleLowerCase("en-US")} illustration`,
        description: `Which word from ${WORD_TOPICS.find((topicItem) => topicItem.id === nextTopic)?.label || "this topic"} matches this clue?`,
      })));
      setGenerationNote(`Fresh Gemini word set ready—edit anything you want.`);
    } catch {
      if (generationRequest.current !== requestId) return;
      setEntries(getBuiltInWords(nextTopic, count, randomizeFallback));
      setGenerationNote("Built-in word set ready. Add a Gemini API key later for fresh AI-generated sets.");
    } finally {
      if (generationRequest.current === requestId) setIsGenerating(false);
    }
  }

  function changeCount(count) {
    setRoundCount(count);
    generateWords(topic, count);
  }

  function changeTopic(nextTopic) {
    setTopic(nextTopic);
    generateWords(nextTopic, roundCount);
  }

  function updateEntry(index, field, value) {
    setEntries((current) => current.map((entry, entryIndex) => {
      if (entryIndex !== index) return entry;
      if (field !== "answer") return { ...entry, hint: value.slice(0, 100) };

      const answer = normalizeWord(value);
      const selectedTopic = WORD_TOPICS.find((item) => item.id === topic);
      return {
        ...entry,
        answer,
        image: null,
        emoji: selectedTopic?.icon || "✨",
        emojiLabel: answer ? `${answer.toLocaleLowerCase("en-US")} illustration` : "Custom word illustration",
        description: `Which word from ${selectedTopic?.label || "this topic"} matches this clue?`,
      };
    }));
  }

  function submit(event) {
    event.preventDefault();
    const missing = entries.findIndex((entry) => !entry.answer.trim());
    if (missing !== -1) {
      setError(`Please enter a word for item ${missing + 1}.`);
      document.getElementById(`word-${missing}`)?.focus();
      return;
    }
    onStart(entries.map((entry, index) => {
      return preparePuzzle({ ...entry, topic }, index);
    }), imageMode);
  }

  return (
    <div className="platform-page setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Back</button><Brand compact /><span className="nav-step">Game setup</span></nav>
      <main className="setup-shell">
        <header className="setup-intro"><span className="eyebrow">GUESS THE WORD</span><h1>Create your word game</h1><p>Choose a topic and number of rounds. We will prepare the words immediately, and you can edit everything before playing.</p></header>

        <form onSubmit={submit}>
          <section className="setup-section">
            <div className="setup-section-title"><span>1</span><div><h2>Choose a topic</h2><p>The game will generate simple English words from this category.</p></div></div>
            <div className="topic-options">{WORD_TOPICS.map((item) => <button type="button" key={item.id} className={topic === item.id ? "selected" : ""} onClick={() => changeTopic(item.id)} disabled={isGenerating}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.description}</small></button>)}</div>
          </section>

          <section className="setup-section">
            <div className="setup-section-title"><span>2</span><div><h2>How many words?</h2><p>Clicking a number creates a new set immediately.</p></div></div>
            <div className="count-options">{[5, 10, 15].map((count) => <button type="button" key={count} className={roundCount === count ? "selected" : ""} onClick={() => changeCount(count)} disabled={isGenerating}><strong>{count}</strong><small>words</small></button>)}</div>
          </section>

          <section className="setup-section">
            <div className="setup-section-title"><span>3</span><div><h2>Review your words</h2><p>Every generated word and clue is editable.</p></div><button type="button" className="sample-button" onClick={() => generateWords(topic, roundCount)} disabled={isGenerating}>{isGenerating ? "Generating…" : "Generate a new set"}</button></div>
            <div className={`generation-note ${isGenerating ? "loading" : ""}`} role="status"><span>{isGenerating ? "✦" : "✓"}</span>{generationNote}</div>
            <div className="word-entry-grid">{entries.map((entry, index) => <div className="word-entry" key={index}><span className="entry-number">{index + 1}</span><label><small>WORD</small><input id={`word-${index}`} value={entry.answer} onChange={(event) => updateEntry(index, "answer", event.target.value)} placeholder="EXAMPLE: ELEPHANT" disabled={isGenerating} /></label><label className="clue-field"><small>CLUE (OPTIONAL)</small><input value={entry.hint} onChange={(event) => updateEntry(index, "hint", event.target.value)} placeholder="Write a short clue" disabled={isGenerating} /></label></div>)}</div>
          </section>

          <section className="setup-section">
            <div className="setup-section-title"><span>4</span><div><h2>Choose the pictures</h2><p>Select how the visual clue should appear.</p></div></div>
            <div className="image-options">
              <label className={imageMode === "included" ? "selected" : ""}><input type="radio" name="imageMode" checked={imageMode === "included"} onChange={() => setImageMode("included")} /><span className="option-icon">🎨</span><span><strong>Instant visual cards</strong><small>Fast and free. Uses the included art or a playful emoji card.</small></span><b>Recommended</b></label>
              <label className={imageMode === "ai" ? "selected" : ""}><input type="radio" name="imageMode" checked={imageMode === "ai"} onChange={() => setImageMode("ai")} /><span className="option-icon">✨</span><span><strong>AI-generated images</strong><small>Created with Cloudflare Workers AI and reused from the cache when available.</small></span></label>
            </div>
          </section>

          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="setup-footer"><span>{roundCount} rounds • {WORD_TOPICS.find((item) => item.id === topic)?.label} • {imageMode === "ai" ? "AI images" : "Instant visuals"}</span><button className="primary-button" type="submit" disabled={isGenerating}>Start game <span>→</span></button></div>
        </form>
      </main>
    </div>
  );
}

function Game({ gamePuzzles, imageMode, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pool, setPool] = useState(() => buildPool(gamePuzzles[0]));
  const [slots, setSlots] = useState(() => initSlots(gamePuzzles[0]));
  const [status, setStatus] = useState("playing");
  const [showHint, setShowHint] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);
  const [showComplete, setShowComplete] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [generatedImages, setGeneratedImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const wrongTimers = useRef({});
  const requestedImages = useRef(new Set());
  const puzzle = gamePuzzles[currentIdx];

  useEffect(() => {
    Object.values(wrongTimers.current).forEach(clearTimeout);
    wrongTimers.current = {};
    setPool(buildPool(puzzle));
    setSlots(initSlots(puzzle));
    setStatus("playing");
    setShowHint(false);
  }, [currentIdx, puzzle]);

  useEffect(() => {
    if (status !== "playing" || !slots.every((slot) => slot.letter) || slots.some((slot) => slot.wrong)) return;
    if (slots.map((slot) => slot.letter).join("") === puzzle.answer) {
      setStatus("correct");
      setCompletedIds((current) => [...new Set([...current, puzzle.id])]);
      const pieces = Array.from({ length: 50 }, (_, id) => ({ id, x: Math.random() * 100, color: ["#FDD835", "#43A047", "#1565C0", "#E53935", "#FB8C00"][id % 5], delay: Math.random() * 0.7, drift: (Math.random() - 0.5) * 120 }));
      setConfetti(pieces);
      const timer = setTimeout(() => setConfetti([]), 2800);
      return () => clearTimeout(timer);
    }
  }, [slots, status, puzzle]);

  useEffect(() => {
    if (imageMode !== "ai") return;
    const candidates = [puzzle, gamePuzzles[currentIdx + 1]].filter(Boolean);
    candidates.forEach(async (candidate) => {
      if (requestedImages.current.has(candidate.id)) return;
      requestedImages.current.add(candidate.id);
      setLoadingImages((current) => ({ ...current, [candidate.id]: true }));
      try {
        const imageParams = new URLSearchParams({ word: candidate.answer, clue: candidate.hint, topic: candidate.topic });
        const response = await fetch(`/api/generate-image?${imageParams}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "The image could not be generated.");
        setGeneratedImages((current) => ({ ...current, [candidate.id]: data.image }));
      } catch (error) {
        setImageErrors((current) => ({ ...current, [candidate.id]: error.message }));
      } finally {
        setLoadingImages((current) => ({ ...current, [candidate.id]: false }));
      }
    });
  }, [currentIdx, gamePuzzles, imageMode, puzzle]);

  function handlePoolClick(item) {
    if (item.used || status !== "playing") return;
    const emptyIdx = slots.findIndex((slot) => !slot.locked && !slot.letter);
    if (emptyIdx === -1) return;
    const isWrong = item.letter !== puzzle.answer[emptyIdx];
    setSlots((current) => current.map((slot, index) => index === emptyIdx ? { ...slot, letter: item.letter, poolId: item.id, wrong: isWrong } : slot));
    setPool((current) => current.map((poolItem) => poolItem.id === item.id ? { ...poolItem, used: true } : poolItem));
    if (isWrong) wrongTimers.current[emptyIdx] = setTimeout(() => {
      setSlots((current) => current.map((slot, index) => index === emptyIdx ? { ...slot, letter: null, poolId: null, wrong: false } : slot));
      setPool((current) => current.map((poolItem) => poolItem.id === item.id ? { ...poolItem, used: false } : poolItem));
      delete wrongTimers.current[emptyIdx];
    }, 800);
  }

  function handleSlotClick(slot) {
    if (slot.locked || !slot.letter || status !== "playing") return;
    clearTimeout(wrongTimers.current[slot.index]);
    delete wrongTimers.current[slot.index];
    setPool((current) => current.map((item) => item.id === slot.poolId ? { ...item, used: false } : item));
    setSlots((current) => current.map((item) => item.index === slot.index ? { ...item, letter: null, poolId: null, wrong: false } : item));
  }

  function clearAnswer() {
    Object.values(wrongTimers.current).forEach(clearTimeout);
    wrongTimers.current = {};
    setSlots((current) => current.map((slot) => slot.locked ? slot : { ...slot, letter: null, poolId: null, wrong: false }));
    setPool((current) => current.map((item) => ({ ...item, used: false })));
  }

  function goTo(index) {
    if (index >= 0 && index < gamePuzzles.length) setCurrentIdx(index);
  }

  const displayImage = generatedImages[puzzle.id] || (imageMode === "included" ? puzzle.image : null);

  return (
    <div className="game-page">
      {confetti.map((piece) => <i key={piece.id} className="confetti-piece" style={{ left: `${piece.x}%`, background: piece.color, animationDelay: `${piece.delay}s`, "--drift": `${piece.drift}px` }} />)}
      <header className="game-header"><button className="game-home" onClick={onExit}>← Games</button><Brand compact /><div className="header-score"><strong>{completedIds.length}</strong><span>/ {gamePuzzles.length} Done</span></div></header>
      <div className="progress-track"><span style={{ width: `${(completedIds.length / gamePuzzles.length) * 100}%` }} /></div>
      <main className="game-layout">
        <section className="game-left">
          <div className="puzzle-label-top"><span className="label-badge">{currentIdx + 1} / {gamePuzzles.length}</span><span className="label-text">Which word matches the clue?</span></div>
          <div className="image-card">
            {displayImage ? <Image src={displayImage} alt={puzzle.emojiLabel} className="puzzle-img" fill sizes="(max-width: 850px) 100vw, 52vw" unoptimized /> : loadingImages[puzzle.id] ? <div className="generating-scene"><span className="sparkle-loader">✦</span><strong>AI is drawing…</strong><small>This can take up to two minutes.</small></div> : <div className="emoji-scene"><div className="emoji-big">{puzzle.emoji}</div><div className="emoji-caption">{puzzle.emojiLabel}</div>{imageErrors[puzzle.id] && <small className="image-error">AI unavailable—we used the visual card instead.</small>}</div>}
            {status === "correct" && <div className="image-overlay-win"><div className="win-check">✓</div><div className="win-label">{puzzle.answer}</div></div>}
          </div>
          <p className="puzzle-desc">{puzzle.description}</p>
          <div className="nav-arrows desktop-nav"><button className="nav-btn" onClick={() => goTo(currentIdx - 1)} disabled={!currentIdx}>← Previous</button><button className="nav-btn" onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === gamePuzzles.length - 1}>Next →</button></div>
        </section>

        <section className="game-right">
          <div className="right-section"><div className="section-label">Fill in the blanks</div><div className={`slots-row ${puzzle.answer.length > 10 ? "slots-compact" : ""}`}>{slots.map((slot) => <button key={slot.index} className={`slot ${slot.letter ? "slot-filled" : "slot-empty"} ${slot.locked ? "slot-locked" : ""} ${slot.wrong ? "slot-wrong" : ""} ${status === "correct" ? "slot-win" : ""}`} onClick={() => handleSlotClick(slot)}>{slot.letter || ""}</button>)}</div><div className="slot-hint-text">Yellow tiles are free letters • Click a placed letter to remove it</div></div>
          {status === "correct" && <div className="status-correct">🌟 Correct! Great job! 🌟</div>}
          {showHint && <div className="hint-box">💡 {puzzle.hint}</div>}
          <div className="right-section"><div className="section-label">Choose a letter</div><div className="pool-row">{pool.map((item) => <button key={item.id} className={`pool-btn ${item.used ? "pool-used" : ""}`} onClick={() => handlePoolClick(item)} disabled={item.used || status === "correct"}>{item.letter}</button>)}</div></div>
          <div className="actions"><button className="btn-action btn-clear" onClick={clearAnswer} disabled={status === "correct"}>Clear</button><button className="btn-action btn-hint" onClick={() => setShowHint((current) => !current)}>{showHint ? "Hide clue" : "Show clue"}</button>{status === "correct" && <button className="btn-action btn-next" onClick={() => currentIdx < gamePuzzles.length - 1 ? goTo(currentIdx + 1) : setShowComplete(true)}>{currentIdx < gamePuzzles.length - 1 ? "Next →" : "Finish"}</button>}</div>
          <div className="nav-arrows mobile-nav"><button className="nav-btn" onClick={() => goTo(currentIdx - 1)} disabled={!currentIdx}>← Previous</button><button className="nav-btn" onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === gamePuzzles.length - 1}>Next →</button></div>
        </section>
      </main>

      {showComplete && <div className="modal-overlay"><div className="modal"><div className="modal-trophy">🏆</div><span className="eyebrow">GAME COMPLETE</span><h2>Excellent work!</h2><p>You completed {completedIds.length} out of {gamePuzzles.length} words.</p><div className="result-score"><strong>{completedIds.length}</strong><span>correct answers</span></div><div className="modal-actions"><button className="secondary-button" onClick={onExit}>Games</button><button className="primary-button" onClick={() => { setShowComplete(false); setCurrentIdx(0); setCompletedIds([]); }}>Play again</button></div></div></div>}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [gamePuzzles, setGamePuzzles] = useState(() => starterPuzzles.map(preparePuzzle));
  const [imageMode, setImageMode] = useState("included");
  const app = useMemo(() => {
    if (screen === "setup") return <GameSetup onBack={() => setScreen("dashboard")} onStart={(nextPuzzles, mode) => { setGamePuzzles(nextPuzzles); setImageMode(mode); setScreen("game"); }} />;
    if (screen === "game") return <Game gamePuzzles={gamePuzzles} imageMode={imageMode} onExit={() => setScreen("dashboard")} />;
    return <Dashboard onSelectGame={() => setScreen("setup")} />;
  }, [screen, gamePuzzles, imageMode]);
  return app;
}
