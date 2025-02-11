const CACHE_NAME = "pwa-cache-v1";
const ASSETS_TO_CACHE = [
  "/prosa",
  "/prosa/index.html",
  "/prosa/css/style.css",
  "/prosa/main.js",
  "/prosa/assets/icons/android-launchericon-192x192.png",
  "/prosa/assets/icons/android-launchericon-512x512.png",
  "/prosa/assets/icons/android-launchericon-144x144.png",
  "/prosa/assets/icons/android-launchericon-96x96.png",
  "/prosa/assets/icons/android-launchericon-72x72.png",
  "/prosa/assets/icons/android-launchericon-48x48.png",
  "/prosa/assets/icons/batterie.svg",
  "/prosa/assets/icons/home.svg",
  "/prosa/assets/icons/croix.png",
  "/prosa/assets/icons/info.svg",
  "/prosa/assets/icons/inventaire.png",
  "/prosa/assets/icons/journal.png",
  "/prosa/assets/icons/livre.png",
  "/prosa/assets/icons/map.svg",
  "/prosa/assets/icons/mute.svg",
  "/prosa/assets/icons/unmute.svg",
  "/prosa/assets/icons/warning.svg",
  "/prosa/assets/icons/reload.svg",
  "/prosa/assets/icons/map_white.svg",
  "/prosa/assets/icons/map_black.svg",
  "/prosa/assets/icons/click.svg"
];

// Installer et mettre en cache les fichiers statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          fetch(url).then((response) => {
            if (!response.ok) {
              console.warn(`⚠️ Impossible de cacher ${url}`);
              return;
            }
            return cache.put(url, response);
          })
        )
      );
    })
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
