"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function level(type, label, number, path, start, target, instruction) {
  return { id: `${type}-${number}`, type, label, level: number, path, start, target, note: instruction };
}

const LINE_TYPES = [
  {
    id: "straight", label: "Straight lines", note: "Horizontal, vertical, and diagonal control.", previewPath: "M 78 180 L 522 180",
    levels: [
      level("straight", "Straight lines", 1, "M 95 180 L 505 180", { x: 95, y: 180 }, 360, "Trace one horizontal line."),
      level("straight", "Straight lines", 2, "M 300 55 L 300 305", { x: 300, y: 55 }, 220, "Trace one vertical line from top to bottom."),
      level("straight", "Straight lines", 3, "M 95 75 L 505 285", { x: 95, y: 75 }, 400, "Trace a diagonal line going down."),
      level("straight", "Straight lines", 4, "M 95 285 L 505 75", { x: 95, y: 285 }, 400, "Trace a diagonal line going up."),
      level("straight", "Straight lines", 5, "M 85 125 L 515 125 M 85 235 L 515 235", { x: 85, y: 125 }, 760, "Trace two horizontal lines."),
      level("straight", "Straight lines", 6, "M 215 55 L 215 305 M 385 55 L 385 305", { x: 215, y: 55 }, 430, "Trace two vertical lines."),
      level("straight", "Straight lines", 7, "M 80 270 L 275 75 M 325 75 L 520 270", { x: 80, y: 270 }, 500, "Trace two opposite diagonal lines."),
      level("straight", "Straight lines", 8, "M 75 85 L 245 255 M 355 255 L 525 85", { x: 75, y: 85 }, 430, "Trace two crossing directions."),
      level("straight", "Straight lines", 9, "M 75 90 L 525 90 M 75 180 L 525 180 M 75 270 L 525 270", { x: 75, y: 90 }, 1150, "Trace three even horizontal lines."),
      level("straight", "Straight lines", 10, "M 110 65 L 490 65 M 110 295 L 490 295 M 110 65 L 110 295 M 490 65 L 490 295", { x: 110, y: 65 }, 1050, "Trace all four sides of the box."),
    ],
  },
  {
    id: "curve", label: "Curved lines", note: "Gentle bends and changing directions.", previewPath: "M 72 242 C 190 72 410 72 528 242",
    levels: [
      level("curve", "Curved lines", 1, "M 80 240 Q 300 65 520 240", { x: 80, y: 240 }, 470, "Trace one upward curve."),
      level("curve", "Curved lines", 2, "M 80 105 Q 300 285 520 105", { x: 80, y: 105 }, 470, "Trace one downward curve."),
      level("curve", "Curved lines", 3, "M 95 55 Q 455 180 95 305", { x: 95, y: 55 }, 560, "Follow the curve from top to bottom."),
      level("curve", "Curved lines", 4, "M 505 55 Q 145 180 505 305", { x: 505, y: 55 }, 560, "Follow the reverse curve."),
      level("curve", "Curved lines", 5, "M 70 245 Q 205 70 300 245 Q 395 70 530 245", { x: 70, y: 245 }, 650, "Trace two connected arches."),
      level("curve", "Curved lines", 6, "M 70 110 Q 205 290 300 110 Q 395 290 530 110", { x: 70, y: 110 }, 650, "Trace two connected valleys."),
      level("curve", "Curved lines", 7, "M 65 250 C 155 55 235 55 300 180 C 365 305 445 305 535 110", { x: 65, y: 250 }, 700, "Trace a long changing curve."),
      level("curve", "Curved lines", 8, "M 70 180 C 150 45 245 45 300 180 C 355 315 450 315 530 180", { x: 70, y: 180 }, 720, "Trace a smooth S-shaped curve."),
      level("curve", "Curved lines", 9, "M 60 265 Q 160 45 260 265 Q 360 45 540 265", { x: 60, y: 265 }, 760, "Trace two tall curves."),
      level("curve", "Curved lines", 10, "M 55 270 C 115 40 205 40 265 180 C 325 320 415 320 545 80", { x: 55, y: 270 }, 800, "Complete the longest curved path."),
    ],
  },
  {
    id: "loop", label: "Loopy lines", note: "Round loops with smooth connections.", previewPath: "M 55 205 C 95 80 185 80 225 205 C 265 330 355 330 395 205 C 435 80 505 80 545 205",
    levels: [
      level("loop", "Loopy lines", 1, "M 105 210 C 105 65 285 65 285 210 C 285 315 155 315 105 210", { x: 105, y: 210 }, 520, "Trace one large loop."),
      level("loop", "Loopy lines", 2, "M 70 220 C 70 80 220 80 220 220 C 220 305 120 305 70 220 M 300 220 C 300 80 530 80 530 220", { x: 70, y: 220 }, 850, "Trace two separate loops."),
      level("loop", "Loopy lines", 3, "M 55 205 C 95 80 185 80 225 205 C 265 330 355 330 395 205", { x: 55, y: 205 }, 650, "Trace two connected loops."),
      level("loop", "Loopy lines", 4, "M 50 205 C 85 90 155 90 190 205 C 225 320 295 320 330 205 C 365 90 435 90 470 205", { x: 50, y: 205 }, 760, "Trace three connected loops."),
      level("loop", "Loopy lines", 5, "M 40 205 C 70 100 130 100 160 205 C 190 310 250 310 280 205 C 310 100 370 100 400 205 C 430 310 490 310 560 190", { x: 40, y: 205 }, 880, "Trace four connected loops."),
      level("loop", "Loopy lines", 6, "M 60 110 C 190 35 250 145 160 210 C 70 275 170 340 300 250", { x: 60, y: 110 }, 650, "Trace a loop that changes direction."),
      level("loop", "Loopy lines", 7, "M 70 180 C 70 60 240 60 240 180 C 240 300 70 300 70 180 C 70 60 240 60 300 180 C 360 300 530 300 530 180", { x: 70, y: 180 }, 1050, "Trace overlapping loops."),
      level("loop", "Loopy lines", 8, "M 50 225 C 80 70 170 70 200 225 C 230 330 300 330 330 225 C 360 70 450 70 550 220", { x: 50, y: 225 }, 900, "Trace tall and narrow loops."),
      level("loop", "Loopy lines", 9, "M 45 195 C 80 90 145 90 180 195 C 215 300 280 300 315 195 C 350 90 415 90 450 195 C 485 300 535 260 555 190", { x: 45, y: 195 }, 980, "Keep three loops even."),
      level("loop", "Loopy lines", 10, "M 35 205 C 65 90 120 90 150 205 C 180 320 235 320 265 205 C 295 90 350 90 380 205 C 410 320 465 320 495 205 C 525 90 555 125 565 205", { x: 35, y: 205 }, 1100, "Complete the longest loop pattern."),
    ],
  },
  {
    id: "wave", label: "Wavy lines", note: "Repeated waves with an even rhythm.", previewPath: "M 42 180 C 92 80 142 80 192 180 S 292 280 342 180 S 442 80 492 180 S 542 280 565 205",
    levels: [
      level("wave", "Wavy lines", 1, "M 70 180 C 175 65 260 65 330 180 C 400 295 485 295 535 180", { x: 70, y: 180 }, 580, "Trace one wide wave."),
      level("wave", "Wavy lines", 2, "M 55 180 C 115 80 175 80 235 180 S 355 280 415 180 S 515 80 550 150", { x: 55, y: 180 }, 700, "Trace two gentle waves."),
      level("wave", "Wavy lines", 3, "M 45 180 C 90 95 135 95 180 180 S 270 265 315 180 S 405 95 450 180 S 540 265 565 210", { x: 45, y: 180 }, 780, "Trace three even waves."),
      level("wave", "Wavy lines", 4, "M 40 180 C 75 105 110 105 145 180 S 215 255 250 180 S 320 105 355 180 S 425 255 460 180 S 530 105 560 165", { x: 40, y: 180 }, 860, "Trace four small waves."),
      level("wave", "Wavy lines", 5, "M 45 245 C 100 75 175 75 230 245 S 360 75 420 245 S 520 75 560 180", { x: 45, y: 245 }, 800, "Trace tall waves."),
      level("wave", "Wavy lines", 6, "M 45 130 C 105 285 175 285 235 130 S 365 285 425 130 S 525 285 560 210", { x: 45, y: 130 }, 820, "Trace upside-down waves."),
      level("wave", "Wavy lines", 7, "M 40 180 C 80 55 125 55 165 180 S 250 305 290 180 S 375 55 415 180 S 500 305 560 180", { x: 40, y: 180 }, 940, "Trace deep alternating waves."),
      level("wave", "Wavy lines", 8, "M 35 180 C 70 100 105 100 140 180 S 210 260 245 180 S 315 100 350 180 S 420 260 455 180 S 525 100 565 180", { x: 35, y: 180 }, 930, "Keep five waves the same size."),
      level("wave", "Wavy lines", 9, "M 35 235 C 85 40 145 40 195 235 S 305 40 355 235 S 465 40 565 235", { x: 35, y: 235 }, 980, "Trace three extra-tall waves."),
      level("wave", "Wavy lines", 10, "M 30 180 C 60 70 95 70 125 180 S 190 290 220 180 S 285 70 315 180 S 380 290 410 180 S 475 70 505 180 S 550 290 570 220", { x: 30, y: 180 }, 1080, "Complete the longest wave pattern."),
    ],
  },
  {
    id: "zigzag", label: "Zigzag lines", note: "Sharp corners and direction changes.", previewPath: "M 45 260 L 145 90 L 245 260 L 345 90 L 445 260 L 555 90",
    levels: [
      level("zigzag", "Zigzag lines", 1, "M 90 260 L 300 80 L 510 260", { x: 90, y: 260 }, 520, "Trace one large peak."),
      level("zigzag", "Zigzag lines", 2, "M 70 250 L 185 95 L 300 250 L 415 95 L 530 250", { x: 70, y: 250 }, 700, "Trace two large peaks."),
      level("zigzag", "Zigzag lines", 3, "M 55 250 L 135 100 L 215 250 L 295 100 L 375 250 L 455 100 L 545 250", { x: 55, y: 250 }, 820, "Trace three even peaks."),
      level("zigzag", "Zigzag lines", 4, "M 45 245 L 105 105 L 165 245 L 225 105 L 285 245 L 345 105 L 405 245 L 465 105 L 555 245", { x: 45, y: 245 }, 900, "Trace four narrow peaks."),
      level("zigzag", "Zigzag lines", 5, "M 40 230 L 90 125 L 140 230 L 190 125 L 240 230 L 290 125 L 340 230 L 390 125 L 440 230 L 490 125 L 560 230", { x: 40, y: 230 }, 980, "Trace five small peaks."),
      level("zigzag", "Zigzag lines", 6, "M 60 100 L 150 260 L 240 100 L 330 260 L 420 100 L 540 260", { x: 60, y: 100 }, 790, "Trace a zigzag starting at the top."),
      level("zigzag", "Zigzag lines", 7, "M 50 270 L 125 70 L 200 270 L 275 70 L 350 270 L 425 70 L 550 270", { x: 50, y: 270 }, 940, "Trace tall, sharp peaks."),
      level("zigzag", "Zigzag lines", 8, "M 40 200 L 105 95 L 170 265 L 235 95 L 300 265 L 365 95 L 430 265 L 495 95 L 560 200", { x: 40, y: 200 }, 950, "Trace alternating high and low corners."),
      level("zigzag", "Zigzag lines", 9, "M 35 250 L 90 110 L 145 250 L 200 110 L 255 250 L 310 110 L 365 250 L 420 110 L 475 250 L 530 110 L 570 210", { x: 35, y: 250 }, 1050, "Keep every corner sharp and even."),
      level("zigzag", "Zigzag lines", 10, "M 30 270 L 80 70 L 130 270 L 180 70 L 230 270 L 280 70 L 330 270 L 380 70 L 430 270 L 480 70 L 530 270 L 570 110", { x: 30, y: 270 }, 1180, "Complete the longest zigzag path."),
    ],
  },
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
    return LINE_TYPES;
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
            <div className="trace-pattern-grid">{items.map((item) => <button key={item.id} className={selectedId === item.id ? "selected" : ""} onClick={() => setSelectedId(item.id)}><LinePreview item={{ path: item.previewPath }} /><span><strong>{item.label}</strong><small>{item.note} • 10 levels</small></span></button>)}</div>
          ) : (
            <div className="trace-character-grid">{items.map((item) => <button key={item.id} className={selectedId === item.id ? "selected" : ""} onClick={() => setSelectedId(item.id)}>{item.label}</button>)}</div>
          )}
        </section>

        <div className="setup-footer"><span>{category === "lines" ? `10 ${items[selectedIndex]?.label.toLocaleLowerCase("en-US")} levels` : category === "letters" ? `26 ${letterCase} letters` : "10 numbers"} • Starting with {category === "lines" ? "Level 1" : items[selectedIndex]?.label}</span><button className="primary-button" onClick={() => onStart(category === "lines" ? items[selectedIndex].levels : items, category === "lines" ? 0 : selectedIndex)}>Start tracing <span>→</span></button></div>
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
        {item.path && <><circle cx={item.start.x} cy={item.start.y} r="15" className="trace-start-dot" /><text x="34" y="52" className="trace-start-label">START</text></>}
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
        <section className="tracing-game-heading"><div><span className="eyebrow">TRACING PRACTICE</span><h1>{item.character ? `Trace ${item.label}` : `${item.label} — Level ${item.level}`}</h1><p>{item.note} {item.path ? "Start on the green dot" : "Start anywhere on the guide"} and trace carefully.</p></div><div className={`trace-progress-orb ${ready ? "ready" : ""}`}><strong>{progress}%</strong><span>{ready ? "Ready!" : "Keep tracing"}</span></div></section>

        <div className="tracing-workspace">
          <TracingBoard key={`${item.id}-${resetKey}`} item={item} color={color} onProgress={setProgress} resetKey={resetKey} />
          <aside className="tracing-controls">
            <div className="trace-colors"><span>Pencil color</span><div>{COLORS.map((choice) => <button key={choice} aria-label={`Use ${choice} pencil`} className={color === choice ? "selected" : ""} style={{ "--pencil-color": choice }} onClick={() => setColor(choice)} />)}</div></div>
            <div className="trace-navigation"><span>{currentIndex + 1} of {items.length}</span><button className="secondary-button" onClick={() => goTo(currentIndex - 1)} disabled={!currentIndex}>← Previous</button><button className="primary-button trace-finish-button" onClick={finishItem} disabled={!ready}>{currentIndex === items.length - 1 ? "Complete set" : "Done — Next →"}</button></div>
            {!ready && <p className="trace-tip">Cover more of the dotted guide to unlock the next level.</p>}
          </aside>
        </div>
      </main>
      {showComplete && <div className="modal-overlay"><div className="modal"><div className="modal-trophy">✍️</div><span className="eyebrow">SET COMPLETE</span><h2>Beautiful tracing!</h2><p>You practiced every item in this tracing set.</p><div className="result-score"><strong>{items.length}</strong><span>tracing activities</span></div><div className="modal-actions"><button className="secondary-button" onClick={onExit}>Games</button><button className="primary-button" onClick={() => { setShowComplete(false); setCompleted([]); goTo(0); }}>Practice again</button></div></div></div>}
    </div>
  );
}
