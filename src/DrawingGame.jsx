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
    id: "dog", category: "animals", label: "Dog",
    elements: [
      ["path", { d: "M272 170 Q238 102 181 126 Q142 143 174 221 L223 269 Q201 344 244 397 Q299 461 400 455 Q501 461 556 397 Q599 344 577 269 L626 221 Q658 143 619 126 Q562 102 528 170 Q471 132 400 132 Q329 132 272 170 Z" }],
      ["ellipse", { cx: 400, cy: 310, rx: 92, ry: 72 }],
      ["circle", { cx: 337, cy: 252, r: 11, fill: "#26344a" }], ["circle", { cx: 463, cy: 252, r: 11, fill: "#26344a" }],
      ["ellipse", { cx: 400, cy: 302, rx: 21, ry: 15, fill: "#26344a" }],
      ["path", { d: "M400 317 V339 Q375 364 349 340 M400 339 Q425 364 451 340 M318 385 Q350 410 382 391 M482 385 Q450 410 418 391" }],
    ],
  },
  {
    id: "rabbit", category: "animals", label: "Rabbit",
    elements: [
      ["ellipse", { cx: 329, cy: 142, rx: 48, ry: 112 }], ["ellipse", { cx: 471, cy: 142, rx: 48, ry: 112 }],
      ["ellipse", { cx: 400, cy: 309, rx: 174, ry: 142 }],
      ["circle", { cx: 342, cy: 276, r: 11, fill: "#26344a" }], ["circle", { cx: 458, cy: 276, r: 11, fill: "#26344a" }],
      ["path", { d: "M387 321 Q400 337 413 321 M400 337 Q378 363 354 345 M400 337 Q422 363 446 345 M303 326 L222 309 M303 346 L216 352 M497 326 L578 309 M497 346 L584 352" }],
      ["circle", { cx: 400, cy: 322, r: 11 }],
    ],
  },
  {
    id: "turtle", category: "animals", label: "Turtle",
    elements: [
      ["ellipse", { cx: 386, cy: 283, rx: 202, ry: 132 }],
      ["circle", { cx: 617, cy: 272, r: 61 }],
      ["path", { d: "M208 222 Q134 170 107 216 Q130 276 201 278 M211 345 Q142 394 113 352 Q132 301 205 296 M523 190 Q574 128 616 161 Q604 219 536 240 M523 365 Q575 425 615 389 Q603 330 536 316 M178 280 Q127 252 88 280 Q127 310 179 297" }],
      ["path", { d: "M262 193 L335 276 L266 368 M335 276 L433 173 M335 276 L444 380 M433 173 L522 271 L444 380 M335 276 H522" }],
      ["circle", { cx: 637, cy: 254, r: 9, fill: "#26344a" }],
    ],
  },
  {
    id: "elephant", category: "animals", label: "Elephant",
    elements: [
      ["path", { d: "M282 192 Q211 131 168 192 Q142 254 217 319 Q238 339 278 323 M518 192 Q589 131 632 192 Q658 254 583 319 Q562 339 522 323" }],
      ["ellipse", { cx: 400, cy: 278, rx: 150, ry: 155 }],
      ["path", { d: "M371 350 Q365 448 410 462 Q454 452 442 397 Q436 362 430 323" }],
      ["circle", { cx: 350, cy: 257, r: 10, fill: "#26344a" }], ["circle", { cx: 450, cy: 257, r: 10, fill: "#26344a" }],
      ["path", { d: "M325 302 Q342 320 359 302 M441 302 Q458 320 475 302" }],
    ],
  },
  {
    id: "owl", category: "animals", label: "Owl",
    elements: [
      ["path", { d: "M250 181 L278 82 L349 138 Q400 115 451 138 L522 82 L550 181 Q596 238 573 345 Q548 456 400 466 Q252 456 227 345 Q204 238 250 181 Z" }],
      ["circle", { cx: 335, cy: 264, r: 72 }], ["circle", { cx: 465, cy: 264, r: 72 }],
      ["circle", { cx: 335, cy: 264, r: 20, fill: "#26344a" }], ["circle", { cx: 465, cy: 264, r: 20, fill: "#26344a" }],
      ["path", { d: "M400 286 L374 322 H426 Z M282 369 Q400 420 518 369 M332 446 L305 484 M468 446 L495 484" }],
    ],
  },
  {
    id: "penguin", category: "animals", label: "Penguin",
    elements: [
      ["ellipse", { cx: 400, cy: 290, rx: 148, ry: 192 }],
      ["ellipse", { cx: 400, cy: 327, rx: 101, ry: 126 }],
      ["path", { d: "M274 239 Q201 287 226 373 Q264 338 300 313 M526 239 Q599 287 574 373 Q536 338 500 313" }],
      ["circle", { cx: 354, cy: 228, r: 10, fill: "#26344a" }], ["circle", { cx: 446, cy: 228, r: 10, fill: "#26344a" }],
      ["path", { d: "M400 254 L367 280 L433 280 Z M347 466 L300 492 M453 466 L500 492" }],
    ],
  },
  {
    id: "lion", category: "animals", label: "Lion",
    elements: [
      ["path", { d: "M400 66 Q446 91 485 70 Q513 105 554 109 Q556 154 592 180 Q572 219 590 258 Q555 289 558 334 Q515 345 491 382 Q452 369 419 400 Q381 373 344 394 Q315 359 272 357 Q269 314 233 286 Q252 246 230 208 Q264 177 262 134 Q305 124 331 89 Q367 104 400 66 Z" }],
      ["circle", { cx: 400, cy: 253, r: 137 }],
      ["circle", { cx: 350, cy: 232, r: 10, fill: "#26344a" }], ["circle", { cx: 450, cy: 232, r: 10, fill: "#26344a" }],
      ["ellipse", { cx: 400, cy: 288, rx: 22, ry: 16, fill: "#26344a" }],
      ["path", { d: "M400 304 Q374 338 345 313 M400 304 Q426 338 455 313 M309 201 Q281 170 286 134 M491 201 Q519 170 514 134" }],
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
  {
    id: "car", category: "objects", label: "Car",
    elements: [
      ["path", { d: "M145 321 L191 230 Q207 198 246 198 H494 Q530 198 552 225 L621 310 Q655 318 664 348 V399 H136 V351 Q136 333 145 321 Z" }],
      ["path", { d: "M229 230 L284 143 H463 L526 230 M285 143 V230 M463 143 V230" }],
      ["circle", { cx: 242, cy: 399, r: 49 }], ["circle", { cx: 556, cy: 399, r: 49 }],
      ["circle", { cx: 242, cy: 399, r: 18 }], ["circle", { cx: 556, cy: 399, r: 18 }],
      ["path", { d: "M151 333 H201 M596 333 H650 M330 276 H382" }],
    ],
  },
  {
    id: "boat", category: "objects", label: "Boat",
    elements: [
      ["path", { d: "M142 326 H658 L589 427 H216 Z" }],
      ["path", { d: "M322 326 V126 H476 V326 M322 155 L205 274 H322 M476 155 L591 274 H476" }],
      ["path", { d: "M95 455 Q151 427 207 455 T319 455 T431 455 T543 455 T655 455 T767 455" }],
      ["circle", { cx: 365, cy: 371, r: 15 }], ["circle", { cx: 435, cy: 371, r: 15 }],
    ],
  },
  {
    id: "airplane", category: "objects", label: "Airplane",
    elements: [
      ["path", { d: "M92 286 L327 252 L394 79 Q404 56 419 80 L442 244 L666 180 Q703 169 711 190 Q713 211 682 230 L474 314 L491 435 L571 470 L565 491 L428 462 L294 491 L287 470 L365 435 L377 316 L111 330 Q76 334 73 313 Q72 294 92 286 Z" }],
      ["circle", { cx: 428, cy: 285, r: 16 }],
      ["path", { d: "M397 244 H442 M377 316 H474" }],
    ],
  },
  {
    id: "balloon", category: "objects", label: "Balloon",
    elements: [
      ["ellipse", { cx: 400, cy: 215, rx: 139, ry: 158 }],
      ["path", { d: "M374 365 L400 397 L426 365 Z M400 397 Q330 425 397 458 Q451 486 385 510" }],
      ["path", { d: "M330 103 Q301 141 299 190" }],
    ],
  },
  {
    id: "backpack", category: "objects", label: "Backpack",
    elements: [
      ["path", { d: "M267 178 Q267 117 326 91 Q400 59 474 91 Q533 117 533 178 V445 H267 Z" }],
      ["path", { d: "M337 116 Q341 60 400 60 Q459 60 463 116 M267 236 Q209 246 208 329 V401 M533 236 Q591 246 592 329 V401" }],
      ["rect", { x: 320, y: 285, width: 160, height: 105, rx: 27 }],
      ["path", { d: "M320 326 H480 M363 285 V390 M437 285 V390" }],
    ],
  },
  {
    id: "bicycle", category: "objects", label: "Bicycle",
    elements: [
      ["circle", { cx: 240, cy: 365, r: 98 }], ["circle", { cx: 575, cy: 365, r: 98 }],
      ["path", { d: "M240 365 L350 365 L438 221 L575 365 H350 L284 220 H391 M438 221 L480 175 H535 M281 220 H229 M350 365 L395 285 M395 285 H456" }],
      ["circle", { cx: 350, cy: 365, r: 19 }],
      ["path", { d: "M337 365 L309 396 M363 365 L391 334" }],
    ],
  },
  {
    id: "ice-cream", category: "objects", label: "Ice Cream",
    elements: [
      ["path", { d: "M303 242 L400 476 L497 242 Z" }],
      ["path", { d: "M305 242 Q268 207 295 169 Q318 138 350 151 Q356 91 409 90 Q456 91 464 139 Q506 129 526 165 Q548 206 495 242 Z" }],
      ["path", { d: "M335 320 L454 401 M319 278 L475 386 M373 410 L459 323 M347 354 L484 260" }],
      ["circle", { cx: 382, cy: 160, r: 8 }], ["circle", { cx: 443, cy: 188, r: 8 }],
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