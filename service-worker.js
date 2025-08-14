/* Project Kieran service worker: offline-first caching (GitHub Pages subpath) */
const CACHE_NAME = 'pk-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // icons (cache both possible locations just in case)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle same-origin GET
  if (req.method === 'GET' && new URL(req.url).origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'));
      })
    );
  }
});
// OneSignal uses its own workers at the root (OneSignalSDKWorker.js, OneSignalSDKUpdaterWorker.js).
