import fs from "node:fs";
import path from "node:path";

const drawingPath = path.join(process.cwd(), "src", "DrawingGame.jsx");
const cssPath = path.join(process.cwd(), "src", "DrawingWorkspace.css");
let source = fs.readFileSync(drawingPath, "utf8");

source = source.replace(
  'function DrawingCanvas({ color, strokeWidth, template, backgroundUrl, backgroundLabel, erasing, strokes, setStrokes, loading, error }) {',
  'function DrawingCanvas({ color, strokeWidth, template, backgroundUrl, backgroundLabel, erasing, strokes, setStrokes, loading, error, onUndo, onClear, pdfNote }) {'
);
source = source.replace('className="drawing-board-wrap drawing-board-wrap-wide"', 'className="drawing-board-wrap"');
source = source.replace('className={`drawing-board drawing-board-large ${erasing ? "is-erasing" : ""}`}', 'className={`drawing-board ${erasing ? "is-erasing" : ""}`}');

const statusLine = '      {(loading || error) && <div className={`worksheet-board-status ${error ? "is-error" : ""}`}>{error || "Preparing worksheet…"}</div>}\n';
if (!source.includes(statusLine)) throw new Error("Could not locate drawing board status line");
source = source.replace(statusLine, `${statusLine}      <div className="drawing-board-tools"><span>Only the finger that starts a stroke can control it.{pdfNote ? \` ${pdfNote}\` : ""}</span><div><button onClick={onUndo} disabled={!strokes.length}>↶ Undo</button><button onClick={onClear} disabled={!strokes.length}>Clear all</button></div></div>\n`);

const mainStart = source.indexOf('      <main className="drawing-game-shell drawing-game-shell-wide">');
const mainEnd = source.indexOf('      </main>', mainStart);
if (mainStart === -1 || mainEnd === -1) throw new Error("Could not locate current drawing workspace layout");
const replacement = `      <main className="drawing-game-shell">
        <section className="drawing-game-heading"><div><span className="eyebrow">{uploadMode ? "WORKSHEET" : template ? "COLORING PAGE" : "DRAWING PAD"}</span><h1>{title}</h1><p>{uploadMode ? "Your file stays local. Draw over it without changing the original." : "Use one finger, a stylus, or a mouse. Choose from 16 colors and adjust the brush anytime."}</p></div>{uploadMode && <button className="secondary-button" type="button" onClick={() => replaceInputRef.current?.click()}>Replace file</button>}</section>

        <input ref={replaceInputRef} className="worksheet-file-input" type="file" accept={FILE_ACCEPT} onChange={(event) => replaceFile(event.target.files?.[0])} />

        <div className="drawing-workspace">
          <DrawingCanvas color={color} strokeWidth={strokeWidth} template={template} backgroundUrl={uploadMode ? backgroundUrl : ""} backgroundLabel={uploadMode ? (pdfMode ? \`${workingFile?.name}, page ${pdfPage}\` : workingFile?.name) : ""} erasing={erasing} strokes={strokes} setStrokes={setCurrentStrokes} loading={worksheetLoading} error={worksheetError} onUndo={undo} onClear={clearCurrent} pdfNote={pdfMode ? "Marks are kept separately for each PDF page." : ""} />
          <aside className="drawing-controls">
            <div className="drawing-tool-section"><span>16 colors</span><div className="drawing-color-grid">{COLORS.map((choice) => <button key={choice.value} aria-label={\`Use ${choice.name}\`} title={choice.name} className={!erasing && color === choice.value ? "selected" : ""} style={{ "--draw-color": choice.value }} onClick={() => { setColor(choice.value); setErasing(false); }} />)}</div></div>
            <div className="drawing-tool-section brush-size-control"><label htmlFor="brush-size">Brush size <strong>{strokeWidth}px</strong></label><input id="brush-size" type="range" min="4" max="40" step="2" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} /><div className="brush-preview"><i style={{ width: strokeWidth, height: strokeWidth }} /></div></div>
            <button className={\`eraser-button ${erasing ? "selected" : ""}\`} aria-pressed={erasing} onClick={() => setErasing((current) => !current)}>▱ {erasing ? "Eraser on" : "Use eraser"}</button>
            {pdfMode && <div className="drawing-tool-section pdf-sidebar-section"><span>PDF page</span><div className="pdf-sidebar-controls"><button onClick={() => setPdfPage((page) => Math.max(1, page - 1))} disabled={pdfPage <= 1}>←</button><strong>{pdfPage} / {pdfPageCount || "…"}</strong><button onClick={() => setPdfPage((page) => Math.min(pdfPageCount, page + 1))} disabled={!pdfPageCount || pdfPage >= pdfPageCount}>→</button></div></div>}
          </aside>
        </div>
      </main>`;
