"use client";

import { useRef, useState } from "react";
import { TEMPLATES } from "./drawingTemplates";

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
        <header className="setup-intro"><span className="eyebrow">DRAW &amp; COLOR</span><h1>What would you like to create?</h1><p>Draw anything on a blank page or choose from 20 friendly coloring pages.</p></header>

        <section className="setup-section">
          <div className="setup-section-title"><span>1</span><div><h2>Choose a canvas</h2><p>You can switch colors and brush sizes while you draw.</p></div></div>
          <div className="drawing-mode-options">
            <button className={mode === "free" ? "selected" : ""} onClick={() => setMode("free")}><span className="blank-page-preview"><i /><i /><i /></span><strong>Free drawing</strong><small>Start with a blank page</small></button>
            <button className={mode === "coloring" && category === "animals" ? "selected" : ""} onClick={() => { setMode("coloring"); chooseCategory("animals"); }}><PagePreview template={TEMPLATES.find((template) => template.id === "cat")} /><strong>Color animals</strong><small>10 animal pages</small></button>
            <button className={mode === "coloring" && category === "objects" ? "selected" : ""} onClick={() => { setMode("coloring"); chooseCategory("objects"); }}><PagePreview template={TEMPLATES.find((template) => template.id === "house")} /><strong>Color objects</strong><small>10 object pages</small></button>
          </div>
        </section>

        {mode === "coloring" && <section className="setup-section">
          <div className="setup-section-title"><span>2</span><div><h2>Choose a coloring page</h2><p>{pages.length} pages available in this category. Pick one now—you can return later to try another.</p></div></div>
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