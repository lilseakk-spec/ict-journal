/* ICT Trade Journal — service worker
   Strategy:
   - Same-origin app files (HTML/CSS/JS): NETWORK-FIRST.
     Online → always the latest version (auto-update, no reinstall).
     Offline → falls back to the last cached version.
   - Cross-origin (CDN libs, fonts): CACHE-FIRST (version-pinned URLs).
   NOTE: User data lives in localStorage and is NEVER touched by this
   cache. Updating the app never deletes trades, journals or settings. */
const CACHE = 'ict-journal-v4';
const CORE = [
  './', './index.html', './style.css', './app.js',
  './manifest.json', './icon.svg', './icon-192.png', './icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // Network-first — fresh when online, cached fallback when offline.
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() =>
        caches.match(e.request).then(c => c || caches.match('./index.html'))
      )
    );
  } else {
    // Cross-origin — cache-first (CDN URLs are version-pinned).
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(resp => {
          if (resp && (resp.ok || resp.type === 'opaque')) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
          return resp;
        }).catch(() => cached)
      )
    );
  }
});
