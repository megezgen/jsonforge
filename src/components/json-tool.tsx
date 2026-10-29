"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Braces,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileText,
  GitCompare,
  Keyboard,
  ListTree,
  Minimize2,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Wand2,
  Wrench,
} from "lucide-react";
import { CodeView } from "@/components/code-view";
import { DiffView } from "@/components/diff-view";
import { InputEditor } from "@/components/input-editor";
import { QueryView } from "@/components/query-view";
import { SchemaView } from "@/components/schema-view";
import { StatusBar } from "@/components/status-bar";
import { TextView } from "@/components/text-view";
import { Toaster } from "@/components/toaster";
import { TreeView } from "@/components/tree-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  clearInput,
  copyOutput,
  downloadJson,
  fixInput,
  formatInput,
  loadFile,
  loadSample,
  minifyInput,
  validateInput,
} from "@/lib/actions";
import type { CodeLang, IndentOption } from "@/lib/types";
import { useApp, type OutputTab } from "@/store/app-store";

const SHORTCUTS: [string, string][] = [
  ["Ctrl/⌘ + Enter", "Format"],
  ["Ctrl/⌘ + Shift + Enter", "Minify"],
  ["Alt + Shift + V", "Validate"],
  ["Alt + Shift + F", "Fix JSON"],
  ["Alt + Shift + C", "Copy output"],
  ["Alt + Shift + D", "Download"],
  ["Alt + Shift + X", "Clear"],
];

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      let run: (() => void) | null = null;
      if (mod && e.key === "Enter") run = e.shiftKey ? () => void minifyInput() : () => void formatInput();
      else if (e.altKey && e.shiftKey && !mod) {
        if (e.code === "KeyV") run = () => void validateInput();
        else if (e.code === "KeyF") run = () => void fixInput();
        else if (e.code === "KeyC") run = () => void copyOutput();
        else if (e.code === "KeyD") run = () => void downloadJson();
        else if (e.code === "KeyX") run = clearInput;
      }
      if (run) {
        e.preventDefault();
        e.stopPropagation(); // keep Monaco from also handling Ctrl+Enter
        run();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
}

