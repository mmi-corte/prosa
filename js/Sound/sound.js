
// Création d'un objet pour stocker les instances audio


// Fonction pour charger et jouer un fichier audio
export function loadSound(url, loop = false) {
    const audioPlayers = {};
    if (!audioPlayers[url]) {
        // Si l'instance audio pour cette URL n'existe pas encore, on la crée
        audioPlayers[url] = new Audio(url);
        audioPlayers[url].loop = loop; // Active ou désactive la boucle
    }
    // Si une instance existe déjà, on met à jour l'option de boucle
    audioPlayers[url].loop = loop;

    // On lance la lecture
    audioPlayers[url].play();
}

// Fonction pour suspendre la lecture d'un fichier audio
export function suspendSound(url) {
    const audioPlayers = {};
    if (audioPlayers[url]) {
        // On met en pause si l'instance existe
        audioPlayers[url].pause();
    }
}