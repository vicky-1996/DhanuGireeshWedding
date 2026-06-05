const CACHE_NAME = "dg-wedding-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/hero-cover.jpg",
  "./assets/couple-window-720.jpg",
  "./assets/couple-window-1200.jpg",
  "./assets/couple-ceremony-720.jpg",
  "./assets/couple-ceremony-1200.jpg",
  "./assets/venue-banner.jpg",
  "./assets/og-image.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/wedding-romantic.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
