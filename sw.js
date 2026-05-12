// ShiftLog — Online-only service worker
// Handles PWA install/update lifecycle but does NOT serve cached content offline.
// The app itself checks connectivity and blocks use when offline.

const CACHE_NAME = 'shiftlog-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Clear any old caches from previous versions
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-only: always fetch from network, never serve from cache
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
