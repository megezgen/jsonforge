"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { editorBridge } from "@/lib/editor-bridge";
import type { DiffResponse } from "@/lib/types";
import { engine } from "@/lib/worker-client";
import { cn, formatNumber } from "@/lib/utils";
import { useApp } from "@/store/app-store";

const ROW = 20;

export function DiffView() {
  const version = useApp((s) => s.version);
  const status = useApp((s) => s.status);
  const sortKeys = useApp((s) => s.sortKeys);
  const compareText = useApp((s) => s.compareText);
  const setCompareText = useApp((s) => s.setCompareText);
  const [ignoreOrder, setIgnoreOrder] = useState(true);
  const [changesOnly, setChangesOnly] = useState(false);
  const [result, setResult] = useState<DiffResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!compareText.trim()) {
      setResult(null);
      return;
    }
    const id = ++seq.current;
    const t = setTimeout(() => {
      engine
        .diff(editorBridge.getValue(), compareText, ignoreOrder || sortKeys)
        .then((r) => {
          if (id === seq.current) setResult(r);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [compareText, ignoreOrder, sortKeys, version, status]);

  const lines = useMemo(() => {
    if (!result || !result.ok) return [];
    if (!changesOnly) return result.lines;
    // Keep two lines of context around each change.
    const keep = new Set<number>();
    result.lines.forEach((l, i) => {
      if (l.kind !== "same") for (let j = Math.max(0, i - 2); j <= Math.min(result.lines.length - 1, i + 2); j++) keep.add(j);
    });
    return result.lines.filter((_, i) => keep.has(i));
  }, [result, changesOnly]);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW,
    overscan: 30,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-1 border-b border-line p-2">
        <label htmlFor="compare" className="text-xs text-muted">
          Compare the editor content against this JSON:
        </label>
        <textarea
          id="compare"
          value={compareText}
          onChange={(e) => setCompareText(e.target.value)}
          spellCheck={false}
          placeholder='Paste the second JSON here, e.g. {"name": "Ada"}'
          className="h-24 resize-y rounded-md border border-line bg-bg p-2 font-mono text-xs outline-none focus:border-accent"
        />
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={ignoreOrder} onChange={(e) => setIgnoreOrder(e.target.checked)} /> Ignore key order
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={changesOnly} onChange={(e) => setChangesOnly(e.target.checked)} /> Changes only
          </label>
          {result?.ok && (
            <span className="ml-auto">
              <span className="text-ok">+{formatNumber(result.added)}</span> <span className="text-danger">−{formatNumber(result.removed)}</span>
              {result.added + result.removed === 0 && " · identical"}
            </span>
          )}
        </div>
      </div>

      {!compareText.trim() && <Hint text="Paste a second JSON document above to see the differences." />}
      {result && !result.ok && (
        <Hint
          danger
          text={`The ${result.side === "left" ? "editor content" : "comparison JSON"} is not valid JSON: ${result.error.message}${result.error.line ? ` (line ${result.error.line})` : ""}`}
        />
      )}

      {result?.ok && (
        <>
          {result.truncated && <div className="bg-warn/15 px-3 py-1 text-xs text-warn">Diff truncated to the first {formatNumber(result.lines.length)} lines.</div>}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto font-mono text-xs">
            <div style={{ height: virtualizer.getTotalSize(), position: "relative", minWidth: "max-content" }}>
              {virtualizer.getVirtualItems().map((v) => {
                const l = lines[v.index];
                if (!l) return null;
                return (
                  <div
                    key={v.index}
                    className={cn("absolute left-0 flex w-full items-center whitespace-pre", l.kind === "add" && "bg-[var(--add)]", l.kind === "del" && "bg-[var(--del)]")}
                    style={{ height: ROW, transform: `translateY(${v.start}px)` }}
                  >
                    <span className="w-10 shrink-0 select-none pr-2 text-right text-muted">{l.oldNo ?? ""}</span>
                    <span className="w-10 shrink-0 select-none pr-2 text-right text-muted">{l.newNo ?? ""}</span>
                    <span className={cn("w-4 shrink-0 select-none text-center", l.kind === "add" && "text-ok", l.kind === "del" && "text-danger")}>
                      {l.kind === "add" ? "+" : l.kind === "del" ? "−" : ""}
                    </span>
                    <span>{l.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Hint({ text, danger }: { text: string; danger?: boolean }) {
  return <div className={cn("p-4 text-sm", danger ? "text-danger" : "text-muted")}>{text}</div>;
}
