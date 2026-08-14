"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { puzzles as starterPuzzles } from "./puzzles";

const SAMPLE_WORDS = [
  ...starterPuzzles,
  { answer: "MAGALANG", hint: "Gumagamit ng po at opo.", emoji: "🙏", emojiLabel: "Batang magalang" },
  { answer: "MATAPAT", hint: "Nagsasabi ng totoo kahit mahirap.", emoji: "🤝", emojiLabel: "Batang nagsasabi ng totoo" },
  { answer: "MABAIT", hint: "Maayos at may malasakit sa kapwa.", emoji: "💛", emojiLabel: "Batang may mabuting puso" },
  { answer: "MASUNURIN", hint: "Nakikinig at sumusunod sa tamang payo.", emoji: "👂", emojiLabel: "Batang nakikinig" },
  { answer: "MARESPETO", hint: "Iginagalang ang kapwa sa salita at gawa.", emoji: "🌻", emojiLabel: "Batang may respeto" },
  { answer: "MATAPANG", hint: "Humaharap sa hamon nang may lakas ng loob.", emoji: "🦁", emojiLabel: "Batang matapang" },
  { answer: "MAALAGA", hint: "Inaalagaan ang tao, hayop, at kalikasan.", emoji: "🌱", emojiLabel: "Batang maalaga" },
  { answer: "MAPAGMAHAL", hint: "Nagpapakita ng pagmamahal sa pamilya at kapwa.", emoji: "❤️", emojiLabel: "Batang mapagmahal" },
  { answer: "MATIPID", hint: "Marunong gumamit at mag-ipon nang wasto.", emoji: "🐷", emojiLabel: "Batang nag-iimpok" },
  { answer: "MALINIS", hint: "Pinananatiling maayos ang sarili at paligid.", emoji: "✨", emojiLabel: "Batang malinis" },
];

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
  return value.toLocaleUpperCase("fil-PH").replace(/[^A-ZÑ]/g, "").slice(0, 14);
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
    emojiLabel: entry.emojiLabel || `Larawang nagpapakita ng pagiging ${answer.toLocaleLowerCase("fil-PH")}`,
    hint: entry.hint?.trim() || `Isipin ang kahulugan ng salitang ${answer}.`,
    description: entry.description?.trim() || "Anong magandang katangian ang ipinapakita sa larawan?",
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
      <span><strong>Tuklas</strong><small>Matuto. Maglaro. Umunlad.</small></span>
    </div>
  );
}

