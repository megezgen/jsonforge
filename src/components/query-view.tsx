"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/actions";
import type { QueryResult } from "@/lib/types";
import { engine } from "@/lib/worker-client";
import { cn, formatNumber } from "@/lib/utils";
import { useApp } from "@/store/app-store";

const EXAMPLES = ["$..name", "$.tags[*]", "$..[?(@.active == true)]", "$.*"];

const valueColor: Record<string, string> = {
  string: "text-tstr",
  number: "text-tnum",
  boolean: "text-tbool",
  null: "text-tnull",
};

export function QueryView() {
  const status = useApp((s) => s.status);
  const version = useApp((s) => s.version);
  const queryText = useApp((s) => s.queryText);
  const setQueryText = useApp((s) => s.setQueryText);
  const notify = useApp((s) => s.notify);
  const [result, setResult] = useState<QueryResult | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!queryText.trim() || status !== "valid") {
      setResult(null);
      return;
    }
    const id = ++seq.current;
    const t = setTimeout(() => {
      engine
        .query(queryText)
        .then((r) => {
          if (id === seq.current) setResult(r);
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [queryText, version, status]);

  const copyValues = async () => {
    const r = await engine.query(queryText, true);
    if (r.ok && r.valuesJson !== null) {
      await copyText(r.valuesJson);
      notify("success", `Copied ${formatNumber(r.total)} values`);
    }
  };

  if (status === "invalid") return <ErrorPanel />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 border-b border-line p-2">
        <div className="flex items-center gap-2">
          <label htmlFor="jsonpath" className="sr-only">
            JSONPath expression
          </label>
          <input
            id="jsonpath"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            spellCheck={false}
            placeholder="JSONPath, e.g. $.users[*].name"
            className="h-8 min-w-0 flex-1 rounded-md border border-line bg-bg px-2 font-mono text-xs outline-none focus:border-accent"
          />
          <Button size="sm" disabled={!result?.ok || result.total === 0} onClick={() => void copyValues()} title="Copy all matched values as a JSON array">
            <Copy /> Copy values
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-muted">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setQueryText(ex)} className="cursor-pointer rounded bg-panel2 px-1.5 py-0.5 font-mono text-[11px] hover:brightness-125">
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 text-sm" role="region" aria-label="JSONPath results" aria-live="polite">
        {!queryText.trim() && <p className="text-muted">Type a JSONPath expression to query the JSON in the editor.</p>}
        {queryText.trim() && status === "empty" && <p className="text-muted">Add JSON on the left to query it.</p>}
        {result && !result.ok && <p className="text-danger">{result.error}</p>}
        {result?.ok && result.total === 0 && <p className="text-muted">No matches.</p>}
        {result?.ok && result.total > 0 && (
          <div>
            <p className="mb-2 text-xs text-muted">
              {formatNumber(result.total)} {result.total === 1 ? "match" : "matches"}
              {result.total > result.items.length && `, showing the first ${formatNumber(result.items.length)}`}
            </p>
            <ul className="space-y-1">
              {result.items.map((i, n) => (
                <li key={n} className="rounded-md border border-line bg-panel px-2 py-1.5">
                  <code className="block break-all font-mono text-[11px] text-tkey">{i.path}</code>
                  <code className={cn("mt-0.5 block break-all font-mono text-xs", valueColor[i.type])}>{i.preview}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
