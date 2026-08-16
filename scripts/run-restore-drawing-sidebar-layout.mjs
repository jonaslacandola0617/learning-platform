import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const helperPath = path.join(process.cwd(), "scripts", "restore-drawing-sidebar-layout.mjs");
const tempPath = path.join(os.tmpdir(), `restore-drawing-sidebar-layout-${Date.now()}.mjs`);
let helper = fs.readFileSync(helperPath, "utf8");
helper = helper.replace(
  'let source = fs.readFileSync(drawingPath, "utf8");',
  'let source = fs.readFileSync(drawingPath, "utf8");\nconst pdfNote = \'${pdfNote}\';'
);
fs.writeFileSync(tempPath, helper);
await import(pathToFileURL(tempPath).href);
fs.rmSync(tempPath, { force: true });
