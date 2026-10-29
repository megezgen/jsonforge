"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Copy, Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/error-panel";
import { copyText } from "@/lib/actions";
import type { TreeResponse, TreeRow } from "@/lib/types";
import { engine } from "@/lib/worker-client";
import { cn, formatNumber } from "@/lib/utils";
import { useApp } from "@/store/app-store";

const ROW_HEIGHT = 24;
const INDENT = 16;

const valueColor: Record<string, string> = {
  string: "text-tstr",
  number: "text-tnum",
  boolean: "text-tbool",
  null: "text-tnull",
};

const Row = memo(function Row({
  row,
  onToggle,
  onCopyValue,
  onCopyPath,
}: {
  row: TreeRow;
  onToggle: (id: string) => void;
  onCopyValue: (id: string) => void;
  onCopyPath: (id: string) => void;
}) {
  const container = row.type === "object" || row.type === "array";
  const open = row.type === "object" ? "{" : "[";
  const close = row.type === "object" ? "}" : "]";
  return (
    <div
      className={cn(
        "group flex h-full items-center gap-1 pr-2 font-mono text-[13px] hover:bg-panel2",
        row.match && "bg-warn/20",
        container && "cursor-pointer",
      )}
      style={{ paddingLeft: 8 + row.depth * INDENT }}
      onClick={container ? () => onToggle(row.id) : undefined}
      role="treeitem"
      aria-expanded={container ? row.expanded : undefined}
      aria-level={row.depth + 1}
    >
      <span className="flex size-4 shrink-0 items-center justify-center text-muted">
        {container && (row.expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />)}
      </span>
      {row.label !== null && (
        <>
          <span className={row.isIndex ? "text-muted" : "text-tkey"}>{row.isIndex ? row.label : JSON.stringify(row.label)}</span>
          <span className="text-muted">:</span>
        </>
      )}
      {container ? (
        <span className="truncate text-muted">
          {open}
          {!row.expanded && (row.count > 0 ? "…" : "")}
          {(!row.expanded || row.count === 0) && close}
          <span className="ml-2 text-[11px]">
            {formatNumber(row.count)} {row.type === "array" ? (row.count === 1 ? "item" : "items") : row.count === 1 ? "key" : "keys"}
          </span>
        </span>
      ) : (
        <span className={cn("truncate", valueColor[row.type])}>{row.preview}</span>
      )}
      <span className="ml-auto hidden shrink-0 items-center gap-0.5 group-hover:flex">
        <button
          title="Copy value"
          className="rounded p-1 text-muted hover:bg-line hover:text-fg"
          onClick={(e) => {
            e.stopPropagation();
            onCopyValue(row.id);
          }}
        >
          <Copy className="size-3" />
        </button>
        <button
          title="Copy path"
          className="rounded p-1 text-muted hover:bg-line hover:text-fg"
          onClick={(e) => {
            e.stopPropagation();
            onCopyPath(row.id);
          }}
        >
          <Link2 className="size-3" />
        </button>
      </span>
    </div>
  );
});

export function TreeView() {
  const status = useApp((s) => s.status);
  const version = useApp((s) => s.version);
  const notify = useApp((s) => s.notify);

  const [defaultDepth, setDefaultDepth] = useState(2);
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [data, setData] = useState<TreeResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reqSeq = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (status !== "valid") return;
    const seq = ++reqSeq.current;
    engine
      .tree({ defaultDepth, toggled: [...toggled], query: debounced })
      .then((res) => {
        if (seq === reqSeq.current) setData(res);
      })
      .catch(() => {});
  }, [status, version, defaultDepth, toggled, debounced]);

  const rows = data?.rows ?? [];
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 24,
  });

  const toggle = useCallback((id: string) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const copyValue = useCallback(
    async (id: string) => {
      const node = await engine.node(id);
      await copyText(node.json);
      notify("success", "Value copied");
    },
    [notify],
  );
  const copyPath = useCallback(
    async (id: string) => {
      const node = await engine.node(id);
      await copyText(node.path);
      notify("success", `Copied ${node.path}`);
    },
    [notify],
  );

  const setLevel = (depth: number) => {
    setToggled(new Set());
    setDefaultDepth(depth);
  };

  if (status === "invalid") return <ErrorPanel />;
  if (status === "empty") return <Empty text="Paste or type JSON on the left to explore it as a tree." />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-2 py-1.5">
        <label className="relative min-w-40 flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keys and values…"
            aria-label="Search keys and values"
            className="h-7 w-full rounded-md border border-line bg-bg pl-7 pr-2 text-xs outline-none focus:border-accent"
          />
        </label>
        {debounced && data && <span className="text-xs text-muted">{formatNumber(data.matches)} matches</span>}
        <Button size="sm" variant="ghost" title="Expand all" onClick={() => setLevel(Number.MAX_SAFE_INTEGER)}>
          <ChevronsUpDown /> Expand
        </Button>
        <Button size="sm" variant="ghost" title="Collapse all" onClick={() => setLevel(1)}>
          <ChevronsDownUp /> Collapse
        </Button>
      </div>
      {data?.truncated && (
        <div className="border-b border-line bg-warn/15 px-3 py-1 text-xs text-warn">
          Showing the first {formatNumber(rows.length)} rows. Collapse some nodes or use search to narrow the view.
        </div>
      )}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto" role="tree" aria-label="JSON tree">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", minWidth: "100%" }}>
          {virtualizer.getVirtualItems().map((v) => {
            const row = rows[v.index];
            if (!row) return null;
            return (
              <div
                key={row.id}
                className="absolute left-0 top-0 w-full"
                style={{ height: ROW_HEIGHT, transform: `translateY(${v.start}px)` }}
              >
                <Row row={row} onToggle={toggle} onCopyValue={copyValue} onCopyPath={copyPath} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">{text}</div>;
}
