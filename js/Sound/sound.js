
// Création d'un objet pour stocker les instances audio
const audioPlayers = {};

// Fonction pour charger et jouer un fichier audio
export function loadSound(url, loop = false) {

    if (!audioPlayers[url]) {
        // Si l'instance audio pour cette URL n'existe pas encore, on la crée
        audioPlayers[url] = new Audio(url);
        audioPlayers[url].loop = loop; // Active ou désactive la boucle
        
    }
    // Si une instance existe déjà, on met à jour l'option de boucle
    audioPlayers[url].loop = loop;
    audioPlayers[url].preload = 'auto'; 
       
}

// Fonction pour suspendre la lecture d'un fichier audio
export function suspendSound(url) {
    if (audioPlayers[url]) {
        // On met en pause si l'instance existe
        audioPlayers[url].pause();
    }
}

// Fonction pour suspendre la lecture d'un fichier audio
export function stopSound(url) {

    if (audioPlayers[url]) {
        audioPlayers[url].pause();
        // On met en pause si l'instance existe
        audioPlayers[url].currentTime = 0;
        deleteSound(url);
        
    }
}

export function deleteSound(url) {
    if (audioPlayers[url]) {
        delete audioPlayers[url];
    }
}

export function setOffSound(){
    Object.values(audioPlayers).forEach(element => {
        element.pause();
    });
}

export function setOnSound(){
    Object.values(audioPlayers).forEach(element => {
        element.play();
    });
}

// Fonction pour vérifier si un son est en cours de lecture
export function isPlaying(url) {
    if (audioPlayers[url]) {
        return !audioPlayers[url].paused && audioPlayers[url].currentTime > 0;
    }
    return false;
}