"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";

export function Toaster() {
  const notice = useApp((s) => s.notice);
  const clear = useApp((s) => s.clearNotice);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(clear, notice.kind === "error" ? 4500 : 2000);
    return () => clearTimeout(t);
  }, [notice, clear]);

  if (!notice) return null;
  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-none fixed bottom-12 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-md border px-3 py-2 text-xs shadow-xl",
        notice.kind === "success" && "border-ok/50 bg-panel text-ok",
        notice.kind === "error" && "border-danger/50 bg-panel text-danger",
        notice.kind === "info" && "border-line bg-panel text-fg",
      )}
    >
      {notice.text}
    </div>
  );
}
