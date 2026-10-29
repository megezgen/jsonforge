"use client";

import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useApp } from "@/store/app-store";

// Serve Monaco from our own origin (see scripts/copy-monaco.mjs): no CDN, no third-party requests.
loader.config({ paths: { vs: "/monaco/vs" } });

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-xs text-muted">Loading editor…</div>,
});

interface CodeViewProps {
  value?: string;
  defaultValue?: string;
  language: string;
  readOnly?: boolean;
  minimap?: boolean;
  onChange?: (value: string) => void;
  onMount?: OnMount;
}

/** Thin wrapper around Monaco that follows the app theme. */
export function MonacoView({ value, defaultValue, language, readOnly, minimap, onChange, onMount }: CodeViewProps) {
  const theme = useApp((s) => s.theme);
  return (
    <MonacoEditor
      value={value}
      defaultValue={defaultValue}
      language={language}
      theme={theme === "dark" ? "vs-dark" : "light"}
      onChange={(v) => onChange?.(v ?? "")}
      beforeMount={(monaco) => {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: false,
          trailingCommas: "error",
        });
      }}
      onMount={onMount}
      options={{
        readOnly,
        minimap: { enabled: !!minimap },
        fontSize: 13,
        fontFamily: "var(--font-mono)",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        renderWhitespace: "none",
        folding: true,
        padding: { top: 8, bottom: 8 },
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        stickyScroll: { enabled: false },
        domReadOnly: readOnly,
      }}
    />
  );
}
