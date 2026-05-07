const CACHE_NAME = 'plate-tectonics-deep-time-v1';
const BASE = '/plate-tectonics-deep-time-visualizer/';
const PRECACHE = [
  BASE,
  `${BASE}index.html`,
  `${BASE}data/v1/tectonics.json`,
  `${BASE}data/v1/tectonics.meta.json`,
  `${BASE}wasm/reconstruction.wasm`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icons/icon.svg`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match(BASE))),
  );
});
