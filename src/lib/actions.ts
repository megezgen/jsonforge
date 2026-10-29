import { editorBridge } from "./editor-bridge";
import { buildSample, type SampleSize } from "./samples";
import { engine } from "./worker-client";
import { useApp } from "@/store/app-store";

const LARGE_THRESHOLD = 1_500_000;
let parseSeq = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

const app = () => useApp.getState();

/** Parses the editor content in the worker. Newest call wins. */
export async function parseNow(): Promise<boolean> {
  clearTimeout(timer);
  const text = editorBridge.getValue();
  const seq = ++parseSeq;
  const large = text.length > LARGE_THRESHOLD;
  if (!text.trim()) {
    app().setStatus({ status: "empty", stats: null, error: null, large: false });
    return false;
  }
  app().setStatus({ status: "parsing", large });
  try {
    const res = await engine.parse(text);
    if (seq !== parseSeq) return false;
    if (res.ok) {
      app().setStatus({ status: "valid", stats: res.stats, error: null });
      app().bumpVersion();
      return true;
    }
    app().setStatus({ status: "invalid", stats: null, error: res.error });
    return false;
  } catch (err) {
    if (seq === parseSeq) app().notify("error", err instanceof Error ? err.message : "Parsing failed");
    return false;
  }
}

/** Debounced parse used while typing. Bigger documents wait longer. */
export function scheduleParse() {
  clearTimeout(timer);
  const size = editorBridge.getValue().length;
  const delay = size > 5_000_000 ? 900 : size > LARGE_THRESHOLD ? 500 : 250;
  timer = setTimeout(() => void parseNow(), delay);
}

export async function formatInput() {
  if (!(await parseNow())) return reportInvalid();
  const text = await engine.format(app().indent === "compact" ? "2" : app().indent, app().sortKeys);
  editorBridge.setValue(text);
  app().notify("success", "Formatted");
}

export async function minifyInput() {
  if (!(await parseNow())) return reportInvalid();
  editorBridge.setValue(await engine.format("compact", app().sortKeys));
  app().notify("success", "Minified");
}

export async function validateInput() {
  const ok = await parseNow();
  if (ok) app().notify("success", "Valid JSON");
  else reportInvalid();
}

export function clearInput() {
  editorBridge.setValue("");
  app().setCompareText("");
}

export async function fixInput() {
  const text = editorBridge.getValue();
  if (!text.trim()) return app().notify("info", "Nothing to fix");
  try {
    const fixed = await engine.repair(text);
    editorBridge.setValue(fixed);
    if (await parseNow()) {
      const formatted = await engine.format(app().indent === "compact" ? "2" : app().indent, app().sortKeys);
      editorBridge.setValue(formatted);
      app().notify("success", "JSON repaired");
    }
  } catch {
    app().notify("error", "Could not repair this input automatically");
  }
}

export function loadSample(size: SampleSize) {
  editorBridge.setValue(buildSample(size));
  void parseNow();
}

/** Text shown by the active output tab, used by Copy and Download. */
async function currentOutput(): Promise<string | null> {
  const { activeTab, codeOutput, indent, sortKeys, status } = app();
  if (activeTab === "code") return codeOutput || null;
  if (status !== "valid") return null;
  return engine.format(indent, sortKeys);
}

export async function copyOutput() {
  const text = await currentOutput();
  if (text === null) return app().notify("error", "Nothing to copy: the input is empty or invalid");
  await copyText(text);
  app().notify("success", "Output copied");
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export async function downloadJson() {
  let text: string | null = null;
  if (app().status === "valid") text = await engine.format(app().indent, app().sortKeys);
  else text = editorBridge.getValue() || null;
  if (!text) return app().notify("error", "Nothing to download");
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadFile(file: File) {
  editorBridge.setValue(await file.text());
  void parseNow();
}

function reportInvalid() {
  const { error } = app();
  const where = error && error.line ? ` (line ${error.line}, column ${error.column})` : "";
  app().notify("error", `${error?.message ?? "Invalid JSON"}${where}`);
}
