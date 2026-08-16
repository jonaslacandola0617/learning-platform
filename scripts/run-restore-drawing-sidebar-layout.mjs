import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const helperPath = path.join(process.cwd(), "scripts", "restore-drawing-sidebar-layout.mjs");
const tempPath = path.join(os.tmpdir(), `restore-drawing-sidebar-layout-${Date.now()}.mjs`);
let helper = fs.readFileSync(helperPath, "utf8");

helper = helper.replace("${pdfNote}", "\\${pdfNote}");

const marker = "const replacement = `";
const bodyStart = helper.indexOf(marker) + marker.length;
const bodyEnd = helper.indexOf("`;\nsource = source.slice", bodyStart);
if (bodyStart < marker.length || bodyEnd === -1) throw new Error("Could not locate replacement template");
const body = helper.slice(bodyStart, bodyEnd).replace(/\$\{/g, "\\${");
helper = helper.slice(0, bodyStart) + body + helper.slice(bodyEnd);

fs.writeFileSync(tempPath, helper);
await import(pathToFileURL(tempPath).href);
fs.rmSync(tempPath, { force: true });
