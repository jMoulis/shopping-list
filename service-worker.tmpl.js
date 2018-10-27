self.addEventListener('install', event => {
  console.log('[Service Worker] Installing');
  event.waitUntil(
    caches.open('static').then(cache => {
      console.log('[Service worker] PreCaching App shell');
      cache.addAll(['/static/css/', '/static/js/', '/index.html']);
    }),
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker]: Activating');
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    }),
  );
});
