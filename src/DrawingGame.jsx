"use client";

import { useRef, useState } from "react";

const COLORS = [
  { name: "Black", value: "#111827" }, { name: "White", value: "#ffffff" },
  { name: "Red", value: "#e53935" }, { name: "Orange", value: "#fb8c00" },
  { name: "Yellow", value: "#fdd835" }, { name: "Green", value: "#43a047" },
  { name: "Mint", value: "#66bb6a" }, { name: "Teal", value: "#00acc1" },
  { name: "Sky blue", value: "#29b6f6" }, { name: "Blue", value: "#1565c0" },
  { name: "Purple", value: "#5e35b1" }, { name: "Violet", value: "#8e24aa" },
  { name: "Pink", value: "#d81b60" }, { name: "Light pink", value: "#ff80ab" },
  { name: "Brown", value: "#795548" }, { name: "Gray", value: "#90a4ae" },
];

const TEMPLATES = [
  {
    id: "cat", category: "animals", label: "Cat",
    elements: [
      ["path", { d: "M255 183 L220 98 L305 138 Q400 100 495 138 L580 98 L545 183 Q600 236 575 337 Q547 438 400 438 Q253 438 225 337 Q200 236 255 183 Z" }],
      ["ellipse", { cx: 400, cy: 285, rx: 102, ry: 78 }],
      ["circle", { cx: 344, cy: 246, r: 10, fill: "#26344a" }], ["circle", { cx: 456, cy: 246, r: 10, fill: "#26344a" }],
      ["path", { d: "M389 278 Q400 290 411 278 M400 290 Q378 315 356 294 M400 290 Q422 315 444 294 M322 281 L240 266 M322 299 L232 306 M478 281 L560 266 M478 299 L568 306" }],
    ],
  },
  {
    id: "fish", category: "animals", label: "Fish",
    elements: [
      ["path", { d: "M198 280 Q285 150 488 210 Q544 226 591 280 Q544 334 488 350 Q285 410 198 280 Z" }],
      ["path", { d: "M198 280 L88 185 Q75 277 88 375 Z M345 197 Q395 103 448 204 M345 363 Q395 457 448 356" }],
      ["circle", { cx: 494, cy: 264, r: 12, fill: "#26344a" }],
      ["path", { d: "M529 300 Q550 316 572 300 M267 222 Q318 280 267 338" }],
    ],
  },
  {
    id: "butterfly", category: "animals", label: "Butterfly",
    elements: [
      ["ellipse", { cx: 400, cy: 282, rx: 30, ry: 138 }],
      ["path", { d: "M372 214 Q273 101 170 142 Q115 164 155 251 Q185 307 347 297 M428 214 Q527 101 630 142 Q685 164 645 251 Q615 307 453 297 M370 317 Q254 290 182 364 Q147 409 217 438 Q294 465 376 362 M430 317 Q546 290 618 364 Q653 409 583 438 Q506 465 424 362" }],
      ["path", { d: "M387 145 Q355 85 320 98 M413 145 Q445 85 480 98" }],
      ["circle", { cx: 270, cy: 218, r: 34 }], ["circle", { cx: 530, cy: 218, r: 34 }],
      ["circle", { cx: 257, cy: 375, r: 26 }], ["circle", { cx: 543, cy: 375, r: 26 }],
    ],
  },
  {
    id: "house", category: "objects", label: "House",
    elements: [
      ["path", { d: "M165 250 L400 75 L635 250 M210 220 V450 H590 V220 M325 450 V325 H475 V450" }],
      ["rect", { x: 245, y: 265, width: 80, height: 75, rx: 4 }], ["path", { d: "M285 265 V340 M245 302 H325" }],
      ["rect", { x: 485, y: 265, width: 70, height: 75, rx: 4 }], ["path", { d: "M520 265 V340 M485 302 H555" }],
      ["circle", { cx: 445, cy: 385, r: 7, fill: "#26344a" }],
    ],
  },
  {
    id: "rocket", category: "objects", label: "Rocket",
    elements: [
      ["path", { d: "M400 54 Q495 136 470 323 L400 391 L330 323 Q305 136 400 54 Z" }],
      ["circle", { cx: 400, cy: 205, r: 48 }],
      ["path", { d: "M333 270 Q254 310 248 402 L340 358 M467 270 Q546 310 552 402 L460 358 M367 389 Q350 437 400 478 Q450 437 433 389 M377 391 Q376 428 400 452 Q424 428 423 391" }],
    ],
  },
  {
    id: "kite", category: "objects", label: "Kite",
    elements: [
      ["path", { d: "M400 55 L595 235 L400 382 L205 235 Z M400 55 V382 M205 235 H595" }],
      ["path", { d: "M400 382 Q330 414 390 448 Q448 478 382 500" }],
      ["path", { d: "M370 416 L332 390 L338 438 Z M410 456 L451 432 L444 478 Z" }],
    ],
  },
];

