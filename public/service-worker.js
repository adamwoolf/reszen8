// service-worker.js
const CACHE_VERSION = "v2";
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const ASSETS_CACHE = `assets-${CACHE_VERSION}`;
const CONTENTFUL_CACHE = `contentful-${CACHE_VERSION}`;
const FIREBASE_CACHE = `firebase-${CACHE_VERSION}`;

const SHELL_ASSETS = ["/", "/index.html", "/favicon.ico", "/manifest.json"];

// Install - cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      for (const url of SHELL_ASSETS) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            await cache.put(url, res.clone());
            console.log(`[SW] Cached shell asset: ${url}`);
          }
        } catch (err) {
          console.warn(`[SW] Failed to cache shell asset ${url}`, err);
        }
      }
    })
  );
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.includes(CACHE_VERSION)).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET
  if (request.method !== "GET") return;

  // ---- Firebase API ----
  if (url.includes("firebaseio.com") && url.endsWith(".json")) {
    event.respondWith(networkFirst(request, FIREBASE_CACHE));
    return;
  }

  // ---- Contentful API ----
  if (url.includes("cdn.contentful.com")) {
    event.respondWith(networkFirst(request, CONTENTFUL_CACHE));
    return;
  }

  // ---- Static assets ----
  if (url.includes("/assets/")) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  // ---- Shell fallback for SPA routes ----
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

// Strategies
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    return cached;
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw err;
  }
}
