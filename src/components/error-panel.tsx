"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fixInput } from "@/lib/actions";
import { editorBridge } from "@/lib/editor-bridge";
import { explainError } from "@/lib/error-hints";
import { useApp } from "@/store/app-store";

export function ErrorPanel() {
  const error = useApp((s) => s.error);
  const pathname = usePathname();
  // Recognise common causes (HTML instead of JSON, trailing comma, ...) so the panel can say what happened.
  const hint = useMemo(() => (error ? explainError(editorBridge.getValue(), error.message) : null), [error]);
  if (!error) return null;
  const onGuide = hint ? pathname.startsWith(`/json-errors/${hint.slug}`) : false;
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto p-6">
      <div className="max-w-md rounded-lg border border-danger/40 bg-danger/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-danger">
          <AlertTriangle className="size-4" /> Invalid JSON
        </div>
        <p className="mt-2 break-words font-mono text-xs text-fg">{error.message}</p>
        {error.line > 0 && (
          <p className="mt-1 text-xs text-muted">
            Line {error.line}, column {error.column}
          </p>
        )}
        {hint && (
          <div className="mt-3 rounded-md border border-line bg-bg/60 p-2.5 text-xs">
            <p className="text-fg">{hint.text}</p>
            {!onGuide && (
              <Link href={`/json-errors/${hint.slug}/`} className="mt-1.5 inline-block text-accent underline">
                Read the full explanation
              </Link>
            )}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          {error.line > 0 && (
            <Button size="sm" onClick={() => editorBridge.reveal(error.line, error.column)}>
              Go to error
            </Button>
          )}
          {/* Hidden when the text is not damaged JSON (for example an HTML page): repairing it cannot help. */}
          {hint?.repairable !== false && (
            <Button size="sm" variant="default" onClick={() => void fixInput()}>
              <Wrench /> Try Fix JSON
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
