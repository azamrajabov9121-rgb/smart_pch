const CACHE_NAME = 'smart-pch-v20260316.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    // CSS fayllari
    '/css/style.css',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/dashboard.css',
    '/css/windows.css',
    '/css/responsive.css',
    '/css/ai-assistant.css',
    '/css/timesheet.css',
    '/css/pu74.css',
    '/css/mexanika.css',
    '/css/landing.css',
    // JS fayllari
    '/js/config.js',
    '/js/masofaConfig.js',
    '/js/data.js',
    '/js/auth.js',
    '/js/utils.js',
    '/js/ui-manager.js',
    '/js/search-engine.js',
    '/js/script.js',
    '/js/admin-panel.js',
    '/js/timesheet.js',
    '/js/attendance.js',
    '/js/dispatcher.js',
    '/js/map-logic.js',
    '/js/weather.js',
    '/js/hr.js',
    '/js/safety.js',
    '/js/tnu19.js',
    '/js/tnu20.js',
    '/js/mexanika.js',
    '/js/accounting.js',
    '/js/materials.js',
    '/js/metrology.js',
    '/js/defectoscope.js',
    '/js/pu74.js',
    '/js/pu28.js',
    '/js/pu29.js',
    '/js/pu80.js',
    '/js/track-defect.js',
    '/js/rahbar-visa.js',
    '/js/technical_maintenance.js',
    '/js/technical_training.js',
    '/js/fileApproval.js',
    '/js/marketplace.js',
    '/js/incoming.js',
    '/js/ai-assistant.js',
    '/js/pchMap.js',
    '/js/landing.js',
    '/js/e-imzo-client.js',
    '/js/lib/e-imzo.js',
    '/js/face-service.js',
    '/js/lib/face-api.min.js',
    // Resurslar
    '/img/logo.png',
    '/manifest.json'
];

// Install Event — keshga saqlash
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Kesh ochildi va resurslar saqlanmoqda...');
                // Har bir faylni alohida qo'shish (bitta xato boshqalarni to'xtatmasin)
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url =>
                        cache.add(url).catch(err => {
                            console.warn(`[SW] Keshga qo'shib bo'lmadi: ${url}`, err.message);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Fetch Event — NETWORK FIRST strategiyasi
// Avval serverdan olishga urinadi, muvaffaqiyatsiz bo'lsa keshdan oladi
// Bu sahifaning DOIMO yangi versiyasini ko'rsatishni ta'minlaydi
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 1. API so'rovlari — Faqat tarmoqdan (Network Only)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({
                            error: true,
                            message: 'Internet aloqasi yo\'q. Ma\'lumotlar yuklanmadi.',
                            isOffline: true
                        }),
                        { headers: { 'Content-Type': 'application/json' }, status: 503 }
                    );
                })
        );
        return;
    }

    // 2. Socket.io so'rovlarini o'tkazib yuborish (keshga saqlash kerak emas)
    if (url.pathname.startsWith('/socket.io')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 3. Statik aktivlar — STALE-WHILE-REVALIDATE (Eski kesh ko'rsatiladi, fonda yangilanadi)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => null);

            return cachedResponse || fetchPromise;
        })
    );
});

// Activate Event — eski keshlarni tozalash
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        console.log('[SW] Eski kesh o\'chirilmoqda:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Xabar tinglash
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
