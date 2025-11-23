
/* eslint-env serviceworker */
const CACHE_NAME = 'sarassure-pwa-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo_192.png',
  '/logo_512.png',
  '/logo_maskable_192.png',
  '/logo_maskable_512.png',
  '/favicon.ico',
];

// Install a service worker
this.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        // Add all URLs to cache using reload to bypass browser cache
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(new Request(urlToCache, {cache: 'reload'}));
        });
        return Promise.all(cachePromises);
      })
      .catch(err => {
        console.error('Failed to open cache or add URLs during install:', err);
      })
  );
  this.skipWaiting();
});

// Cache and return requests
this.addEventListener('fetch', (event) => {
  const { request } = event;

  // Always fetch non-GET requests from the network
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // For API calls (supabase), try network first, then fail
  if (request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline: Could not reach Supabase API." }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }
  
  // For other GET requests, use a cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Not in cache - fetch and cache
      return fetch(request).then(
        (networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });

          return networkResponse;
        }
      );
    }).catch(() => {
        // Fallback for navigation requests when offline
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
    })
  );
});


// Update a service worker
this.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => this.clients.claim())
  );
});