function TemplateArt({ template, className = "" }) {
  if (!template) return null;
  return (
    <g className={className} fill="none" stroke="#26344a" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      {template.elements.map(([type, props], index) => {
        if (type === "circle") return <circle key={index} {...props} />;
        if (type === "ellipse") return <ellipse key={index} {...props} />;
        if (type === "rect") return <rect key={index} {...props} />;
        return <path key={index} {...props} />;
      })}
    </g>
  );
}

function PagePreview({ template }) {
  return <svg viewBox="0 0 800 520" aria-hidden="true"><TemplateArt template={template} /></svg>;
}

export function DrawingSetup({ onBack, onStart, brand }) {
  const [mode, setMode] = useState("free");
  const [category, setCategory] = useState("animals");
  const pages = TEMPLATES.filter((template) => template.category === category);
  const [templateId, setTemplateId] = useState("cat");

  function chooseCategory(nextCategory) {
    setCategory(nextCategory);
    setTemplateId(TEMPLATES.find((template) => template.category === nextCategory).id);
  }

  return (
    <div className="platform-page drawing-setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Back</button>{brand}<span className="nav-step">Draw &amp; Color setup</span></nav>
      <main className="setup-shell drawing-setup-shell">
        <header className="setup-intro"><span className="eyebrow">DRAW &amp; COLOR</span><h1>What would you like to create?</h1><p>Draw anything on a blank page or color a friendly animal or object.</p></header>

        <section className="setup-section">
          <div className="setup-section-title"><span>1</span><div><h2>Choose a canvas</h2><p>You can switch colors and brush sizes while you draw.</p></div></div>
          <div className="drawing-mode-options">
            <button className={mode === "free" ? "selected" : ""} onClick={() => setMode("free")}><span className="blank-page-preview"><i /><i /><i /></span><strong>Free drawing</strong><small>Start with a blank page</small></button>
            <button className={mode === "coloring" && category === "animals" ? "selected" : ""} onClick={() => { setMode("coloring"); chooseCategory("animals"); }}><PagePreview template={TEMPLATES[0]} /><strong>Color animals</strong><small>Cat, fish, or butterfly</small></button>
            <button className={mode === "coloring" && category === "objects" ? "selected" : ""} onClick={() => { setMode("coloring"); chooseCategory("objects"); }}><PagePreview template={TEMPLATES[3]} /><strong>Color objects</strong><small>House, rocket, or kite</small></button>
          </div>
        </section>

        {mode === "coloring" && <section className="setup-section">
          <div className="setup-section-title"><span>2</span><div><h2>Choose a coloring page</h2><p>Pick one now—you can return later to try another.</p></div></div>
          <div className="coloring-page-options">{pages.map((template) => <button key={template.id} className={templateId === template.id ? "selected" : ""} onClick={() => setTemplateId(template.id)}><PagePreview template={template} /><strong>{template.label}</strong></button>)}</div>
        </section>}

        <div className="setup-footer"><span>{mode === "free" ? "Blank drawing pad" : `${TEMPLATES.find((template) => template.id === templateId)?.label} coloring page`} • 16 colors</span><button className="primary-button" onClick={() => onStart({ mode, templateId: mode === "coloring" ? templateId : null })}>Start creating <span>→</span></button></div>
      </main>
    </div>
  );
}

