"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LINE_TRACES = [
  { id: "straight", label: "Straight line", note: "Move steadily from left to right.", icon: "—", path: "M 78 180 L 522 180", target: 390 },
  { id: "curve", label: "Curved line", note: "Follow one smooth curve.", icon: "⌒", path: "M 72 242 C 190 72 410 72 528 242", target: 500 },
  { id: "loop", label: "Loopy line", note: "Travel around every loop.", icon: "➿", path: "M 55 205 C 95 80 185 80 225 205 C 265 330 355 330 395 205 C 435 80 505 80 545 205", target: 720 },
  { id: "wave", label: "Wavy line", note: "Keep the waves soft and even.", icon: "〰", path: "M 42 180 C 92 80 142 80 192 180 S 292 280 342 180 S 442 80 492 180 S 542 280 565 205", target: 760 },
  { id: "zigzag", label: "Zigzag", note: "Make sharp turns at every corner.", icon: "⚡", path: "M 45 260 L 145 90 L 245 260 L 345 90 L 445 260 L 555 90", target: 850 },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = "0123456789".split("");
const COLORS = ["#1559b7", "#35a85b", "#dc4444", "#8a4ec7"];

function makeCharacterItems(characters, letterCase = "uppercase") {
  return characters.map((character) => {
    const value = letterCase === "lowercase" ? character.toLocaleLowerCase("en-US") : character;
    return {
      id: `${letterCase}-${value}`,
      label: value,
      note: `Trace the ${/[0-9]/.test(value) ? "number" : `${letterCase} letter`} ${value}.`,
      character: value,
      target: 470,
    };
  });
}

function LinePreview({ item }) {
  return (
    <svg viewBox="0 0 600 360" aria-hidden="true">
      <path d={item.path} fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 18" />
    </svg>
  );
}

