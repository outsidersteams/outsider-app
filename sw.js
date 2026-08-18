// ========================================
// OUTSIDER — SERVICE WORKER
// ========================================

const CACHE_NAME = "outsider-static-v1";

const STATIC_ASSETS = [
    "/",
    "/manifest.webmanifest"
];


// ========================================
// INSTALL
// ========================================

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );

});


// ========================================
// ACTIVATE
// ========================================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches
            .keys()
            .then((cacheNames) => {

                return Promise.all(

                    cacheNames
                        .filter((cacheName) => {
                            return (
                                cacheName.startsWith("outsider-") &&
                                cacheName !== CACHE_NAME
                            );
                        })
                        .map((cacheName) => {
                            return caches.delete(cacheName);
                        })

                );

            })
            .then(() => self.clients.claim())

    );

});