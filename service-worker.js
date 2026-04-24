const CACHE_NAME = 'cache-prosa-game-v21';
// Service Worker logging utilise toujours le même système
// (les SWs n'ont pas accès à localStorage directement lors du démarrage)
const logSW = (...args) => {
  console.log('%c[Service Worker]', 'color: #7ed321; font-weight: bold;', ...args);
};

const ASSETS_TO_CACHE = [
  // BOOTSTRAP MINIMUM - Fichiers critiques pour démarrer l'app
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './assets-manifest.json',

  // Preloader pour gérer le reste
  './js/preloadAssets.js',

  // Core JS
  './js/gameEventHandler.js',
  './js/initGame.js',
  './js/langageManager.js',
  './js/loadData.js',
  './js/typeWriteEffect.js',

  // Views JS
  './js/views/Temp/debugView.js',
  './js/views/actions/aleasRiddleView.js',
  './js/views/actions/choiceView.js',
  './js/views/actions/dialogView.js',
  './js/views/actions/endView.js',
  './js/views/actions/gameView.js',
  './js/views/actions/riddleView.js',
  './js/views/actions/tokenView.js',
  './js/views/components/confirmationModal.js',
  './js/views/components/correctAnswerModal.js',
  './js/views/components/difficultyIncreaseModal.js',
  './js/views/components/renderPlayerList.js',
  './js/views/main/aleasView.js',
  './js/views/main/charactersView.js',
  './js/views/main/codeView.js',
  './js/views/main/gameOverView.js',
  './js/views/main/initView.js',
  './js/views/main/initViews/characterSelectView.js',
  './js/views/main/initViews/difficultyView.js',
  './js/views/main/initViews/langueCorseView.js',
  './js/views/main/initViews/playerCountView.js',
  './js/views/main/initViews/playerSubmitView.js',
  './js/views/main/langueCorseView.js',
  './js/views/main/loadingView.js',
  './js/views/main/menuView.js',
  './js/views/main/playerSelectView.js',
  './js/views/main/progressionView.js',
  './js/views/main/qrView.js',
  './js/views/main/seasonsView.js',
  './js/views/main/settingView.js',
];

// NOTE: Tous les autres assets (images, styles, données JSON, fonts, etc.)
// sont définis dans assets-manifest.json et gérés par le système de préchargement
// + les stratégies de cache du fetch event (Cache First, Network First, etc.)

self.addEventListener('install', (event) => {
  logSW('⚙️ Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      logSW(`📦 Caching ${ASSETS_TO_CACHE.length} bootstrap files to ${CACHE_NAME}...`);
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error('[Service Worker] ❌ Cache installation error:', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    logSW('📤 New version ready, activating immediately...');
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  // Ignore les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  // Ignore les requêtes chrome-extension et autres protocoles
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // **Navigation (HTML) - network first avec fallback cache**
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          logSW(`⚠️ Offline HTML, using cache: ${url.pathname}`);
          return caches.match(event.request) || caches.match('./index.html');
        })
    );
    return;
  }

  // Exclure AR (network-only)
  if (url.pathname.includes('/AR/')) {
    return;
  }

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

  // **Gestion des données JSON avec stale-while-revalidate**
  if (event.request.url.includes('.json') && event.request.url.includes('/data/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Retourner du cache immédiatement
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Mettre à jour le cache en arrière-plan
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => response); // Si erreur réseau, utiliser cache
        
        return response || fetchPromise;
      })
    );
  }
  
  // **Cache first pour les médias (image, audio, video, fonts, CSS, JSON)**
  else if (
    ['image', 'audio', 'video', 'font', 'style'].includes(event.request.destination) ||
    /\.(?:webp|png|jpg|jpeg|gif|svg|mp3|wav|ogg|webm|woff2?|ttf|otf|css|json)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        }).catch(() => {
          if (event.request.destination === 'image') {
            logSW(`⚠️ Impossible de charger l'image: ${event.request.url}`);
            return caches.match('./assets/favicon/favicon.svg');
          }
          return caches.match(event.request);
        });
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
            });
          }
          return response;
        })
        .catch(() => {
          logSW(`⚠️ Offline JS, using cache: ${event.request.url}`);
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
          });
          
          return response;
        }).catch(() => {
          logSW(`⚠️ Offline - pas de cache pour: ${event.request.url}`);
          return undefined;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  logSW('🚀 Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            logSW(`🗑️ Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
  logSW(`✅ Service Worker activated with cache: ${CACHE_NAME}`);
});