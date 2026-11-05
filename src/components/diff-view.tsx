"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowLeftRight } from "lucide-react";
import { editorBridge } from "@/lib/editor-bridge";
import type { DiffLine, DiffOptions, DiffResponse } from "@/lib/types";
import { engine } from "@/lib/worker-client";
import { cn, formatNumber } from "@/lib/utils";
import { useApp } from "@/store/app-store";

const ROW = 20;

type Mode = DiffOptions["mode"];
type View = "split" | "unified";
interface SplitRow {
  l: DiffLine | null;
  r: DiffLine | null;
}

/** Lines the user may want to see: every change plus two lines of context around it. */
function withContext(lines: DiffLine[]): DiffLine[] {
  const keep = new Set<number>();
  lines.forEach((l, i) => {
    if (l.kind !== "same") for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) keep.add(j);
  });
  return lines.filter((_, i) => keep.has(i));
}

/** Pairs each removed block with the added block that follows it, so edits sit on one row. */
function toSplit(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) break;
    if (line.kind === "same") {
      rows.push({ l: line, r: line });
      i++;
      continue;
    }
    const dels: DiffLine[] = [];
    const adds: DiffLine[] = [];
    for (let d = lines[i]; d && d.kind === "del"; d = lines[i]) {
      dels.push(d);
      i++;
    }
    for (let a = lines[i]; a && a.kind === "add"; a = lines[i]) {
      adds.push(a);
      i++;
    }
    for (let k = 0; k < Math.max(dels.length, adds.length); k++) rows.push({ l: dels[k] ?? null, r: adds[k] ?? null });
  }
  return rows;
}

function LineText({ line }: { line: DiffLine }) {
  if (!line.segs) return <>{line.text}</>;
  const strong = line.kind === "add" ? "bg-[var(--add-strong)]" : "bg-[var(--del-strong)]";
  return (
    <>
      {line.segs.map((s, i) => (
        <span key={i} className={s.c ? strong : undefined}>
          {s.t}
        </span>
      ))}
    </>
  );
}

