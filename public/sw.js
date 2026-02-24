const CACHE_NAME = 'smart-pch-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/ai-assistant.css',
    '/css/timesheet.css',
    '/css/pu74.css',
    '/css/mexanika.css',
    '/css/landing.css',
    '/js/config.js',
    '/js/masofaConfig.js',
    '/js/data.js',
    '/js/auth.js',
    '/js/utils.js',
    '/js/script.js',
    '/js/timesheet.js',
    '/js/attendance.js',
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
    '/js/pu80.js',
    '/js/technical_maintenance.js',
    '/js/technical_training.js',
    '/js/fileApproval.js',
    '/js/marketplace.js',
    '/js/incoming.js',
    '/js/ai-assistant.js',
    '/js/pchMap.js',
    '/js/landing.js',
    '/img/logo.png',
    '/manifest.json'
];

// Install Event — keshga saqlash
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Kesh ochildi va resurslar saqlanmoqda...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // Yangi SW ni darhol faollashtirish
    );
});

// Fetch Event — Network First strategiya (API uchun), Cache First (static uchun)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API so'rovlari — har doim network dan olish
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ message: 'Internet aloqasi yo\'q. Offline rejim.' }),
                        { headers: { 'Content-Type': 'application/json' }, status: 503 }
                    );
                })
        );
        return;
    }

    // Statik fayllar — Cache First, keyin Network
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Keshda mavjud — qaytarish, va orqa fonda yangilash
                    fetch(event.request).then(freshResponse => {
                        if (freshResponse && freshResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, freshResponse);
                            });
                        }
                    }).catch(() => { });
                    return response;
                }
                // Keshda yo'q — networkdan olish
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    // Javobni keshga ham saqlash
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                });
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
        }).then(() => self.clients.claim()) // Barcha ochiq sahifalarni boshqarish
    );
});

// Offline bildirishnoma
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
