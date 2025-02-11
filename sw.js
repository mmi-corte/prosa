const CACHE_NAME = "pwa-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/main.js",
  "/assets/icons/android-launchericon-192x192.png",
  "/assets/icons/android-launchericon-512x512.png",
  "/assets/icons/icon-launchericon-144x144.png",
  "/assets/icons/icon-launchericon-96x96.png",
  "/assets/icons/icon-launchericon-72x72.png",
  "/assets/icons/icon-launchericon-48x48.png"
];

// Installer et mettre en cache les fichiers statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Intercepter les requêtes et servir depuis le cache si disponible
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// Supprimer les anciens caches quand une nouvelle version est activée
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});
