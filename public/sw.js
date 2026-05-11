// Seoul Forest Tour — service worker.
// Bump CACHE_VERSION whenever the app shell changes; old caches are pruned on activate.

const CACHE_VERSION = "v1";
const APP_SHELL = `app-shell-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

// Pages worth precaching so the app boots offline.
const PRECACHE_URLS = [
  "/",
  "/map",
  "/pokemon",
  "/ask",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL);
      // Allow partial failure — missing pages shouldn't block install.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => {
            /* tolerate */
          }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Same-origin only.
  if (url.origin !== self.location.origin) return;

  // Never cache the AI endpoint or any /api/*.
  if (url.pathname.startsWith("/api/")) return;

  // Immutable build output — cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // HTML / navigation — network-first, fall back to cache.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Everything else (images, icons, manifest, etc.) — stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return cached || Response.error();
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(APP_SHELL);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    const home = await caches.match("/");
    if (home) return home;
    return new Response("오프라인 상태입니다.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(req) {
  const cached = await caches.match(req);
  const refresh = fetch(req)
    .then((res) => {
      if (res.ok) {
        caches.open(RUNTIME).then((c) => c.put(req, res.clone()));
      }
      return res;
    })
    .catch(() => cached);
  return cached || refresh;
}