source = source.slice(0, mainStart) + replacement + source.slice(mainEnd + '      </main>'.length);
fs.writeFileSync(drawingPath, source);

const css = `.drawing-mode-options-four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.worksheet-file-input {
  display: none;
}

.upload-mode-preview {
  width: 100%;
  min-height: 118px;
  display: grid;
  place-items: center;
  position: relative;
}

.upload-sheet {
  width: 72px;
  height: 86px;
  display: grid;
  place-items: center;
  border: 3px solid #26344a;
  border-radius: 13px;
  color: var(--blue);
  background: #fff;
  font: 900 31px/1 'Baloo 2';
  box-shadow: 7px 8px 0 #dce7f5;
}

.upload-mode-preview i {
  position: absolute;
  right: 12%;
  bottom: 8px;
  padding: 6px 9px;
  border-radius: 10px;
  color: #fff;
  background: var(--blue);
  font-style: normal;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .55px;
}

.worksheet-file-row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 16px;
  border: 1px dashed #b9cce3;
  border-radius: 15px;
  background: #f8fbff;
}

.worksheet-file-row > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.worksheet-file-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--navy);
  font-size: 13px;
}

.worksheet-file-row small {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
}

.worksheet-file-error {
  margin: 10px 0 0;
  color: var(--red);
  font-size: 12px;
  font-weight: 800;
}

.drawing-board-wrap {
  position: relative;
}

.drawing-board.is-erasing {
  cursor: cell;
}

.worksheet-board-status {
  position: absolute;
  inset: 0 0 58px;
  z-index: 4;
  display: grid;
  place-items: center;
  padding: 28px;
  color: var(--blue);
  background: rgba(248,251,255,.88);
  backdrop-filter: blur(4px);
  font: 900 16px 'Nunito';
  text-align: center;
  pointer-events: none;
}

.worksheet-board-status.is-error {
  color: var(--red);
}

.pdf-sidebar-section {
  padding-bottom: 0;
  border-bottom: 0;
}

.pdf-sidebar-controls {
  display: grid;
  grid-template-columns: 40px minmax(72px, 1fr) 40px;
  align-items: center;
  gap: 7px;
}

.pdf-sidebar-controls strong {
  text-align: center;
  color: var(--navy);
  font-size: 12px;
}

.pdf-sidebar-controls button {
  min-height: 36px;
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--blue);
  background: #f8fbff;
  font-weight: 900;
}

.pdf-sidebar-controls button:disabled {
  cursor: default;
  opacity: .4;
}

@media (max-width: 1050px) {
  .drawing-mode-options-four {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .pdf-sidebar-section {
    min-width: 190px;
  }
}

@media (max-width: 600px) {
  .drawing-mode-options-four {
    grid-template-columns: 1fr;
  }

  .worksheet-file-row {
    align-items: stretch;
    flex-direction: column;
  }

  .worksheet-file-row .secondary-button {
    width: 100%;
  }

  .pdf-sidebar-section {
    min-width: 0;
  }

  .worksheet-board-status {
    inset: 0 0 68px;
  }
}
`;
fs.writeFileSync(cssPath, css);
