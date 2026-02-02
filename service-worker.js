const CACHE_NAME = 'cache-prosa-game-v1';

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
  
  // Logo & branding
  './assets/logo/prosa-logo.png',
  './assets/logo/logo_prosa.svg',
  './assets/logo/prosa-o.svg',
  './assets/logo/chargement.png',
  
  // Icons & UI
  './assets/img/icon1.svg',
  './assets/drapeau/bandera.png',
  './assets/drapeau/france.png',
  
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mise en cache des fichiers du jeu.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network first for JS modules (permet les mises à jour)
  if (event.request.url.includes('.js') || event.request.url.includes('cdnjs')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for assets, data, CSS
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});