export function TracingSetup({ onBack, onStart, brand }) {
  const [category, setCategory] = useState("lines");
  const [letterCase, setLetterCase] = useState("uppercase");
  const [selectedId, setSelectedId] = useState("straight");

  const items = useMemo(() => {
    if (category === "letters") return makeCharacterItems(ALPHABET, letterCase);
    if (category === "numbers") return makeCharacterItems(NUMBERS, "number");
    return LINE_TRACES;
  }, [category, letterCase]);

  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedId));

  function changeCategory(nextCategory) {
    setCategory(nextCategory);
    if (nextCategory === "letters") setSelectedId(`${letterCase}-A`);
    else if (nextCategory === "numbers") setSelectedId("number-0");
    else setSelectedId("straight");
  }

  function changeCase(nextCase) {
    setLetterCase(nextCase);
    setSelectedId(`${nextCase}-${nextCase === "lowercase" ? "a" : "A"}`);
  }

  return (
    <div className="platform-page tracing-setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Back</button>{brand}<span className="nav-step">Tracing setup</span></nav>
      <main className="setup-shell tracing-setup-shell">
        <header className="setup-intro"><span className="eyebrow">TRACING PRACTICE</span><h1>What would you like to trace?</h1><p>Practice pencil control with patterns, letters, and numbers. Everything works with a mouse, stylus, or finger.</p></header>

        <section className="setup-section">
          <div className="setup-section-title"><span>1</span><div><h2>Choose a practice set</h2><p>Each set builds a different writing skill.</p></div></div>
          <div className="trace-category-options">
            <button className={category === "lines" ? "selected" : ""} onClick={() => changeCategory("lines")}><span>〰</span><strong>Lines</strong><small>Control and movement</small></button>
            <button className={category === "letters" ? "selected" : ""} onClick={() => changeCategory("letters")}><span>Aa</span><strong>Alphabet</strong><small>Letters A to Z</small></button>
            <button className={category === "numbers" ? "selected" : ""} onClick={() => changeCategory("numbers")}><span>123</span><strong>Numbers</strong><small>Numbers 0 to 9</small></button>
          </div>
        </section>

        <section className="setup-section">
          <div className="setup-section-title"><span>2</span><div><h2>Choose where to begin</h2><p>You can move through the rest of the set while playing.</p></div></div>
          {category === "letters" && <div className="trace-case-toggle" aria-label="Letter case"><button className={letterCase === "uppercase" ? "selected" : ""} onClick={() => changeCase("uppercase")}>Uppercase</button><button className={letterCase === "lowercase" ? "selected" : ""} onClick={() => changeCase("lowercase")}>Lowercase</button></div>}
          {category === "lines" ? (
            <div className="trace-pattern-grid">{items.map((item) => <button key={item.id} className={selectedId === item.id ? "selected" : ""} onClick={() => setSelectedId(item.id)}><LinePreview item={item} /><span><strong>{item.label}</strong><small>{item.note}</small></span></button>)}</div>
          ) : (
            <div className="trace-character-grid">{items.map((item) => <button key={item.id} className={selectedId === item.id ? "selected" : ""} onClick={() => setSelectedId(item.id)}>{item.label}</button>)}</div>
          )}
        </section>

        <div className="setup-footer"><span>{category === "lines" ? "5 line patterns" : category === "letters" ? `26 ${letterCase} letters` : "10 numbers"} • Starting with {items[selectedIndex]?.label}</span><button className="primary-button" onClick={() => onStart(items, selectedIndex)}>Start tracing <span>→</span></button></div>
      </main>
    </div>
  );
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function TracingBoard({ item, color, onProgress, resetKey }) {
  const svgRef = useRef(null);
  const activeStroke = useRef(null);
  const totalLength = useRef(0);
  const [strokes, setStrokes] = useState([]);

  function pointFromEvent(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 600, y: ((event.clientY - rect.top) / rect.height) * 360 };
  }

  function beginStroke(event) {
    event.preventDefault();
    svgRef.current.setPointerCapture(event.pointerId);
    const stroke = { id: `${Date.now()}-${event.pointerId}`, color, points: [pointFromEvent(event)] };
    activeStroke.current = stroke;
    setStrokes((current) => [...current, stroke]);
  }

  function moveStroke(event) {
    if (!activeStroke.current) return;
    event.preventDefault();
    const nextPoint = pointFromEvent(event);
    const points = activeStroke.current.points;
    const previousPoint = points[points.length - 1];
    const movement = distance(previousPoint, nextPoint);
    if (movement < 2) return;
    totalLength.current += movement;
    const nextStroke = { ...activeStroke.current, points: [...points, nextPoint] };
    activeStroke.current = nextStroke;
    setStrokes((current) => current.map((stroke) => stroke.id === nextStroke.id ? nextStroke : stroke));
    onProgress(Math.min(100, Math.round((totalLength.current / item.target) * 100)));
  }

  function endStroke(event) {
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
    activeStroke.current = null;
  }

  function undo() {
    setStrokes((current) => {
      const removed = current[current.length - 1];
      if (removed) totalLength.current = Math.max(0, totalLength.current - removed.points.slice(1).reduce((sum, point, index) => sum + distance(removed.points[index], point), 0));
      onProgress(Math.min(100, Math.round((totalLength.current / item.target) * 100)));
      return current.slice(0, -1);
    });
  }

  function clear() {
    activeStroke.current = null;
    totalLength.current = 0;
    setStrokes([]);
    onProgress(0);
  }

  useEffect(() => {
    activeStroke.current = null;
    totalLength.current = 0;
  }, [item.id, resetKey]);

  const userPaths = strokes.map((stroke) => ({ ...stroke, d: stroke.points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") }));

  return (
    <div className="tracing-board-wrap">
      <svg ref={svgRef} className="tracing-board" viewBox="0 0 600 360" role="img" aria-label={`Tracing guide for ${item.label}`} onPointerDown={beginStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke}>
        <rect width="600" height="360" rx="28" fill="#ffffff" />
        <path d="M 48 80 H 552 M 48 180 H 552 M 48 280 H 552" stroke="#edf3fa" strokeWidth="2" strokeDasharray="8 10" />
        {item.path ? <path d={item.path} className="trace-guide-path" /> : <text x="300" y="265" className="trace-guide-character">{item.character}</text>}
        {item.path && <><circle cx={item.path === LINE_TRACES[0].path ? 78 : item.id === "curve" ? 72 : item.id === "loop" ? 55 : item.id === "wave" ? 42 : 45} cy={item.id === "straight" ? 180 : item.id === "curve" ? 242 : item.id === "loop" ? 205 : item.id === "wave" ? 180 : 260} r="15" className="trace-start-dot" /><text x="34" y="52" className="trace-start-label">START</text></>}
        {userPaths.map((stroke) => <path key={stroke.id} d={stroke.d} fill="none" stroke={stroke.color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />)}
      </svg>
      <div className="tracing-board-tools"><button onClick={undo} disabled={!strokes.length}>↶ Undo</button><button onClick={clear} disabled={!strokes.length}>Clear all</button></div>
    </div>
  );
}

export function TracingGame({ items, startIndex, onExit, brand }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState(COLORS[0]);
  const [completed, setCompleted] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const item = items[currentIndex];
  const ready = progress >= 70;

  function goTo(index) {
    if (index < 0 || index >= items.length) return;
    setCurrentIndex(index);
    setProgress(0);
    setResetKey((current) => current + 1);
  }

  function finishItem() {
    if (!ready) return;
    setCompleted((current) => [...new Set([...current, item.id])]);
    if (currentIndex < items.length - 1) goTo(currentIndex + 1);
    else setShowComplete(true);
  }

  return (
    <div className="game-page tracing-game-page">
      <header className="game-header"><button className="game-home" onClick={onExit}>← Games</button>{brand}<div className="header-score"><strong>{completed.length}</strong><span>/ {items.length} Done</span></div></header>
      <div className="progress-track"><span style={{ width: `${(completed.length / items.length) * 100}%` }} /></div>
      <main className="tracing-game-shell">
        <section className="tracing-game-heading"><div><span className="eyebrow">TRACING PRACTICE</span><h1>{item.character ? `Trace ${item.label}` : item.label}</h1><p>{item.note} Start anywhere on the guide and trace it carefully.</p></div><div className={`trace-progress-orb ${ready ? "ready" : ""}`}><strong>{progress}%</strong><span>{ready ? "Ready!" : "Keep tracing"}</span></div></section>

        <TracingBoard key={`${item.id}-${resetKey}`} item={item} color={color} onProgress={setProgress} resetKey={resetKey} />

        <section className="tracing-controls">
          <div className="trace-colors"><span>Pencil color</span><div>{COLORS.map((choice) => <button key={choice} aria-label={`Use ${choice} pencil`} className={color === choice ? "selected" : ""} style={{ "--pencil-color": choice }} onClick={() => setColor(choice)} />)}</div></div>
          <div className="trace-navigation"><button className="secondary-button" onClick={() => goTo(currentIndex - 1)} disabled={!currentIndex}>← Previous</button><span>{currentIndex + 1} of {items.length}</span><button className="primary-button trace-finish-button" onClick={finishItem} disabled={!ready}>{currentIndex === items.length - 1 ? "Complete set" : "Done — Next →"}</button></div>
        </section>
        {!ready && <p className="trace-tip">Tip: cover more of the dotted guide to unlock the next activity.</p>}
      </main>
      {showComplete && <div className="modal-overlay"><div className="modal"><div className="modal-trophy">✍️</div><span className="eyebrow">SET COMPLETE</span><h2>Beautiful tracing!</h2><p>You practiced every item in this tracing set.</p><div className="result-score"><strong>{items.length}</strong><span>tracing activities</span></div><div className="modal-actions"><button className="secondary-button" onClick={onExit}>Games</button><button className="primary-button" onClick={() => { setShowComplete(false); setCompleted([]); goTo(0); }}>Practice again</button></div></div></div>}
    </div>
  );
}
