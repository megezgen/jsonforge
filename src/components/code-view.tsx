"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorPanel } from "@/components/error-panel";
import { MonacoView } from "@/components/monaco";
import type { CodeLang } from "@/lib/types";
import { engine } from "@/lib/worker-client";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";

const LANGS: { id: CodeLang; label: string; monaco: string }[] = [
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "go", label: "Go", monaco: "go" },
  { id: "python", label: "Python (Pydantic)", monaco: "python" },
  { id: "zod", label: "Zod", monaco: "typescript" },
  { id: "jsonschema", label: "JSON Schema", monaco: "json" },
  { id: "rust", label: "Rust", monaco: "rust" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "yaml", label: "YAML", monaco: "yaml" },
  { id: "csv", label: "CSV", monaco: "plaintext" },
  { id: "xml", label: "XML", monaco: "xml" },
];

export function CodeView({ initialLang = "typescript" }: { initialLang?: CodeLang }) {
  const status = useApp((s) => s.status);
  const version = useApp((s) => s.version);
  const setCodeOutput = useApp((s) => s.setCodeOutput);
  const [lang, setLang] = useState<CodeLang>(initialLang);
  const [rootName, setRootName] = useState("Root");
  const [code, setCode] = useState("");
  const seq = useRef(0);

  useEffect(() => {
    if (status !== "valid") return;
    const id = ++seq.current;
    engine
      .codegen(lang, rootName.trim() || "Root")
      .then((out) => {
        if (id !== seq.current) return;
        setCode(out);
        setCodeOutput(out);
      })
      .catch(() => {});
  }, [status, version, lang, rootName, setCodeOutput]);

  useEffect(() => () => setCodeOutput(""), [setCodeOutput]);

  if (status === "invalid") return <ErrorPanel />;
  if (status === "empty") {
    return <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted">Add JSON to generate typed models.</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-2 py-1.5">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Target format">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              aria-pressed={lang === l.id}
              className={cn(
                "h-7 cursor-pointer rounded-md px-2.5 text-xs",
                lang === l.id ? "bg-accentbg text-accentfg" : "text-muted hover:bg-panel2 hover:text-fg",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-muted">
          Root name
          <input
            aria-label="Root name"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="h-7 w-28 rounded-md border border-line bg-bg px-2 text-xs text-fg outline-none focus:border-accent"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1">
        <MonacoView value={code} language={LANGS.find((l) => l.id === lang)!.monaco} readOnly />
      </div>
    </div>
  );
}
