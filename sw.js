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
self.addEventListener("fetch", (event) => {
  // Vérifie si la requête est de type GET avant de la mettre en cache
  if (event.request.method !== "GET") {
    return; // On ignore les requêtes POST, PUT, DELETE, etc.
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Renvoie la réponse mise en cache si elle existe
      }
      return fetch(event.request).then((response) => {
        // Vérifie si la réponse est valide avant de la stocker dans le cache
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Stocke la réponse dans le cache
        let responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    })
  );
});

