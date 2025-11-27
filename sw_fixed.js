/* eslint-env serviceworker */
const CACHE_NAME = 'sarassure-pwa-cache-v4';
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

  // Ignorer les requêtes vers les extensions Chrome et autres protocoles non-HTTP
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      request.url.startsWith('safari-extension://') ||
      !request.url.startsWith('http')) {
    return;
  }

  // Always fetch non-GET requests from the network
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Pour les appels API (supabase), essayer le réseau en premier, puis le cache en secours
  if (request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cloner la réponse avant la mise en cache
          const responseToCache = response.clone();
          
          // Mettre en cache seulement les réponses réussies (200-299)
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Le réseau a échoué, essayer le cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Serving from cache (offline):', request.url);
              return cachedResponse;
            }
            
            // Pas de cache disponible, retourner une erreur hors ligne
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
  
  // Pour les autres requêtes GET, utiliser une stratégie cache-first
  event.respondWith(
    caches.match(request).then((response) => {
      // Cache hit - retourner la réponse
      if (response) {
        return response;
      }

      // Cache miss - aller chercher sur le réseau
      return fetch(request).then((fetchResponse) => {
        // Vérifier que la réponse est valide avant la mise en cache
        if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
          // Cloner la réponse car elle ne peut être lue qu'une seule fois
          const responseToCache = fetchResponse.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return fetchResponse;
      });
    }).catch(() => {
        // Fallback pour les requêtes de navigation quand hors ligne
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        // Pour les autres ressources, retourner une erreur
        return new Response('Offline', { status: 503 });
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