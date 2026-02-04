const CACHE_NAME = 'cache-prosa-game-v2';

const ASSETS_TO_CACHE = [
  // Root files
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  
  // Core JS files
  './js/gameEventHandler.js',
  './js/initGame.js',
  './js/initGameData.js',
  './js/langageManager.js',
  './js/loadData.js',
  './js/typeWriteEffect.js',
  
  // Main views
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
  
  // Init views
  './js/views/main/initViews/characterSelectView.js',
  './js/views/main/initViews/langueCorseView.js',
  './js/views/main/initViews/playerCountView.js',
  './js/views/main/initViews/playerSubmitView.js',
  
  // Action views
  './js/views/actions/choiceView.js',
  './js/views/actions/dialogView.js',
  './js/views/actions/endView.js',
  './js/views/actions/gameView.js',
  './js/views/actions/riddleView.js',
  
  // Components
  './js/views/components/renderPlayerList.js',
  
  // Debug view
  './js/views/Temp/debugView.js',
  
  // All data files
  './data/characters.json',
  './data/choices.json',
  './data/cinematiques.json',
  './data/dialogs.json',
  './data/funfacts.json',
  './data/games.json',
  './data/playersCharacters.json',
  './data/riddles.json',
  './data/steps.json',
  
  // Front assets
  './fronts/start_view_1/styles.css',
  './fronts/start_view_1/public/images/prosa-logo.png',
  './fronts/start_view_1/public/images/chargement.png',
  './fronts/start_view_1/step.js',
  
  // Logo & branding
  './assets/logo/prosa-logo.png',
  './assets/logo/logo_prosa.svg',
  './assets/logo/prosa-o.svg',
  './assets/logo/chargement.png',
  
  // Icons & UI
  './assets/img/icon1.svg',
  './assets/drapeau/bandera.png',
  './assets/drapeau/france.png',
  './assets/favicon/prosa-favicon.svg',
  
  // Lottie animation
  './assets/lottie/prosa-o.json',
  
  // Fonts
  './assets/fonts/FuturaCondMedium.woff2',
  './assets/fonts/FuturaCondMedium.woff',
  
  // Characters (story characters)
  './assets/characters/AStrega.jpg',
  './assets/characters/Fullettu.jpg',
  './assets/characters/Mazzeru.jpg',
  './assets/characters/Orcu.jpg',
  './assets/characters/Signadora.jpg',
  './assets/characters/SquadradArozza.jpg',
  './assets/characters/UMagu.jpg',
  './assets/characters/UStrigone.jpg',
  './assets/characters/spallistu.jpg',
  
  // Player characters
  './assets/playersCharacters/bastianu.jpg',
  './assets/playersCharacters/livia.jpg',
  './assets/playersCharacters/marc.jpeg',
  './assets/playersCharacters/sophie.jpeg',
  './assets/playersCharacters/valerie.jpeg',
  './assets/playersCharacters/wide_bastianu.jpg',
  './assets/playersCharacters/wide_livia.jpg',
  
  // Cinematiques
  './assets/cinematiques/test.png',
  
  // Steps assets
  './assets/steps/1/0100/radio.webp',
  
  // Libraries
  './assets/libs/lottie.min.js',
  
  // CSS files referenced in HTML
  './assets/styles.css',
  
  // Tailwind CDN fallback (pour les mini-jeux)
  './games/src/tailwind.js',
  
  // Server files (si utilisés côté client)
  './server.js',
];

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

  // Network first pour les modules JS (permet les mises à jour)
  if (event.request.url.includes('.js') && !event.request.url.includes('cdn')) {
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
          return caches.match(event.request);
        })
    );
  } 
  // Cache first pour les assets, data, CSS, images
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
          // Fallback pour les images manquantes
          if (event.request.destination === 'image') {
            return caches.match('./assets/img/icon1.svg');
          }
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
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});