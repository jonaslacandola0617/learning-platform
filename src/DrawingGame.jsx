"use client";

import { useEffect, useRef, useState } from "react";
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

const FILE_ACCEPT = ".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf";

function isPdf(file) {
  return file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");
}

function isSupportedFile(file) {
  if (!file) return false;
  if (isPdf(file)) return true;
  return ["image/png", "image/jpeg", "image/webp"].includes(file.type)
    || /\.(png|jpe?g|webp)$/i.test(file.name || "");
}

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

function UploadPreview({ file }) {
  return (
    <span className="upload-mode-preview" aria-hidden="true">
      <span className="upload-sheet">↑</span>
      <i>{file ? (isPdf(file) ? "PDF" : "IMG") : "PDF + IMG"}</i>
    </span>
  );
}

export function DrawingSetup({ onBack, onStart, brand }) {
  const [mode, setMode] = useState("free");
  const [category, setCategory] = useState("animals");
  const [templateId, setTemplateId] = useState("cat");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const pages = TEMPLATES.filter((template) => template.category === category);

  function chooseCategory(nextCategory) {
    setCategory(nextCategory);
    setTemplateId(TEMPLATES.find((template) => template.category === nextCategory).id);
  }

  function chooseFile(nextFile) {
    setFileError("");
    if (!nextFile) return;
    if (!isSupportedFile(nextFile)) {
      setFile(null);
      setFileError("Choose a PDF, PNG, JPG, JPEG, or WEBP file.");
      return;
    }
    setFile(nextFile);
    setMode("upload");
  }

  function start() {
    if (mode === "upload" && !file) {
      setFileError("Choose an image or PDF first.");
      fileInputRef.current?.click();
      return;
    }
    onStart({
      mode,
      templateId: mode === "coloring" ? templateId : null,
      file: mode === "upload" ? file : null,
    });
  }

  return (
    <div className="platform-page drawing-setup-page">
      <nav className="platform-nav"><button className="back-link" onClick={onBack}>← Back</button>{brand}<span className="nav-step">Draw &amp; Color setup</span></nav>
      <main className="setup-shell drawing-setup-shell">
        <header className="setup-intro"><span className="eyebrow">DRAW &amp; COLOR</span><h1>What would you like to create?</h1><p>Start blank, color a template, or open your own worksheet and draw directly over it.</p></header>

        <section className="setup-section">
          <div className="setup-section-title"><span>1</span><div><h2>Choose a canvas</h2><p>Images and PDFs stay on this device while you work.</p></div></div>
          <div className="drawing-mode-options drawing-mode-options-four">
            <button className={mode === "free" ? "selected" : ""} onClick={() => setMode("free")}><span className="blank-page-preview"><i /><i /><i /></span><strong>Free drawing</strong><small>Start with a blank page</small></button>
            <button className={mode === "coloring" && category === "animals" ? "selected" : ""} onClick={() => { setMode("coloring"); chooseCategory("animals"); }}><PagePreview template={TEMPLATES.find((template) => template.id === "cat")} /><strong>Color animals</strong><small>10 animal pages</small></button>
            <button className={mode === "coloring" && category === "objects" ? "selected" : ""} onClick={() => { setMode("coloring"); chooseCategory("objects"); }}><PagePreview template={TEMPLATES.find((template) => template.id === "house")} /><strong>Color objects</strong><small>10 object pages</small></button>
            <button className={mode === "upload" ? "selected" : ""} onClick={() => { setMode("upload"); fileInputRef.current?.click(); }}><UploadPreview file={file} /><strong>Upload worksheet</strong><small>PDF, PNG, JPG or WEBP</small></button>
          </div>
          <input ref={fileInputRef} className="worksheet-file-input" type="file" accept={FILE_ACCEPT} onChange={(event) => chooseFile(event.target.files?.[0])} />
          {mode === "upload" && <div className="worksheet-file-row"><div><strong>{file?.name || "No worksheet selected"}</strong><small>{file ? `${isPdf(file) ? "PDF document" : "Image"} • kept locally in your browser` : "Choose a worksheet from this device."}</small></div><button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>{file ? "Replace file" : "Choose file"}</button></div>}
          {fileError && <p className="worksheet-file-error" role="alert">{fileError}</p>}
        </section>

        {mode === "coloring" && <section className="setup-section"><div className="setup-section-title"><span>2</span><div><h2>Choose a coloring page</h2><p>{pages.length} pages available in this category.</p></div></div><div className="coloring-page-options">{pages.map((template) => <button key={template.id} className={templateId === template.id ? "selected" : ""} onClick={() => setTemplateId(template.id)}><PagePreview template={template} /><strong>{template.label}</strong></button>)}</div></section>}

        <div className="setup-footer"><span>{mode === "free" ? "Blank drawing pad" : mode === "upload" ? (file?.name || "Upload a worksheet") : `${TEMPLATES.find((template) => template.id === templateId)?.label} coloring page`} • 16 colors</span><button className="primary-button" onClick={start}>Start creating <span>→</span></button></div>
      </main>
    </div>
  );
}