function Dashboard({ onSelectGame }) {
  return (
    <div className="platform-page">
      <nav className="platform-nav">
        <Brand />
        <div className="nav-profile"><span>Magandang araw!</span><span className="avatar">JL</span></div>
      </nav>

      <main className="dashboard-shell">
        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="eyebrow">ANG IYONG LEARNING SPACE</span>
            <h1>Matuto sa bawat <em>laro.</em></h1>
            <p>Pumili ng gawain, subukan ang iyong kaalaman, at gawing mas masaya ang bawat aralin.</p>
            <button className="primary-button" onClick={onSelectGame}>Simulan ang unang laro <span>→</span></button>
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
          <div className="section-heading"><div><span className="eyebrow">MGA LARO</span><h2>Ano ang gusto mong laruin?</h2></div><span className="game-count">1 laro ngayon</span></div>
          <div className="game-grid">
            <article className="game-card featured-game" onClick={onSelectGame}>
              <div className="game-visual word-visual"><span className="letter-tile">M</span><span className="letter-tile">A</span><span className="letter-tile">B</span><span className="letter-tile">A</span><span className="letter-tile">I</span></div>
              <div className="game-card-body">
                <div className="card-tags"><span>GMRC</span><span>Mga Salita</span></div>
                <h3>Hula ang Salita</h3>
                <p>Tukuyin ang magandang katangian sa larawan at buuin ang tamang salita.</p>
                <button className="card-play">Maglaro <span>→</span></button>
              </div>
            </article>

            <article className="game-card coming-card">
              <div className="game-visual sequence-visual"><span>1</span><i>→</i><span>2</span><i>→</i><span>3</span></div>
              <div className="game-card-body"><div className="card-tags"><span>Logic</span></div><h3>Ayusin ang Kuwento</h3><p>Ilagay sa tamang pagkakasunod-sunod ang mga pangyayari.</p><span className="soon-label">Parating na</span></div>
            </article>

            <article className="game-card coming-card">
              <div className="game-visual match-visual"><span>🍎</span><i>↔</i><span>A</span></div>
              <div className="game-card-body"><div className="card-tags"><span>Memory</span></div><h3>Hanapin ang Magkapareha</h3><p>Pagparesin ang larawan at salitang may kaugnayan dito.</p><span className="soon-label">Parating na</span></div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

function GameSetup({ onBack, onStart }) {
  const [roundCount, setRoundCount] = useState(5);
  const [imageMode, setImageMode] = useState("included");
  const [entries, setEntries] = useState(() => SAMPLE_WORDS.slice(0, 5).map((item) => ({ answer: item.answer, hint: item.hint })));
  const [error, setError] = useState("");

  function changeCount(count) {
    setRoundCount(count);
    setEntries((current) => Array.from({ length: count }, (_, index) => current[index] || { answer: "", hint: "" }));
    setError("");
  }

  function updateEntry(index, field, value) {
    setEntries((current) => current.map((entry, entryIndex) => entryIndex === index
      ? { ...entry, [field]: field === "answer" ? normalizeWord(value) : value.slice(0, 100) }
      : entry));
  }

  function fillSamples() {
    setEntries(SAMPLE_WORDS.slice(0, roundCount).map((item) => ({ answer: item.answer, hint: item.hint })));
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    const missing = entries.findIndex((entry) => !entry.answer.trim());
    if (missing !== -1) {
      setError(`Lagyan ng salita ang bilang ${missing + 1}.`);
      document.getElementById(`word-${missing}`)?.focus();
      return;
    }
    onStart(entries.map((entry, index) => {
      const sample = SAMPLE_WORDS.find((item) => item.answer === entry.answer);
      return preparePuzzle({ ...sample, ...entry }, index);
    }), imageMode);
  }

  return (
    <div className="platform-page setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Bumalik</button><Brand compact /><span className="nav-step">Ihanda ang laro</span></nav>
      <main className="setup-shell">
        <header className="setup-intro"><span className="eyebrow">HULA ANG SALITA</span><h1>Bumuo ng sariling laro</h1><p>Piliin ang haba, ilagay ang mga sagot, at kami na ang maghahanda ng bawat palaisipan.</p></header>

        <form onSubmit={submit}>
          <section className="setup-section">
            <div className="setup-section-title"><span>1</span><div><h2>Ilang salita?</h2><p>Piliin ang bilang ng rounds.</p></div></div>
            <div className="count-options">{[5, 10, 15].map((count) => <button type="button" key={count} className={roundCount === count ? "selected" : ""} onClick={() => changeCount(count)}><strong>{count}</strong><small>salita</small></button>)}</div>
          </section>

          <section className="setup-section">
            <div className="setup-section-title"><span>2</span><div><h2>Ilagay ang mga salita</h2><p>Ang clue ay optional—gagawa pa rin ang laro kahit salita lang ang ilagay.</p></div><button type="button" className="sample-button" onClick={fillSamples}>Gamitin ang samples</button></div>
            <div className="word-entry-grid">{entries.map((entry, index) => <div className="word-entry" key={index}><span className="entry-number">{index + 1}</span><label><small>SALITA</small><input id={`word-${index}`} value={entry.answer} onChange={(event) => updateEntry(index, "answer", event.target.value)} placeholder="HAL. MAGALANG" /></label><label className="clue-field"><small>CLUE (OPTIONAL)</small><input value={entry.hint} onChange={(event) => updateEntry(index, "hint", event.target.value)} placeholder="Maikling pahiwatig" /></label></div>)}</div>
          </section>

          <section className="setup-section">
            <div className="setup-section-title"><span>3</span><div><h2>Mga larawan</h2><p>Piliin kung paano ipapakita ang visual clue.</p></div></div>
            <div className="image-options">
              <label className={imageMode === "included" ? "selected" : ""}><input type="radio" name="imageMode" checked={imageMode === "included"} onChange={() => setImageMode("included")} /><span className="option-icon">🎨</span><span><strong>Kasamang illustrations</strong><small>Mabilis at libre. Gagamit ng existing art o playful visual card.</small></span><b>Recommended</b></label>
              <label className={imageMode === "ai" ? "selected" : ""}><input type="radio" name="imageMode" checked={imageMode === "ai"} onChange={() => setImageMode("ai")} /><span className="option-icon">✨</span><span><strong>AI-generated images</strong><small>Gagawa habang naglalaro. Kailangan ng OpenAI API key at paid API credits.</small></span></label>
            </div>
          </section>

          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="setup-footer"><span>{roundCount} rounds • {imageMode === "ai" ? "AI images" : "Instant illustrations"}</span><button className="primary-button" type="submit">Ihanda ang laro <span>→</span></button></div>
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
        const response = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ word: candidate.answer, clue: candidate.hint }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Hindi nagawa ang larawan.");
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
      <header className="game-header"><button className="game-home" onClick={onExit}>← Mga laro</button><Brand compact /><div className="header-score"><strong>{completedIds.length}</strong><span>/ {gamePuzzles.length} Tapos</span></div></header>
      <div className="progress-track"><span style={{ width: `${(completedIds.length / gamePuzzles.length) * 100}%` }} /></div>
      <main className="game-layout">
        <section className="game-left">
          <div className="puzzle-label-top"><span className="label-badge">{currentIdx + 1} / {gamePuzzles.length}</span><span className="label-text">Ano ang katangian ng batang ito?</span></div>
          <div className="image-card">
            {displayImage ? <Image src={displayImage} alt={puzzle.emojiLabel} className="puzzle-img" fill sizes="(max-width: 850px) 100vw, 52vw" unoptimized={displayImage.startsWith("data:")} /> : loadingImages[puzzle.id] ? <div className="generating-scene"><span className="sparkle-loader">✦</span><strong>Gumuguhit ang AI…</strong><small>Maaaring tumagal nang hanggang 2 minuto.</small></div> : <div className="emoji-scene"><div className="emoji-big">{puzzle.emoji}</div><div className="emoji-caption">{puzzle.emojiLabel}</div>{imageErrors[puzzle.id] && <small className="image-error">AI unavailable—ginamit ang visual card.</small>}</div>}
            {status === "correct" && <div className="image-overlay-win"><div className="win-check">✓</div><div className="win-label">{puzzle.answer}</div></div>}
          </div>
          <p className="puzzle-desc">{puzzle.description}</p>
          <div className="nav-arrows desktop-nav"><button className="nav-btn" onClick={() => goTo(currentIdx - 1)} disabled={!currentIdx}>← Nakaraan</button><button className="nav-btn" onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === gamePuzzles.length - 1}>Susunod →</button></div>
        </section>

        <section className="game-right">
          <div className="right-section"><div className="section-label">Punan ang mga patlang</div><div className={`slots-row ${puzzle.answer.length > 10 ? "slots-compact" : ""}`}>{slots.map((slot) => <button key={slot.index} className={`slot ${slot.letter ? "slot-filled" : "slot-empty"} ${slot.locked ? "slot-locked" : ""} ${slot.wrong ? "slot-wrong" : ""} ${status === "correct" ? "slot-win" : ""}`} onClick={() => handleSlotClick(slot)}>{slot.letter || ""}</button>)}</div><div className="slot-hint-text">Dilaw = libreng letra • I-click ang letra para burahin</div></div>
          {status === "correct" && <div className="status-correct">🌟 Tama! Napakahusay! 🌟</div>}
          {showHint && <div className="hint-box">💡 {puzzle.hint}</div>}
          <div className="right-section"><div className="section-label">Pumili ng letra</div><div className="pool-row">{pool.map((item) => <button key={item.id} className={`pool-btn ${item.used ? "pool-used" : ""}`} onClick={() => handlePoolClick(item)} disabled={item.used || status === "correct"}>{item.letter}</button>)}</div></div>
          <div className="actions"><button className="btn-action btn-clear" onClick={clearAnswer} disabled={status === "correct"}>Burahin</button><button className="btn-action btn-hint" onClick={() => setShowHint((current) => !current)}>{showHint ? "Itago ang clue" : "Humingi ng clue"}</button>{status === "correct" && <button className="btn-action btn-next" onClick={() => currentIdx < gamePuzzles.length - 1 ? goTo(currentIdx + 1) : setShowComplete(true)}>{currentIdx < gamePuzzles.length - 1 ? "Susunod →" : "Tapos na!"}</button>}</div>
          <div className="nav-arrows mobile-nav"><button className="nav-btn" onClick={() => goTo(currentIdx - 1)} disabled={!currentIdx}>← Nakaraan</button><button className="nav-btn" onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === gamePuzzles.length - 1}>Susunod →</button></div>
        </section>
      </main>

      {showComplete && <div className="modal-overlay"><div className="modal"><div className="modal-trophy">🏆</div><span className="eyebrow">LARO AY TAPOS NA</span><h2>Napakagaling!</h2><p>Nabuo mo ang {completedIds.length} sa {gamePuzzles.length} salita.</p><div className="result-score"><strong>{completedIds.length}</strong><span>tamang sagot</span></div><div className="modal-actions"><button className="secondary-button" onClick={onExit}>Mga laro</button><button className="primary-button" onClick={() => { setShowComplete(false); setCurrentIdx(0); setCompletedIds([]); }}>Maglaro ulit</button></div></div></div>}
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
