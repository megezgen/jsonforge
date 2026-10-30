"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Copy, Link2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/error-panel";
import { copyText, editTree } from "@/lib/actions";
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

interface Editing {
  id: string;
  mode: "value" | "key";
  initial: string;
  /** The value was a string, so text that is not valid JSON is kept as a string. */
  wasString: boolean;
}

function EditInput({ initial, label, onCommit, onCancel }: { initial: string; label: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(initial);
  const done = useRef(false);
  return (
    <input
      autoFocus
      aria-label={label}
      value={v}
      spellCheck={false}
      onChange={(e) => setV(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          done.current = true;
          onCommit(v);
        } else if (e.key === "Escape") {
          done.current = true;
          onCancel();
        }
      }}
      onBlur={() => {
        if (done.current) return;
        if (v !== initial) onCommit(v);
        else onCancel();
      }}
      className="h-5 min-w-24 max-w-[60%] flex-1 rounded border border-accent bg-bg px-1 font-mono text-[12px] outline-none"
    />
  );
}

const Row = memo(function Row({
  row,
  editable,
  editing,
  onToggle,
  onCopyValue,
  onCopyPath,
  onStartValue,
  onStartKey,
  onCommit,
  onCancel,
  onDelete,
  onAdd,
}: {
  row: TreeRow;
  editable: boolean;
  editing: Editing | null;
  onToggle: (id: string) => void;
  onCopyValue: (id: string) => void;
  onCopyPath: (id: string) => void;
  onStartValue: (row: TreeRow) => void;
  onStartKey: (row: TreeRow) => void;
  onCommit: (e: Editing, text: string) => void;
  onCancel: () => void;
  onDelete: (row: TreeRow) => void;
  onAdd: (row: TreeRow) => void;
}) {
  const container = row.type === "object" || row.type === "array";
  const open = row.type === "object" ? "{" : "[";
  const close = row.type === "object" ? "}" : "]";
  const isRoot = row.label === null;
  const btn = "rounded p-1 text-muted hover:bg-line hover:text-fg";
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
          {editing?.mode === "key" ? (
            <EditInput initial={editing.initial} label="Rename key" onCommit={(t) => onCommit(editing, t)} onCancel={onCancel} />
          ) : (
            <span
              className={row.isIndex ? "text-muted" : "text-tkey"}
              onDoubleClick={editable && !row.isIndex ? (e) => (e.stopPropagation(), onStartKey(row)) : undefined}
              title={editable && !row.isIndex ? "Double-click to rename" : undefined}
            >
              {row.isIndex ? row.label : JSON.stringify(row.label)}
            </span>
          )}
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
      ) : editing?.mode === "value" ? (
        <EditInput initial={editing.initial} label="New value" onCommit={(t) => onCommit(editing, t)} onCancel={onCancel} />
      ) : (
        <span
          className={cn("truncate", valueColor[row.type])}
          onDoubleClick={editable ? (e) => (e.stopPropagation(), onStartValue(row)) : undefined}
          title={editable ? "Double-click to edit" : undefined}
        >
          {row.preview}
        </span>
      )}
      <span className="ml-auto hidden shrink-0 items-center gap-0.5 group-focus-within:flex group-hover:flex">
        {editable && !container && (
          <button
            aria-label="Edit value"
            title="Edit value"
            className={btn}
            onClick={(e) => {
              e.stopPropagation();
              onStartValue(row);
            }}
          >
            <Pencil className="size-3" />
          </button>
        )}
        {editable && container && (
          <button
            aria-label={row.type === "array" ? "Add item" : "Add property"}
            title={row.type === "array" ? "Add item" : "Add property"}
            className={btn}
            onClick={(e) => {
              e.stopPropagation();
              onAdd(row);
            }}
          >
            <Plus className="size-3" />
          </button>
        )}
        {editable && !isRoot && (
          <button
            aria-label="Delete"
            title="Delete (Ctrl+Z in the editor undoes it)"
            className={btn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
          >
            <Trash2 className="size-3" />
          </button>
        )}
        <button
          title="Copy value"
          className={btn}
          onClick={(e) => {
            e.stopPropagation();
            onCopyValue(row.id);
          }}
        >
          <Copy className="size-3" />
        </button>
        <button
          title="Copy path"
          className={btn}
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
  const large = useApp((s) => s.large);
  const notify = useApp((s) => s.notify);

  const [defaultDepth, setDefaultDepth] = useState(2);
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [data, setData] = useState<TreeResponse | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reqSeq = useRef(0);

  // Editing re-serialises the whole document, so it is limited to documents the editor treats as normal-sized.
  const editable = status === "valid" && !large;

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

  const startValue = useCallback(async (row: TreeRow) => {
    const node = await engine.node(row.id);
    const wasString = row.type === "string";
    // Strings are shown with their quotes so that typing a number or true changes the type on purpose.
    setEditing({ id: row.id, mode: "value", initial: wasString ? JSON.stringify(node.json) : node.json, wasString });
  }, []);

  const startKey = useCallback((row: TreeRow) => {
    setEditing({ id: row.id, mode: "key", initial: row.label ?? "", wasString: false });
  }, []);

  const cancel = useCallback(() => setEditing(null), []);

  const commit = useCallback(async (e: Editing, text: string) => {
    let res;
    if (e.mode === "key") {
      res = await editTree({ action: "rename", pointer: e.id, name: text });
    } else {
      let value = text;
      try {
        JSON.parse(text);
      } catch {
        // Text that is not JSON stays a string when the value already was one.
        if (e.wasString) value = JSON.stringify(text);
      }
      res = await editTree({ action: "set", pointer: e.id, value });
    }
    if (res.ok) setEditing(null);
  }, []);

  const remove = useCallback(
    async (row: TreeRow) => {
      const res = await editTree({ action: "delete", pointer: row.id });
      if (res.ok) notify("info", "Deleted. Press Ctrl+Z in the editor to undo.");
    },
    [notify],
  );

  const add = useCallback(
    async (row: TreeRow) => {
      const res = await editTree({ action: "add", pointer: row.id });
      if (!res.ok || !res.newPointer) return;
      if (!row.expanded) toggle(row.id);
      // A new array item starts as null (edit its value); a new property gets a placeholder key to rename.
      setEditing(
        row.type === "array"
          ? { id: res.newPointer, mode: "value", initial: "null", wasString: false }
          : { id: res.newPointer, mode: "key", initial: res.newPointer.split("/").pop()!.replace(/~1/g, "/").replace(/~0/g, "~"), wasString: false },
      );
    },
    [toggle],
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
      {large && (
        <div className="border-b border-line bg-panel px-3 py-1 text-xs text-muted">Editing in the tree is turned off for large documents. Edit in the editor instead.</div>
      )}
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
                <Row
                  row={row}
                  editable={editable}
                  editing={editing?.id === row.id ? editing : null}
                  onToggle={toggle}
                  onCopyValue={copyValue}
                  onCopyPath={copyPath}
                  onStartValue={startValue}
                  onStartKey={startKey}
                  onCommit={commit}
                  onCancel={cancel}
                  onDelete={remove}
                  onAdd={add}
                />
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
