// ★ 每次更新 App 時，把這裡的版本號改一下（例如 v4、v5）
const CACHE_NAME = 'baby-feed-v3';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 安裝：快取所有檔案
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟動：刪除所有舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 網路請求：優先從網路拿最新版，失敗才用快取
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return networkRes;
      })
      .catch(() => caches.match(e.request))
  );
});
