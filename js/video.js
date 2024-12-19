export function addAutoPlayVideo(containerId, urlVideo, className) {
    // Récupère le conteneur à partir de l'ID
    const container = document.getElementById(containerId);

    // Vérifie si le conteneur existe
    if (!container) {
        console.error(`Le conteneur avec l'ID "${containerId}" est introuvable.`);
        return;
    }

    // Crée une balise <video> dynamiquement
    const video = document.createElement('video');

    // Définit les attributs de la vidéo
    video.setAttribute('id', 'dynamicVideo');
    video.className = className;
    video.setAttribute('controls', ''); // Ajoute les contrôles pour l'utilisateur
    video.setAttribute('autoplay', ''); // Optionnel, démarre automatiquement
    video.setAttribute('muted', ''); // Nécessaire pour autoplay sur certains navigateurs
    video.setAttribute('playsinline', ''); // Utile pour les appareils mobiles

    // Ajoute une source à la vidéo
    const source = document.createElement('source');
    source.setAttribute('src', urlVideo); // Chemin de la vidéo
    source.setAttribute('type', 'video/mp4');

    // Ajoute la source à la balise vidéo
    video.appendChild(source);

    // Ajoute la balise vidéo au conteneur
    container.appendChild(video);

    // Joue la vidéo automatiquement
    video.play()
        .then(() => {
            console.log('La vidéo a démarré automatiquement.');
        })
        .catch((error) => {
            console.error('Impossible de démarrer la vidéo automatiquement :', error);
        });
}
