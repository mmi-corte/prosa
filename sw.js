const CACHE_NAME = 'prosa-cache-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'css/style.css',
  'main.js',
  'firebaseConfig.js', // Ajoutez ici tous les fichiers nécessaires
];

// Lors de l'installation du SW, mettre en cache les fichiers nécessaires
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Lors de l'activation, gérer les caches obsolètes
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Lors de la récupération d'une requête, servir à partir du cache ou du réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Si le fichier est dans le cache, retourne-le
      }
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone()); // Mise en cache de la réponse
          return response;
        });
      });
    })
  );
});
