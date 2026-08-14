import { useState, useEffect, useRef } from "react";
import { puzzles } from "./puzzles";
import "./App.css";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(puzzle) {
  const answer = puzzle.answer.split("");
  const all = shuffle([...answer, ...puzzle.poolExtra]);
  return all.map((letter, i) => ({ id: i, letter, used: false }));
}

function initSlots(puzzle) {
  return puzzle.answer.split("").map((ch, i) => ({
    index: i,
    letter: puzzle.revealed.includes(i) ? ch : null,
    locked: puzzle.revealed.includes(i),
    poolId: null,
    wrong: false,   // ← live validation state
  }));
}

export default function App() {
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [pool, setPool]                 = useState(() => buildPool(puzzles[0]));
  const [slots, setSlots]               = useState(() => initSlots(puzzles[0]));
  const [status, setStatus]             = useState("playing"); // playing | correct
  const [showHint, setShowHint]         = useState(false);
  const [completedIds, setCompletedIds] = useState([]);
  const [showComplete, setShowComplete] = useState(false);
  const [confetti, setConfetti]         = useState([]);
  const wrongTimers = useRef({});

  const puzzle = puzzles[currentIdx];

  // Reset on puzzle change
  useEffect(() => {
    // Clear any pending wrong timers
    Object.values(wrongTimers.current).forEach(clearTimeout);
    wrongTimers.current = {};
    setPool(buildPool(puzzle));
    setSlots(initSlots(puzzle));
    setStatus("playing");
    setShowHint(false);
  }, [currentIdx]);

  // Check for full correct answer
  useEffect(() => {
    if (status !== "playing") return;
    const allFilled = slots.every((s) => s.letter !== null);
    if (!allFilled) return;
    const anyWrong = slots.some((s) => s.wrong);
    if (anyWrong) return;
    const attempt = slots.map((s) => s.letter).join("");
    if (attempt === puzzle.answer) {
      setStatus("correct");
      spawnConfetti();
      setCompletedIds((prev) => [...new Set([...prev, puzzle.id])]);
    }
  }, [slots, status]);

  function spawnConfetti() {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#FDD835","#43A047","#1565C0","#E53935","#FB8C00","#9C27B0","#00BCD4"][i % 7],
      delay: Math.random() * 0.7,
      size: 7 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 120,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2800);
  }

  function handlePoolClick(item) {
    if (item.used || status !== "playing") return;

    // Find first empty non-locked slot
    const emptyIdx = slots.findIndex((s) => !s.locked && s.letter === null);
    if (emptyIdx === -1) return;

    // ── Live validation ──────────────────────────────────
    const correctLetter = puzzle.answer[emptyIdx];
    const isWrong = item.letter !== correctLetter;

    setSlots((prev) =>
      prev.map((s, i) =>
        i === emptyIdx
          ? { ...s, letter: item.letter, poolId: item.id, wrong: isWrong }
          : s
      )
    );
    setPool((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, used: true } : p))
    );

    // If wrong: flash red, then auto-remove after 900ms
    if (isWrong) {
      const timer = setTimeout(() => {
        setSlots((prev) =>
          prev.map((s, i) =>
            i === emptyIdx ? { ...s, letter: null, poolId: null, wrong: false } : s
          )
        );
        setPool((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, used: false } : p))
        );
        delete wrongTimers.current[emptyIdx];
      }, 900);
      wrongTimers.current[emptyIdx] = timer;
    }
  }

  function handleSlotClick(slot) {
    if (slot.locked || slot.letter === null || status !== "playing") return;
    // Cancel any pending wrong timer for this slot
    if (wrongTimers.current[slot.index]) {
      clearTimeout(wrongTimers.current[slot.index]);
      delete wrongTimers.current[slot.index];
    }
    setPool((prev) =>
      prev.map((p) => (p.id === slot.poolId ? { ...p, used: false } : p))
    );
    setSlots((prev) =>
      prev.map((s) =>
        s.index === slot.index ? { ...s, letter: null, poolId: null, wrong: false } : s
      )
    );
  }

  function handleClear() {
    Object.values(wrongTimers.current).forEach(clearTimeout);
    wrongTimers.current = {};
    setSlots((prev) => prev.map((s) => s.locked ? s : { ...s, letter: null, poolId: null, wrong: false }));
    setPool((prev) => prev.map((p) => ({ ...p, used: false })));
  }

  function goTo(idx) {
    if (idx >= 0 && idx < puzzles.length) setCurrentIdx(idx);
  }

  return (
    <div className="app">
      {confetti.map((c) => (
        <div key={c.id} className="confetti-piece" style={{
          left: `${c.x}%`, background: c.color,
          width: c.size, height: c.size,
          animationDelay: `${c.delay}s`,
          "--drift": `${c.drift}px`,
        }} />
      ))}

      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo">
          <span className="logo-flag">🇵🇭</span>
          <div>
            <div className="logo-title">GMRC</div>
            <div className="logo-sub">Hula ang Salita</div>
          </div>
        </div>
        <div className="progress-pills">
          {puzzles.map((p, i) => (
            <button key={p.id}
              className={`pill ${i === currentIdx ? "pill-active" : ""} ${completedIds.includes(p.id) ? "pill-done" : ""}`}
              onClick={() => goTo(i)} title={p.answer}>
              {completedIds.includes(p.id) ? "✓" : i + 1}
            </button>
          ))}
        </div>
        <div className="header-score">
          <span className="score-num">{completedIds.length}</span>
          <span className="score-label">/ {puzzles.length} Tapos</span>
        </div>
      </header>

      {/* ── Main layout ── */}
      <main className="game-layout">

        {/* LEFT: Image */}
        <div className="game-left">
          <div className="puzzle-label-top">
            <span className="label-badge">{currentIdx + 1} / {puzzles.length}</span>
            <span className="label-text">Ano ang katangian ng batang ito?</span>
          </div>
          <div className="image-card">
            {puzzle.image ? (
              <img src={puzzle.image} alt={puzzle.emojiLabel} className="puzzle-img" />
            ) : (
              <div className="emoji-scene">
                <div className="emoji-big">{puzzle.emoji}</div>
                <div className="emoji-caption">{puzzle.emojiLabel}</div>
              </div>
            )}
            {status === "correct" && (
              <div className="image-overlay-win">
                <div className="win-check">✓</div>
                <div className="win-label">{puzzle.answer}</div>
              </div>
            )}
          </div>
          <p className="puzzle-desc">{puzzle.description}</p>
          <div className="nav-arrows">
            <button className="nav-btn" onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0}>← Nakaraan</button>
            <button className="nav-btn nav-btn-right" onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === puzzles.length - 1}>Susunod →</button>
          </div>
        </div>

        {/* RIGHT: Word + Pool */}
        <div className="game-right">

          {/* Slots */}
          <div className="right-section">
            <div className="section-label">Punan ang mga patlang:</div>
            <div className={`slots-row ${status === "correct" ? "slots-correct" : ""}`}>
              {slots.map((slot) => (
                <button key={slot.index}
                  className={[
                    "slot",
                    slot.letter  ? "slot-filled"  : "slot-empty",
                    slot.locked  ? "slot-locked"  : "",
                    slot.wrong   ? "slot-wrong"   : "",
                    status === "correct" ? "slot-win" : "",
                  ].join(" ").trim()}
                  onClick={() => handleSlotClick(slot)}>
                  {slot.letter || ""}
                </button>
              ))}
            </div>
            <div className="slot-hint-text">
              🟡 Dilaw = tulong &nbsp;|&nbsp; I-click ang letra para burahin
            </div>
          </div>

          {/* Status */}
          {status === "correct" && (
            <div className="status-msg status-correct">🌟 Tama! Napakahusay! 🌟</div>
          )}

          {/* Hint */}
          {showHint && (
            <div className="hint-box">💡 {puzzle.hint}</div>
          )}

          {/* Pool */}
          <div className="right-section">
            <div className="section-label">Pumili ng letra:</div>
            <div className="pool-row">
              {pool.map((item) => (
                <button key={item.id}
                  className={`pool-btn ${item.used ? "pool-used" : ""}`}
                  onClick={() => handlePoolClick(item)}
                  disabled={item.used || status === "correct"}>
                  {item.letter}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button className="btn-action btn-clear" onClick={handleClear} disabled={status === "correct"}>
              🗑 Burahin
            </button>
            <button className="btn-action btn-hint" onClick={() => setShowHint((h) => !h)}>
              {showHint ? "🙈 Itago" : "💡 Tulong"}
            </button>
            {status === "correct" && currentIdx < puzzles.length - 1 && (
              <button className="btn-action btn-next" onClick={() => goTo(currentIdx + 1)}>
                Susunod ➡
              </button>
            )}
            {status === "correct" && currentIdx === puzzles.length - 1 && (
              <button className="btn-action btn-next" onClick={() => setShowComplete(true)}>
                🏁 Tapos Na!
              </button>
            )}
          </div>

          {/* Mobile nav */}
          <div className="nav-arrows nav-mobile">
            <button className="nav-btn" onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0}>← Nakaraan</button>
            <button className="nav-btn nav-btn-right" onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === puzzles.length - 1}>Susunod →</button>
          </div>
        </div>
      </main>

      {/* ── Completion modal ── */}
      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-trophy">🏆</div>
            <h2 className="modal-title">Napakagaling!</h2>
            <p className="modal-sub">Natapos mo ang lahat ng larawan!</p>
            <div className="modal-answers">
              {puzzles.map((p) => (
                <div key={p.id} className="modal-row">
                  <span className="modal-num">{p.id}</span>
                  <span className="modal-em">{p.emoji}</span>
                  <span className="modal-word">{p.answer}</span>
                </div>
              ))}
            </div>
            <button className="btn-action btn-next" onClick={() => {
              setShowComplete(false); setCurrentIdx(0); setCompletedIds([]);
            }}>🔄 Maglaro Ulit</button>
          </div>
        </div>
      )}
    </div>
  );
}
