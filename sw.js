// 離線快取:有網路時一律抓最新版(不會卡在舊版),沒網路時才用上次存下的版本
const CACHE = 'cnc-helper-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheable = url.origin === self.location.origin
    || url.hostname === 'www.gstatic.com'          // Firebase 程式庫
    || url.hostname === 'fonts.googleapis.com'
    || url.hostname === 'fonts.gstatic.com';
  if (!cacheable) return;                          // 資料庫連線不經過快取
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req))
  );
});
