const CACHE_NAME = 'cache-prosa-game-v3';
const GAMES_CACHE = 'cache-prosa-games-v1';

const ASSETS_TO_CACHE = [
  // BOOTSTRAP MINIMUM - Fichiers critiques pour démarrer l'app
  './',
  './index.html',
  './app.js',
  
  // Preloader pour gérer le reste
  './js/preloadAssets.js',
  
  // Views JS - indispensables pour l'interface
  './js/views/main/charactersView.js',
  './js/views/main/codeView.js',
  './js/views/main/initView.js',
  './js/views/main/langueCorseView.js',
  './js/views/main/loadingView.js',
  './js/views/main/menuView.js',
  './js/views/main/playerSelectView.js',
  './js/views/main/progressionView.js',
  './js/views/main/qrView.js',
  './js/views/main/settingView.js',
  './js/views/main/seasonsView.js',
  
  './js/views/main/initViews/characterSelectView.js',
  './js/views/main/initViews/langueCorseView.js',
  './js/views/main/initViews/playerCountView.js',
  './js/views/main/initViews/playerSubmitView.js',
  
  './js/views/actions/choiceView.js',
  './js/views/actions/dialogView.js',
  './js/views/actions/endView.js',
  './js/views/actions/gameView.js',
  './js/views/actions/riddleView.js',
  
  './js/views/components/renderPlayerList.js',
  './js/views/Temp/debugView.js',
  
  // Core JS
  './js/gameEventHandler.js',
  './js/initGame.js',
  './js/langageManager.js',
  './js/loadData.js',
  './js/typeWriteEffect.js',
  
  // Asset manifest - CRITIQUE pour le système de préchargement
  './assets-manifest.json',
];

// NOTE: Tous les autres assets (images, styles, données JSON, fonts, etc.)
// sont définis dans assets-manifest.json et gérés par le système de préchargement
// + les stratégies de cache du fetch event (Cache First, Network First, etc.)

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des fichiers du jeu...');
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error('[Service Worker] Erreur lors de la mise en cache:', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Ignore les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  // Ignore les requêtes chrome-extension et autres protocoles
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // **Google Fonts - stale-while-revalidate**
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => response);

        return response || fetchPromise;
      })
    );
    return;
  }

  // **Font Awesome / CDNs - stale-while-revalidate**
  if (url.origin === 'https://cdnjs.cloudflare.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => response);

        return response || fetchPromise;
      })
    );
    return;
  }

  // **Tailwind CDN - cache first avec fallback réseau**
  if (url.origin === 'https://cdn.tailwindcss.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // **Gestion des images avec lazy cache**
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Si en cache, retourner immédiatement
        if (response) {
          return response;
        }
        
        // Sinon, chercher en réseau et mettre en cache
        return fetch(event.request).then((response) => {
          // Vérifier que c'est une réponse valide
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          // Mettre en cache la réponse
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
            console.log(`[Service Worker] Image mise en cache: ${event.request.url}`);
          });
          
          return response;
        }).catch(() => {
          // Fallback si l'image ne peut pas être chargée
          console.warn(`[Service Worker] Impossible de charger l'image: ${event.request.url}`);
          return caches.match('./assets/favicon/favicon.svg');
        });
      })
    );
    return;
  }

  // **Jeux - cache lazy (on demand)**
  if (event.request.url.includes('/games/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(GAMES_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
              console.log(`[Service Worker] Jeu mis en cache: ${event.request.url}`);
            });
          }
          return networkResponse;
        }).catch(() => {
          console.warn(`[Service Worker] Jeu hors ligne non disponible: ${event.request.url}`);
          return undefined;
        });
      })
    );
    return;
  }
  
  // **Gestion des données JSON avec stale-while-revalidate**
  else if (event.request.url.includes('.json') && event.request.url.includes('/data/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Retourner du cache immédiatement
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Mettre à jour le cache en arrière-plan
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              console.log(`[Service Worker] Données mises à jour: ${event.request.url}`);
            });
          }
          return networkResponse;
        }).catch(() => response); // Si erreur réseau, utiliser cache
        
        return response || fetchPromise;
      })
    );
  }
  
  // **Network first pour les modules JS (permet les mises à jour)**
  else if (event.request.url.includes('.js') && !event.request.url.includes('cdn')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              console.log(`[Service Worker] JS mis à jour: ${event.request.url}`);
            });
          }
          return response;
        })
        .catch(() => {
          console.warn(`[Service Worker] Utilisation du cache pour: ${event.request.url}`);
          return caches.match(event.request);
        })
    );
  }
  
  // **Cache first pour les assets statiques, CSS, etc.**
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Ne mettre en cache que les réponses valides
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log(`[Service Worker] Asset mis en cache: ${event.request.url}`);
          });
          
          return response;
        }).catch(() => {
          console.warn(`[Service Worker] Offline - pas de cache pour: ${event.request.url}`);
          return undefined;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== GAMES_CACHE) {
            console.log('[Service Worker] Suppression ancien cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});