function DrawingCanvas({ color, strokeWidth, template, backgroundUrl, backgroundLabel, erasing, strokes, setStrokes, loading, error }) {
  const svgRef = useRef(null);
  const activePointerId = useRef(null);
  const activeStroke = useRef(null);

  function pointFromEvent(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 800, y: ((event.clientY - rect.top) / rect.height) * 520 };
  }

  function eraseAt(point) {
    const radius = Math.max(16, strokeWidth * 1.35);
    setStrokes((current) => current.filter((stroke) => !stroke.points.some((p) => Math.hypot(point.x - p.x, point.y - p.y) <= radius + stroke.width / 2)));
  }

  function beginStroke(event) {
    if (activePointerId.current !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    activePointerId.current = event.pointerId;
    svgRef.current.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    if (erasing) {
      eraseAt(point);
      return;
    }
    const stroke = { id: `${Date.now()}-${event.pointerId}`, color, width: strokeWidth, points: [point] };
    activeStroke.current = stroke;
    setStrokes((current) => [...current, stroke]);
  }

  function moveStroke(event) {
    if (event.pointerId !== activePointerId.current) return;
    event.preventDefault();
    const nextPoint = pointFromEvent(event);
    if (erasing) {
      eraseAt(nextPoint);
      return;
    }
    if (!activeStroke.current) return;
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

  return (
    <div className="drawing-board-wrap drawing-board-wrap-wide">
      <svg ref={svgRef} className={`drawing-board drawing-board-large ${erasing ? "is-erasing" : ""}`} viewBox="0 0 800 520" role="img" aria-label={backgroundLabel || (template ? `${template.label} coloring page` : "Blank drawing pad")} onPointerDown={beginStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke} onLostPointerCapture={endStroke}>
        <rect width="800" height="520" rx="18" fill="#ffffff" />
        {backgroundUrl && <image href={backgroundUrl} x="0" y="0" width="800" height="520" preserveAspectRatio="xMidYMid meet" />}
        {!template && !backgroundUrl && <g className="drawing-paper-dots">{Array.from({ length: 10 }, (_, row) => Array.from({ length: 15 }, (_, column) => <circle key={`${row}-${column}`} cx={50 + column * 50} cy={38 + row * 50} r="2" />))}</g>}
        {strokes.map((stroke) => <path key={stroke.id} d={stroke.points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" />)}
        <TemplateArt template={template} className="coloring-outline" />
      </svg>
      {(loading || error) && <div className={`worksheet-board-status ${error ? "is-error" : ""}`}>{error || "Preparing worksheet…"}</div>}
    </div>
  );
}

export function DrawingGame({ selection, onExit, brand }) {
  const [color, setColor] = useState(COLORS[2].value);
  const [strokeWidth, setStrokeWidth] = useState(16);
  const [erasing, setErasing] = useState(false);
  const [workingFile, setWorkingFile] = useState(selection.file || null);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [worksheetLoading, setWorksheetLoading] = useState(false);
  const [worksheetError, setWorksheetError] = useState("");
  const [strokePages, setStrokePages] = useState({});
  const replaceInputRef = useRef(null);
  const template = TEMPLATES.find((item) => item.id === selection.templateId) || null;
  const uploadMode = selection.mode === "upload";
  const pdfMode = uploadMode && isPdf(workingFile);
  const pageKey = pdfMode ? `pdf-${pdfPage}` : "main";
  const strokes = strokePages[pageKey] || [];

  function setCurrentStrokes(updater) {
    setStrokePages((current) => {
      const existing = current[pageKey] || [];
      const next = typeof updater === "function" ? updater(existing) : updater;
      return { ...current, [pageKey]: next };
    });
  }

  useEffect(() => {
    if (!uploadMode || !workingFile || isPdf(workingFile)) return undefined;
    const url = URL.createObjectURL(workingFile);
    setBackgroundUrl(url);
    setPdfDocument(null);
    setPdfPageCount(0);
    setWorksheetError("");
    return () => URL.revokeObjectURL(url);
  }, [uploadMode, workingFile]);

  useEffect(() => {
    if (!uploadMode || !workingFile || !isPdf(workingFile)) return undefined;
    let cancelled = false;
    let loadingTask;
    let documentProxy;

    setWorksheetLoading(true);
    setWorksheetError("");
    setBackgroundUrl("");
    setPdfPage(1);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = new Uint8Array(await workingFile.arrayBuffer());
        loadingTask = pdfjs.getDocument({ data });
        documentProxy = await loadingTask.promise;
        if (cancelled) return;
        setPdfDocument(documentProxy);
        setPdfPageCount(documentProxy.numPages);
      } catch {
        if (!cancelled) setWorksheetError("Tuklas could not open this PDF. Try another PDF or export the page as an image.");
      } finally {
        if (!cancelled) setWorksheetLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy?.();
      documentProxy?.destroy?.();
    };
  }, [uploadMode, workingFile]);

  useEffect(() => {
    if (!pdfDocument || !pdfMode) return undefined;
    let cancelled = false;
    let renderTask;
    setWorksheetLoading(true);
    setWorksheetError("");

    (async () => {
      try {
        const page = await pdfDocument.getPage(pdfPage);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1500 / baseViewport.width, 1100 / baseViewport.height);
        const viewport = page.getViewport({ scale: Math.max(1, scale) });
        const outputScale = Math.min(2, window.devicePixelRatio || 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        const context = canvas.getContext("2d", { alpha: false });
        renderTask = page.render({ canvasContext: context, viewport, transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0], background: "#ffffff" });
        await renderTask.promise;
        if (!cancelled) setBackgroundUrl(canvas.toDataURL("image/jpeg", 0.94));
      } catch (error) {
        if (!cancelled && error?.name !== "RenderingCancelledException") setWorksheetError("This PDF page could not be rendered.");
      } finally {
        if (!cancelled) setWorksheetLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [pdfDocument, pdfMode, pdfPage]);

  function clearCurrent() {
    setCurrentStrokes([]);
  }

  function undo() {
    setCurrentStrokes((current) => current.slice(0, -1));
  }

  function replaceFile(file) {
    if (!file) return;
    if (!isSupportedFile(file)) {
      setWorksheetError("Choose a PDF, PNG, JPG, JPEG, or WEBP file.");
      return;
    }
    setStrokePages({});
    setPdfPage(1);
    setBackgroundUrl("");
    setWorksheetError("");
    setWorkingFile(file);
  }

  const title = uploadMode ? (workingFile?.name || "Your worksheet") : template ? `Color the ${template.label.toLocaleLowerCase("en-US")}` : "Draw something wonderful";

  return (
    <div className="game-page drawing-game-page">
      <header className="game-header"><button className="game-home" onClick={onExit}>← Games</button>{brand}<div className="header-score"><strong>{strokes.length}</strong><span>strokes</span></div></header>
      <main className="drawing-game-shell drawing-game-shell-wide">
        <section className="drawing-game-heading"><div><span className="eyebrow">{uploadMode ? "WORKSHEET" : template ? "COLORING PAGE" : "DRAWING PAD"}</span><h1>{title}</h1><p>{uploadMode ? "Your file stays local. Draw over it without changing the original." : "Use one finger, a stylus, or a mouse. Choose from 16 colors and adjust the brush anytime."}</p></div>{uploadMode && <button className="secondary-button" type="button" onClick={() => replaceInputRef.current?.click()}>Replace file</button>}</section>

        <input ref={replaceInputRef} className="worksheet-file-input" type="file" accept={FILE_ACCEPT} onChange={(event) => replaceFile(event.target.files?.[0])} />

        <div className="drawing-toolbar" aria-label="Drawing tools">
          <div className="drawing-toolbar-group drawing-toolbar-colors"><span className="drawing-toolbar-label">Colors</span><div className="drawing-color-grid drawing-color-grid-toolbar">{COLORS.map((choice) => <button key={choice.value} aria-label={`Use ${choice.name}`} title={choice.name} className={!erasing && color === choice.value ? "selected" : ""} style={{ "--draw-color": choice.value }} onClick={() => { setColor(choice.value); setErasing(false); }} />)}</div></div>
          <div className="drawing-toolbar-group drawing-toolbar-brush"><label className="drawing-toolbar-label" htmlFor="brush-size">Brush <strong>{strokeWidth}px</strong></label><input id="brush-size" type="range" min="4" max="40" step="2" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} /><i className="drawing-toolbar-brush-dot" style={{ width: Math.min(28, strokeWidth), height: Math.min(28, strokeWidth), background: color }} /></div>
          <div className="drawing-toolbar-group drawing-toolbar-actions"><button className={`tool-button ${erasing ? "selected" : ""}`} aria-pressed={erasing} onClick={() => setErasing((current) => !current)}>⌫ {erasing ? "Eraser on" : "Eraser"}</button><button className="tool-button" onClick={undo} disabled={!strokes.length}>↶ Undo</button><button className="tool-button" onClick={clearCurrent} disabled={!strokes.length}>Clear marks</button></div>
          {pdfMode && <div className="drawing-toolbar-group pdf-page-controls"><button className="tool-button" onClick={() => setPdfPage((page) => Math.max(1, page - 1))} disabled={pdfPage <= 1}>←</button><span><strong>{pdfPage}</strong> / {pdfPageCount || "…"}</span><button className="tool-button" onClick={() => setPdfPage((page) => Math.min(pdfPageCount, page + 1))} disabled={!pdfPageCount || pdfPage >= pdfPageCount}>→</button></div>}
        </div>

        <DrawingCanvas color={color} strokeWidth={strokeWidth} template={template} backgroundUrl={uploadMode ? backgroundUrl : ""} backgroundLabel={uploadMode ? (pdfMode ? `${workingFile?.name}, page ${pdfPage}` : workingFile?.name) : ""} erasing={erasing} strokes={strokes} setStrokes={setCurrentStrokes} loading={worksheetLoading} error={worksheetError} />
        <div className="drawing-workspace-note"><span>Only the finger that starts a stroke can control it.</span>{pdfMode && <span>Your marks are kept separately for each PDF page.</span>}</div>
      </main>
    </div>
  );
}
