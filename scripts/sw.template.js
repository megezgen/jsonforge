/* Generated into public/sw.js by scripts/gen-sw.mjs. Do not edit the generated file. */
const VERSION = "__VERSION__";
const PRECACHE = `jf-precache-${VERSION}`;
const RUNTIME = `jf-runtime-${VERSION}`;
const PRECACHE_URLS = __PRECACHE__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Individual failures must not abort the install: the app still works online.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE, RUNTIME]);
      for (const name of await caches.keys()) {
        if (name.startsWith("jf-") && !keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

const isImmutable = (path) => path.startsWith("/_next/static/") || path.startsWith("/monaco/") || path.startsWith("/icons/");

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) (await caches.open(RUNTIME)).put(request, res.clone());
  return res;
}

async function networkFirstPage(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(RUNTIME)).put(request, res.clone());
    return res;
  } catch {
    // Offline: the page itself if we have seen it, otherwise the home page (the app works the same).
    return (await caches.match(request, { ignoreSearch: true })) || (await caches.match("/")) || Response.error();
  }
}

// The page reports what it loaded on the first visit (hashed Next.js chunks, CSS, fonts) so that
// the very first visit is enough to work offline, without waiting for a second load.
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "cache-urls" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(RUNTIME);
      const own = event.data.urls.filter((u) => typeof u === "string" && new URL(u, self.location.origin).origin === self.location.origin);
      await Promise.allSettled(own.map((u) => cache.add(u)));
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (isImmutable(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
