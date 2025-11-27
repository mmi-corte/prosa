const CACHE_NAME = 'ar-cache-v1';

// Chemins corrigés selon votre structure HTML
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',   // Corrigé (était ./style.css)
  './js/main.js',      // Corrigé (était ./script.js)
  './manifest.json',
  './assets',
  // './assets/mon-modele.glb', // DÉCOMMENTEZ SI LE FICHIER EXISTE VRAIMENT
  
  // NOTE : J'ai retiré three.js du cache ici car vous l'importez via un CDN dans l'importmap
  // Si vous voulez le cacher, il faut mettre l'URL exacte de l'importmap
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mise en cache des fichiers AR');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
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