// TimeShift — Online-only service worker
// Changing CACHE_NAME with each version forces browsers to pick up the new app immediately.

const CACHE_NAME = 'timeshift-v4.3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete any caches from previous versions
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-only: always fetch live, never serve stale cached content
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
