"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { Button } from "@/components/ui/button";
import type { SchemaResult } from "@/lib/types";
import { engine } from "@/lib/worker-client";
import { formatNumber } from "@/lib/utils";
import { useApp } from "@/store/app-store";

export function SchemaView() {
  const status = useApp((s) => s.status);
  const version = useApp((s) => s.version);
  const schemaText = useApp((s) => s.schemaText);
  const setSchemaText = useApp((s) => s.setSchemaText);
  const notify = useApp((s) => s.notify);
  const [result, setResult] = useState<SchemaResult | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!schemaText.trim() || status !== "valid") {
      setResult(null);
      return;
    }
    const id = ++seq.current;
    const t = setTimeout(() => {
      engine
        .schema(schemaText)
        .then((r) => {
          if (id === seq.current) setResult(r);
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [schemaText, version, status]);

  const generate = async () => {
    if (status !== "valid") return notify("error", "Add valid JSON on the left first");
    const text = await engine.codegen("jsonschema", "Root");
    setSchemaText(text);
    notify("success", "Schema generated from your JSON");
  };

  if (status === "invalid") return <ErrorPanel />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-1 border-b border-line p-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="schema" className="text-xs text-muted">
            Validate the editor content against this JSON Schema:
          </label>
          <Button size="sm" onClick={() => void generate()} title="Infer a schema from the JSON in the editor">
            <Sparkles /> Generate from JSON
          </Button>
        </div>
        <textarea
          id="schema"
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
          spellCheck={false}
          placeholder={'Paste a JSON Schema, e.g. {"type": "object", "required": ["id"]}'}
          className="h-40 resize-y rounded-md border border-line bg-bg p-2 font-mono text-xs outline-none focus:border-accent"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 text-sm" role="region" aria-label="Schema validation result" aria-live="polite">
        {!schemaText.trim() && <p className="text-muted">Paste a schema above, or generate one from your JSON, to see validation results.</p>}
        {schemaText.trim() && status === "empty" && <p className="text-muted">Add JSON on the left to validate it.</p>}
        {result && !result.ok && <p className="text-danger">{result.error}</p>}
        {result?.ok && result.valid && (
          <p className="flex items-center gap-2 text-ok">
            <CheckCircle2 className="size-4" /> Valid: the JSON matches the schema (draft {result.draft}).
          </p>
        )}
        {result?.ok && !result.valid && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-danger">
              <XCircle className="size-4" /> {formatNumber(result.total)} {result.total === 1 ? "problem" : "problems"} found (draft {result.draft})
            </p>
            <ul className="space-y-1.5">
              {result.issues.map((i, n) => (
                <li key={n} className="rounded-md border border-line bg-panel p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="font-mono text-xs text-tkey">{i.path}</code>
                    <span className="rounded bg-panel2 px-1.5 py-0.5 text-[11px] text-muted">{i.keyword}</span>
                  </div>
                  <p className="mt-1 text-xs">{i.message}</p>
                </li>
              ))}
            </ul>
            {result.total > result.issues.length && <p className="mt-2 text-xs text-muted">Showing the first {result.issues.length} problems.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