function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-panel px-2 py-1.5" role="toolbar" aria-label="JSON actions">
      <Button variant="default" onClick={() => void formatInput()} title="Format / Prettify (Ctrl+Enter)">
        <Wand2 /> Format
      </Button>
      <Button onClick={() => void minifyInput()} title="Minify / Compact (Ctrl+Shift+Enter)">
        <Minimize2 /> Minify
      </Button>
      <Button onClick={() => void validateInput()} title="Validate (Alt+Shift+V)">
        <CheckCircle2 /> Validate
      </Button>
      <Button onClick={() => void fixInput()} title="Repair quotes, commas and brackets (Alt+Shift+F)">
        <Wrench /> Fix JSON
      </Button>
      <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
      <div className="relative">
        <Button onClick={() => setSamplesOpen((o) => !o)} aria-expanded={samplesOpen} aria-haspopup="menu">
          <FileText /> Load Sample
        </Button>
        {samplesOpen && (
          <div role="menu" className="absolute left-0 top-9 z-30 w-52 rounded-md border border-line bg-panel p-1 shadow-xl" onMouseLeave={() => setSamplesOpen(false)}>
            {(
              [
                ["small", "Small", "~0.3 KB"],
                ["medium", "Medium", "~250 KB"],
                ["large", "Large", "~20 MB"],
              ] as const
            ).map(([id, label, size]) => (
              <button
                key={id}
                role="menuitem"
                className="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-panel2"
                onClick={() => {
                  setSamplesOpen(false);
                  loadSample(id);
                }}
              >
                {label} <span className="text-muted">{size}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button onClick={() => fileRef.current?.click()} title="Open a .json file">
        <Upload /> Open
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void loadFile(f);
          e.target.value = "";
        }}
      />
      <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
      <Button onClick={() => void copyOutput()} title="Copy output (Alt+Shift+C)">
        <Copy /> Copy Output
      </Button>
      <Button onClick={() => void downloadJson()} title="Download .json (Alt+Shift+D)">
        <Download /> Download
      </Button>
      <Button variant="ghost" onClick={clearInput} title="Clear (Alt+Shift+X)">
        <Trash2 /> Clear
      </Button>
      <div className="relative ml-auto">
        <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts" aria-expanded={keysOpen} onClick={() => setKeysOpen((o) => !o)}>
          <Keyboard />
        </Button>
        {keysOpen && (
          <div className="absolute right-0 top-9 z-30 w-64 rounded-md border border-line bg-panel p-2 shadow-xl" onMouseLeave={() => setKeysOpen(false)}>
            <p className="px-1 pb-1 text-xs font-semibold">Keyboard shortcuts</p>
            {SHORTCUTS.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-1 py-0.5 text-xs">
                <span className="text-muted">{v}</span>
                <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OutputOptions() {
  const indent = useApp((s) => s.indent);
  const setIndent = useApp((s) => s.setIndent);
  const sortKeys = useApp((s) => s.sortKeys);
  const setSortKeys = useApp((s) => s.setSortKeys);
  return (
    <div className="ml-auto flex shrink-0 items-center gap-3 whitespace-nowrap pr-2 text-xs text-muted">
      <label className="flex items-center gap-1.5">
        Indent
        <select
          value={indent}
          onChange={(e) => setIndent(e.target.value as IndentOption)}
          className="h-6 cursor-pointer rounded border border-line bg-bg px-1 text-xs text-fg"
          aria-label="Indentation"
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="compact">Compact</option>
        </select>
      </label>
      <label className="hidden cursor-pointer items-center gap-1.5 sm:flex">
        <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} /> Sort keys
      </label>
    </div>
  );
}

function useSplit() {
  const [pct, setPct] = useState(50);
  const container = useRef<HTMLDivElement>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = container.current;
    if (!el) return;
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setPct(Math.min(80, Math.max(20, ((ev.clientX - r.left) / r.width) * 100)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, []);
  return { pct, container, onPointerDown };
}

export function JsonTool({
  initialTab = "tree",
  initialCodeLang = "typescript",
  initialIndent = "2",
  initialSortKeys = false,
}: {
  initialTab?: OutputTab;
  initialCodeLang?: CodeLang;
  initialIndent?: IndentOption;
  initialSortKeys?: boolean;
}) {
  useShortcuts();
  const activeTab = useApp((s) => s.activeTab);
  const setActiveTab = useApp((s) => s.setActiveTab);
  const setIndent = useApp((s) => s.setIndent);
  const setSortKeys = useApp((s) => s.setSortKeys);
  const { pct, container, onPointerDown } = useSplit();

  useEffect(() => {
    setActiveTab(initialTab);
    setIndent(initialIndent);
    setSortKeys(initialSortKeys);
  }, [initialTab, initialIndent, initialSortKeys, setActiveTab, setIndent, setSortKeys]);

  return (
    <section aria-label="JSON editor" className="flex h-[900px] lg:h-[max(560px,calc(100dvh-10rem))] flex-col overflow-hidden border-y border-line bg-bg">
      <Toolbar />
      <div
        ref={container}
        className="grid min-h-0 flex-1 grid-rows-2 lg:grid-cols-[var(--left)_auto_minmax(0,1fr)] lg:grid-rows-1"
        style={{ ["--left" as string]: `${pct}%` }}
      >
        <div className="min-h-0 min-w-0 border-b border-line lg:border-b-0">
          <InputEditor />
        </div>
        <div
          onPointerDown={onPointerDown}
          role="separator"
          aria-orientation="vertical"
          className="hidden w-1 cursor-col-resize bg-line transition-colors hover:bg-accent lg:block"
        />
        <div className="flex min-h-0 min-w-0 flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OutputTab)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center border-b border-line bg-panel">
              <TabsList aria-label="Output views" className="min-w-0 overflow-x-auto">
                <TabsTrigger value="tree">
                  <ListTree /> Tree
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Braces /> Formatted
                </TabsTrigger>
                <TabsTrigger value="diff">
                  <GitCompare /> Diff
                </TabsTrigger>
                <TabsTrigger value="schema">
                  <ShieldCheck /> Schema
                </TabsTrigger>
                <TabsTrigger value="query">
                  <Search /> Query
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code2 /> Code
                </TabsTrigger>
              </TabsList>
              <OutputOptions />
            </div>
            <TabsContent value="tree">
              <TreeView />
            </TabsContent>
            <TabsContent value="text">
              <TextView />
            </TabsContent>
            <TabsContent value="diff">
              <DiffView />
            </TabsContent>
            <TabsContent value="schema">
              <SchemaView />
            </TabsContent>
            <TabsContent value="query">
              <QueryView />
            </TabsContent>
            <TabsContent value="code">
              <CodeView initialLang={initialCodeLang} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <StatusBar />
      <Toaster />
    </section>
  );
}
