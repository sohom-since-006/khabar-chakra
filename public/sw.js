// Khabar Chakra — Offline Shell Service Worker (v1.0)
const CACHE_NAME = 'khabar-chakra-shell-v1';
const PRECACHE_URLS = [
  '/',
  '/en',
  '/en/home',
  '/en/available',
  '/en/recipes',
  '/en/waste',
  '/en/impact',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback for document navigation when network is down
        if (event.request.mode === 'navigate') {
          return caches.match('/en/home');
        }
      });
    })
  );
});
