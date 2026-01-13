
/* eslint-env serviceworker */
const CACHE_NAME = 'sarassure-pwa-cache-v18';
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

// Clean up old caches on activation
this.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return this.clients.claim();
});

// Cache and return requests
this.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-http/https requests, like chrome-extension://
  if (!request.url.startsWith('http')) {
    return;
  }

  // Always fetch non-GET requests from the network
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // For API calls (supabase), try network first, then cache fallback
  if (request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Only cache successful responses (200-299)
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Serving from cache (offline):', request.url);
              return cachedResponse;
            }
            
            // No cache available, return offline error
            return new Response(
              JSON.stringify({ 
                error: "Offline: Impossible de charger les données. Veuillez vous connecter à Internet.",
                offline: true 
              }), 
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }
  
  // For other GET requests, use a network-first strategy for HTML/JS/CSS
  // to ensure fresh content, cache-first for images and fonts
  const url = new URL(request.url);
  const isNavigationOrAsset = 
    request.mode === 'navigate' || 
    request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/assets/');

  if (isNavigationOrAsset) {
    // Network-first for critical resources
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache the fresh response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache).catch(err => {
                console.warn('Cache put failed:', err);
              });
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Serving from cache (offline):', request.url);
              return cachedResponse;
            }
            // Fallback to index.html for navigation
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Cache-first for images, fonts, and other static assets
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
          
          // Filtrer les requêtes chrome-extension et autres schemes non-supportés
          if (request.url.startsWith('chrome-extension://') || 
              request.url.startsWith('moz-extension://') || 
              request.url.startsWith('safari-extension://')) {
            return networkResponse;
          }

          caches.open(CACHE_NAME)
            .then(cache => {
              try {
                cache.put(request, responseToCache);
              } catch (error) {
                console.warn('Cache put failed:', error.message);
              }
            })
            .catch(error => {
              console.warn('Cache open failed:', error.message);
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
