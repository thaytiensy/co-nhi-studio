// Cọ Nhí Studio - Service Worker phục vụ Offline & Cài đặt App (PWA)
const CACHE_NAME = 'co-nhi-studio-cache-v2';
const APP_ROOT_URL = new URL('/', self.location.origin).href;
const CACHEABLE_SHELL_ASSETS = ['/manifest.json', '/favicon.svg', '/icons.svg'];

async function cacheAsset(cache, url) {
  const assetUrl = new URL(url, self.location.origin);
  if (assetUrl.origin !== self.location.origin) return;

  try {
    const response = await fetch(assetUrl.href, { cache: 'reload' });
    if (response.ok && response.status === 200) {
      await cache.put(assetUrl.href, response.clone());
    }
  } catch {
    // Bỏ qua tài nguyên chưa sẵn sàng; lần tải sau sẽ được cache khi online.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const rootResponse = await fetch(APP_ROOT_URL, { cache: 'reload' });
      if (rootResponse.ok && rootResponse.status === 200) {
        await cache.put(APP_ROOT_URL, rootResponse.clone());
        await cache.put(new URL('/index.html', self.location.origin).href, rootResponse.clone());

        const html = await rootResponse.text();
        const referencedAssets = Array.from(
          html.matchAll(/(?:src|href)=["']([^"']+)["']/g),
          (match) => match[1],
        ).filter((url) => url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/api/'));

        const assets = new Set([...CACHEABLE_SHELL_ASSETS, ...referencedAssets]);
        await Promise.all(Array.from(assets, (url) => cacheAsset(cache, url)));
      }
    } catch {
      // Giữ service worker cũ nếu mạng tạm thời không sẵn sàng.
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('co-nhi-studio-cache-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse.ok && networkResponse.status === 200 && !event.request.headers.has('range')) {
        try {
          await cache.put(event.request, networkResponse.clone());
        } catch {
          // Không để lỗi quota/cache làm hỏng phản hồi mạng.
        }
      }
      return networkResponse;
    } catch {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;
      if (event.request.mode === 'navigate') {
        return (await cache.match(APP_ROOT_URL)) || Response.error();
      }
      return Response.error();
    }
  })());
});
