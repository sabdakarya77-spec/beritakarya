const CACHE_NAME = 'beritakarya-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/favicon.png',
  '/placeholder.jpg',
];

// Install Event - Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle offline capabilities and resource caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests, external APIs, and local API requests to avoid auth issues
  if (
    request.method !== 'GET' || 
    !request.url.startsWith(self.location.origin) ||
    request.url.includes('/api/v1/')
  ) {
    return;
  }
  
  // Cache-First Strategy for Static Assets (CSS, JS, Fonts, Images)
  const isStaticAsset = 
    request.url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|css|js)$/) ||
    request.url.includes('/_next/static/');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Only cache successful requests
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fallback for missing images
            if (request.url.match(/\.(png|jpg|jpeg|webp)$/)) {
              return cache.match('/placeholder.jpg');
            }
          });
        });
      })
    );
    return;
  }
  
  // Network-First Strategy for HTML Navigation pages and general routes
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache the newly fetched page
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and accessing an HTML page, render cached home shell
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