export function DiffView({ defaultMode = "json" }: { defaultMode?: Mode }) {
  const version = useApp((s) => s.version);
  const status = useApp((s) => s.status);
  const sortKeys = useApp((s) => s.sortKeys);
  const compareText = useApp((s) => s.compareText);
  const setCompareText = useApp((s) => s.setCompareText);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [view, setView] = useState<View>("split");
  const [ignoreOrder, setIgnoreOrder] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [changesOnly, setChangesOnly] = useState(false);
  const [result, setResult] = useState<DiffResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => setMode(defaultMode), [defaultMode]);

  useEffect(() => {
    if (!compareText.trim()) {
      setResult(null);
      return;
    }
    const id = ++seq.current;
    const t = setTimeout(() => {
      engine
        .diff(editorBridge.getValue(), compareText, { mode, sortKeys: ignoreOrder || sortKeys, ignoreWhitespace, ignoreCase })
        .then((r) => {
          if (id === seq.current) setResult(r);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [compareText, mode, ignoreOrder, ignoreWhitespace, ignoreCase, sortKeys, version, status]);

  const lines = useMemo(() => {
    if (!result || !result.ok) return [];
    return changesOnly ? withContext(result.lines) : result.lines;
  }, [result, changesOnly]);
  const rows = useMemo(() => (view === "split" ? toSplit(lines) : []), [lines, view]);
  const count = view === "split" ? rows.length : lines.length;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW,
    overscan: 30,
  });

  const swap = () => {
    const left = editorBridge.getValue();
    editorBridge.setValue(compareText);
    setCompareText(left);
  };

  const json = mode === "json";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-1 border-b border-line p-2">
        <label htmlFor="compare" className="text-xs text-muted">
          {json ? "Compare the editor content against this JSON:" : "Compare the editor content against this text:"}
        </label>
        <textarea
          id="compare"
          value={compareText}
          onChange={(e) => setCompareText(e.target.value)}
          spellCheck={false}
          placeholder={json ? 'Paste the second JSON here, e.g. {"name": "Ada"}' : "Paste the second text here"}
          className="h-24 resize-y rounded-md border border-line bg-bg p-2 font-mono text-xs outline-none focus:border-accent"
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <Segmented
            label="Compare as"
            value={mode}
            onChange={setMode}
            options={[
              ["json", "JSON"],
              ["text", "Plain text"],
            ]}
          />
          <Segmented
            label="Layout"
            value={view}
            onChange={setView}
            options={[
              ["split", "Side by side"],
              ["unified", "Unified"],
            ]}
          />
          {json ? (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={ignoreOrder} onChange={(e) => setIgnoreOrder(e.target.checked)} /> Ignore key order
            </label>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} /> Ignore whitespace
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} /> Ignore case
              </label>
            </>
          )}
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={changesOnly} onChange={(e) => setChangesOnly(e.target.checked)} /> Changes only
          </label>
          <button
            type="button"
            onClick={swap}
            className="flex items-center gap-1 rounded-md border border-line px-2 py-0.5 hover:bg-panel2 hover:text-fg"
            title="Swap the editor content and the comparison text"
          >
            <ArrowLeftRight className="size-3" aria-hidden /> Swap sides
          </button>
          {result?.ok && (
            <span className="ml-auto">
              <span className="text-ok">+{formatNumber(result.added)}</span> <span className="text-danger">−{formatNumber(result.removed)}</span>
              {result.added + result.removed === 0 && " · identical"}
            </span>
          )}
        </div>
      </div>

      {!compareText.trim() && <Hint text={json ? "Paste a second JSON document above to see the differences." : "Paste a second text above to see the differences."} />}
      {result && !result.ok && (
        <Hint
          danger
          text={`The ${result.side === "left" ? "editor content" : "comparison JSON"} is not valid JSON: ${result.error.message}${result.error.line ? ` (line ${result.error.line})` : ""}. Switch to Plain text to compare it anyway.`}
        />
      )}

      {result?.ok && (
        <>
          {result.truncated && <div className="bg-warn/15 px-3 py-1 text-xs text-warn">Diff truncated to the first {formatNumber(result.lines.length)} lines.</div>}
          {view === "split" && (
            <div className="grid grid-cols-2 border-b border-line text-xs text-muted" aria-hidden>
              <div className="px-3 py-1">Editor (original)</div>
              <div className="border-l border-line px-3 py-1">Comparison (changed)</div>
            </div>
          )}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto font-mono text-xs">
            <div style={{ height: virtualizer.getTotalSize(), position: "relative", minWidth: view === "unified" ? "max-content" : undefined }}>
              {virtualizer.getVirtualItems().map((v) =>
                view === "split" ? (
                  <SplitRowView key={v.index} index={v.index} start={v.start} row={rows[v.index]} measure={virtualizer.measureElement} />
                ) : (
                  <UnifiedRowView key={v.index} start={v.start} line={lines[v.index]} />
                ),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UnifiedRowView({ line, start }: { line?: DiffLine; start: number }) {
  if (!line) return null;
  return (
    <div
      className={cn("absolute left-0 flex w-full items-center whitespace-pre", line.kind === "add" && "bg-[var(--add)]", line.kind === "del" && "bg-[var(--del)]")}
      style={{ height: ROW, transform: `translateY(${start}px)` }}
    >
      <span className="w-10 shrink-0 select-none pr-2 text-right text-muted">{line.oldNo ?? ""}</span>
      <span className="w-10 shrink-0 select-none pr-2 text-right text-muted">{line.newNo ?? ""}</span>
      <span className={cn("w-4 shrink-0 select-none text-center", line.kind === "add" && "text-ok", line.kind === "del" && "text-danger")}>
        {line.kind === "add" ? "+" : line.kind === "del" ? "−" : ""}
      </span>
      <span>
        <LineText line={line} />
      </span>
    </div>
  );
}

function SplitRowView({ row, start, index, measure }: { row?: SplitRow; start: number; index: number; measure: (el: Element | null) => void }) {
  if (!row) return null;
  return (
    <div ref={measure} data-index={index} className="absolute left-0 grid w-full grid-cols-2" style={{ minHeight: ROW, transform: `translateY(${start}px)` }}>
      <Half line={row.l} side="l" />
      <Half line={row.r} side="r" />
    </div>
  );
}

function Half({ line, side }: { line: DiffLine | null; side: "l" | "r" }) {
  const changed = line && line.kind !== "same";
  return (
    <div
      className={cn(
        "flex min-w-0 items-start",
        side === "r" && "border-l border-line",
        changed && line.kind === "add" && "bg-[var(--add)]",
        changed && line.kind === "del" && "bg-[var(--del)]",
        !line && "bg-panel2/60",
      )}
    >
      <span className="w-10 shrink-0 select-none pr-2 text-right leading-5 text-muted">{(side === "l" ? line?.oldNo : line?.newNo) ?? ""}</span>
      <span className="min-w-0 whitespace-pre-wrap break-all leading-5">{line ? <LineText line={line} /> : ""}</span>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1.5">
      <span>{label}:</span>
      <div className="flex overflow-hidden rounded-md border border-line">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={cn("px-2 py-0.5", value === v ? "bg-accentbg text-white" : "hover:bg-panel2 hover:text-fg")}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Hint({ text, danger }: { text: string; danger?: boolean }) {
  return <div className={cn("p-4 text-sm", danger ? "text-danger" : "text-muted")}>{text}</div>;
}
