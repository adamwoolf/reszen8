import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";

// Inject Vite build assets (exactly one __WB_MANIFEST reference)
precacheAndRoute(self.__WB_MANIFEST);

// Cache Contentful API responses
registerRoute(
  ({ url }) => url.hostname.includes("cdn.contentful.com"),
  new StaleWhileRevalidate({
    cacheName: "contentful-cache",
  })
);

// Cache /assets/ files (e.g. images, icons) with CacheFirst
registerRoute(
  ({ url }) => url.pathname.startsWith("/assets/"),
  new CacheFirst({
    cacheName: "assets-cache",
  })
);
