"use client";

import { AlertCircle, CheckCircle2, Loader2, Minus } from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/utils";
import { useApp } from "@/store/app-store";

export function StatusBar() {
  const status = useApp((s) => s.status);
  const stats = useApp((s) => s.stats);
  const error = useApp((s) => s.error);
  const large = useApp((s) => s.large);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-panel px-3 py-1 text-[11px] text-muted" role="status" aria-live="polite">
      {status === "valid" && (
        <span className="flex items-center gap-1 text-ok">
          <CheckCircle2 className="size-3" /> Valid JSON
        </span>
      )}
      {status === "invalid" && (
        <span className="flex items-center gap-1 text-danger">
          <AlertCircle className="size-3" /> {error?.message ?? "Invalid JSON"}
          {error && error.line > 0 && ` · Ln ${error.line}, Col ${error.column}`}
        </span>
      )}
      {status === "parsing" && (
        <span className="flex items-center gap-1">
          <Loader2 className="size-3 animate-spin" /> Parsing…
        </span>
      )}
      {status === "empty" && (
        <span className="flex items-center gap-1">
          <Minus className="size-3" /> Empty
        </span>
      )}
      {stats && (
        <>
          <span>Size: {formatBytes(stats.bytes)}</span>
          <span>Depth: {stats.depth}</span>
          <span>Nodes: {formatNumber(stats.nodes)}</span>
          <span>Keys: {formatNumber(stats.keys)}</span>
          <span>Root: {stats.rootType}</span>
        </>
      )}
      {large && <span className="text-warn">Large file mode: editor features reduced</span>}
      <span className="ml-auto">🔒 Processed locally in your browser</span>
    </div>
  );
}