function DrawingCanvas({ color, strokeWidth, template, erasing, clearKey, onHistoryChange }) {
  const svgRef = useRef(null);
  const activePointerId = useRef(null);
  const activeStroke = useRef(null);
  const [strokes, setStrokes] = useState([]);

  function pointFromEvent(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 800, y: ((event.clientY - rect.top) / rect.height) * 520 };
  }

  function beginStroke(event) {
    if (activePointerId.current !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    activePointerId.current = event.pointerId;
    svgRef.current.setPointerCapture(event.pointerId);
    const stroke = { id: `${Date.now()}-${event.pointerId}`, color: erasing ? "#ffffff" : color, width: erasing ? Math.max(30, strokeWidth * 1.7) : strokeWidth, points: [pointFromEvent(event)] };
    activeStroke.current = stroke;
    setStrokes((current) => {
      const next = [...current, stroke];
      onHistoryChange(next.length);
      return next;
    });
  }

  function moveStroke(event) {
    if (event.pointerId !== activePointerId.current || !activeStroke.current) return;
    event.preventDefault();
    const nextPoint = pointFromEvent(event);
    const points = activeStroke.current.points;
    const previousPoint = points[points.length - 1];
    if (Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y) < 1.5) return;
    const nextStroke = { ...activeStroke.current, points: [...points, nextPoint] };
    activeStroke.current = nextStroke;
    setStrokes((current) => current.map((stroke) => stroke.id === nextStroke.id ? nextStroke : stroke));
  }

  function endStroke(event) {
    if (event.pointerId !== activePointerId.current) return;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
    activePointerId.current = null;
    activeStroke.current = null;
  }

  function undo() {
    activePointerId.current = null;
    activeStroke.current = null;
    setStrokes((current) => {
      const next = current.slice(0, -1);
      onHistoryChange(next.length);
      return next;
    });
  }

  function clear() {
    activePointerId.current = null;
    activeStroke.current = null;
    setStrokes([]);
    onHistoryChange(0);
  }

  // A new key remounts this component; it is also used by the parent to label a fresh page.
  void clearKey;

  return (
    <div className="drawing-board-wrap">
      <svg ref={svgRef} className="drawing-board" viewBox="0 0 800 520" role="img" aria-label={template ? `${template.label} coloring page` : "Blank drawing pad"} onPointerDown={beginStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke} onLostPointerCapture={endStroke}>
        <rect width="800" height="520" rx="24" fill="#ffffff" />
        {!template && <g className="drawing-paper-dots">{Array.from({ length: 10 }, (_, row) => Array.from({ length: 15 }, (_, column) => <circle key={`${row}-${column}`} cx={50 + column * 50} cy={38 + row * 50} r="2" />))}</g>}
        {strokes.map((stroke) => <path key={stroke.id} d={stroke.points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" />)}
        <TemplateArt template={template} className="coloring-outline" />
      </svg>
      <div className="drawing-board-tools"><span>Only the finger that starts a stroke can control it.</span><div><button onClick={undo} disabled={!strokes.length}>↶ Undo</button><button onClick={clear} disabled={!strokes.length}>Clear all</button></div></div>
    </div>
  );
}

export function DrawingGame({ selection, onExit, brand }) {
  const [color, setColor] = useState(COLORS[2].value);
  const [strokeWidth, setStrokeWidth] = useState(16);
  const [erasing, setErasing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [clearKey, setClearKey] = useState(0);
  const template = TEMPLATES.find((item) => item.id === selection.templateId) || null;

  function newPage() {
    setClearKey((current) => current + 1);
    setStrokeCount(0);
  }

  return (
    <div className="game-page drawing-game-page">
      <header className="game-header"><button className="game-home" onClick={onExit}>← Games</button>{brand}<div className="header-score"><strong>{strokeCount}</strong><span>strokes</span></div></header>
      <main className="drawing-game-shell">
        <section className="drawing-game-heading"><div><span className="eyebrow">{template ? "COLORING PAGE" : "DRAWING PAD"}</span><h1>{template ? `Color the ${template.label.toLocaleLowerCase("en-US")}` : "Draw something wonderful"}</h1><p>Use one finger, a stylus, or a mouse. Choose from 16 colors and adjust the brush anytime.</p></div><button className="secondary-button" onClick={newPage}>New page</button></section>

        <div className="drawing-workspace">
          <DrawingCanvas key={clearKey} color={color} strokeWidth={strokeWidth} template={template} erasing={erasing} clearKey={clearKey} onHistoryChange={setStrokeCount} />
          <aside className="drawing-controls">
            <div className="drawing-tool-section"><span>16 colors</span><div className="drawing-color-grid">{COLORS.map((choice) => <button key={choice.value} aria-label={`Use ${choice.name}`} title={choice.name} className={!erasing && color === choice.value ? "selected" : ""} style={{ "--draw-color": choice.value }} onClick={() => { setColor(choice.value); setErasing(false); }} />)}</div></div>
            <div className="drawing-tool-section brush-size-control"><label htmlFor="brush-size">Brush size <strong>{strokeWidth}px</strong></label><input id="brush-size" type="range" min="4" max="40" step="2" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} /><div className="brush-preview"><i style={{ width: strokeWidth, height: strokeWidth }} /></div></div>
            <button className={`eraser-button ${erasing ? "selected" : ""}`} aria-pressed={erasing} onClick={() => setErasing((current) => !current)}>▱ {erasing ? "Eraser on" : "Use eraser"}</button>
          </aside>
        </div>
      </main>
    </div>
  );
}
