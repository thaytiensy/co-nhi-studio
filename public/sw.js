// Cọ Nhí Studio - Service Worker phục vụ Offline & Cài đặt App (PWA)
// Chuẩn THƯƠNG MẠI - Chiến lược Cache-First cho tài nguyên tĩnh & Ngoại tuyến 100%
const CACHE_NAME = 'co-nhi-studio-cache-v4';
const APP_ROOT_URL = new URL('/', self.location.origin).href;
const CACHEABLE_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

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
  // Tuyệt đối không cache endpoint nội bộ /api/ hoặc dịch vụ bên ngoài
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) return;

  // Xác định tài nguyên tĩnh (assets, scripts, styles, fonts, images)
  const isStaticAsset = (
    requestUrl.pathname.startsWith('/assets/') ||
    /\.(?:js|css|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|json)$/i.test(requestUrl.pathname)
  );

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Chiến lược Cache-First cho Static Assets để đạt tốc độ tức thì và hoạt động Offline 100%
    if (isStaticAsset) {
      const cached = await cache.match(event.request);
      if (cached) {
        // Cập nhật ngầm trong nền nếu có mạng (Stale-While-Revalidate)
        fetch(event.request).then((freshResponse) => {
          if (freshResponse.ok && freshResponse.status === 200 && !event.request.headers.has('range')) {
            cache.put(event.request, freshResponse.clone()).catch(() => {});
          }
        }).catch(() => {});
        return cached;
      }
    }

    // Đối với các yêu cầu khác (hoặc chưa có trong cache), gọi mạng với fallback cache
    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse.ok && networkResponse.status === 200 && !event.request.headers.has('range')) {
        try {
          await cache.put(event.request, networkResponse.clone());
        } catch {
          // Bỏ qua lỗi quota/cache nếu có
        }
      }
      return networkResponse;
    } catch {
      const fallbackCached = await cache.match(event.request);
      if (fallbackCached) return fallbackCached;

      if (event.request.mode === 'navigate') {
        const rootCached = await cache.match('/index.html') || await cache.match(APP_ROOT_URL);
        if (rootCached) return rootCached;
      }
      return Response.error();
    }
  })());
});
