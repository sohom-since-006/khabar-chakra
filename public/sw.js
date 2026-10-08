// Khabar Chakra — Service Worker (v2.0)
const CACHE_NAME = 'khabar-chakra-shell-v2';

self.addEventListener('install', () => {
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

  const url = new URL(event.request.url);
  // Do not intercept non-http, API, auth, or static assets
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/auth/')) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      if (event.request.mode === 'navigate') {
        const homeFallback = await caches.match('/en/home') || await caches.match('/en');
        if (homeFallback) return homeFallback;
      }

      // Safe fallback that never resolves to undefined
      return new Response('Network unavailable. Please reconnect to continue.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })
  );
});
