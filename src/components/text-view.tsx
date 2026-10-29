"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorPanel } from "@/components/error-panel";
import { MonacoView } from "@/components/monaco";
import { engine } from "@/lib/worker-client";
import { useApp } from "@/store/app-store";

const BIG = 1_500_000;

export function TextView() {
  const status = useApp((s) => s.status);
  const version = useApp((s) => s.version);
  const indent = useApp((s) => s.indent);
  const sortKeys = useApp((s) => s.sortKeys);
  const [text, setText] = useState("");
  const seq = useRef(0);

  useEffect(() => {
    if (status !== "valid") return;
    const id = ++seq.current;
    engine
      .format(indent, sortKeys)
      .then((t) => {
        if (id === seq.current) setText(t);
      })
      .catch(() => {});
  }, [status, version, indent, sortKeys]);

  if (status === "invalid") return <ErrorPanel />;
  if (status === "empty") {
    return <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted">Formatted output appears here.</div>;
  }
  return (
    <div className="min-h-0 flex-1">
      <MonacoView value={text} language={text.length > BIG ? "plaintext" : "json"} readOnly minimap={text.length < BIG} />
    </div>
  );
}
