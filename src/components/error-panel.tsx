"use client";

import { AlertTriangle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fixInput } from "@/lib/actions";
import { editorBridge } from "@/lib/editor-bridge";
import { useApp } from "@/store/app-store";

export function ErrorPanel() {
  const error = useApp((s) => s.error);
  if (!error) return null;
  return (
    <div className="flex flex-1 items-center justify-center p-6">
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
        <div className="mt-3 flex gap-2">
          {error.line > 0 && (
            <Button size="sm" onClick={() => editorBridge.reveal(error.line, error.column)}>
              Go to error
            </Button>
          )}
          <Button size="sm" variant="default" onClick={() => void fixInput()}>
            <Wrench /> Try Fix JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
