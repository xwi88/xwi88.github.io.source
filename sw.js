// Service worker — offline reading + faster repeat loads for xwi88 blog.
// Strategy: network-first for navigations (fresh content online, cache offline),
// stale-while-revalidate for assets (same-origin + CDN). Bump CACHE to release.
const CACHE = 'xwi88-blog-v1';
const OFFLINE_FALLBACK = '/404.html';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_FALLBACK)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    // Navigations (HTML pages): network-first, fall back to cache, then offline page.
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE_FALLBACK)))
        );
        return;
    }

    // Assets (same-origin + CDN): stale-while-revalidate.
    event.respondWith(
        caches.open(CACHE).then((cache) =>
            cache.match(req).then((cached) => {
                const network = fetch(req)
                    .then((res) => {
                        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
                        return res;
                    })
                    .catch(() => cached);
                return cached || network;
            })
        )
    );
});
