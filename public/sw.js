// Cọ Nhí Studio - Service Worker phục vụ Offline & Cài đặt App (PWA)
const CACHE_NAME = 'co-nhi-studio-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Chỉ cache các yêu cầu GET hợp lệ
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
