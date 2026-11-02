// Einfacher Service Worker: App-Dateien offline verfügbar, aber immer zuerst frisch aus dem Netz.
const CACHE = 'weinkeller-v11'; // zusammen mit js/version.js erhöhen
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    // no-cache: immer beim Server nachfragen, damit neue Versionen sofort ankommen (GitHub Pages cacht 10 min)
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
  );
});
