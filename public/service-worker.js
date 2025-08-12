const CACHE_NAME = "site-cache-v1";
const ASSETS = ["/", "/index.html", "/favicon.ico", "/manifest.json"];

// Install - cache app shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// Activate - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Fetch - cache first for assets, fallback to index.html for SPA routes
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Don't handle non-GET requests or Firebase API calls
  if (req.method !== "GET" || req.url.includes("firebaseio.com")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).catch(() => {
        if (req.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
