"use client";

import { useEffect } from "react";

/** Registers the service worker that makes the app work offline after the first visit. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        // Tell the worker which files this page used, so the first visit is already fully cached.
        const urls = [location.pathname + location.search, ...performance.getEntriesByType("resource").map((e) => e.name)];
        (reg.active ?? navigator.serviceWorker.controller)?.postMessage({ type: "cache-urls", urls: [...new Set(urls)] });
      } catch {
        /* offline support is optional */
      }
    };
    // Wait until the page is idle so the worker's precaching never competes with the first render.
    if (document.readyState === "complete") void register();
    else window.addEventListener("load", () => void register(), { once: true });
  }, []);
  return null;
}
