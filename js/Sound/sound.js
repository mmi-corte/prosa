
// Création d'un objet pour stocker les instances audio
const audioPlayers = {};

export async function loadSound(url, loop = false) {
    if (!audioPlayers[url]) {
      // Si l'instance audio pour cette URL n'existe pas encore, on la crée
      audioPlayers[url] = new Audio(url);
      audioPlayers[url].loop = loop; // Active ou désactive la boucle
      audioPlayers[url].preload = 'auto';
      
      // Retourne une promesse qui se résout quand l'audio est prêt à être joué
      await new Promise((resolve, reject) => {
        audioPlayers[url].addEventListener("canplaythrough", resolve, { once: true });
        audioPlayers[url].addEventListener("error", reject, { once: true });
      });
    } else {
      // Si l'instance existe déjà, on met à jour l'option de boucle
      audioPlayers[url].loop = loop;
    }
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

export function deleteSound(url="") {
    // Fonction pour supprimer un fichier audio
    // Si url est vide, supprime tous les sons
    // Sinon, supprime uniquement le son correspondant à l'URL fournie

    // if url, delete only url, else delete all
    if(url) {
        if (audioPlayers[url]) {
            delete audioPlayers[url];
        }
    }else{
        Object.keys(audioPlayers).forEach(key => {
            stopSound(key);
        });
    }
}

export function setOffSound(){
    Object.values(audioPlayers).forEach(element => {
        element.pause();
    });

    document.querySelectorAll("video").forEach(video => {
        video.muted = true;
      });
}

export function setOnSound(){
    Object.values(audioPlayers).forEach(element => {
        element.play();
    });

    document.querySelectorAll("video").forEach(video => {
        video.muted = false;
      });
}

// Fonction pour vérifier si un son est en cours de lecture
export function isPlaying(url) {
    if (audioPlayers[url]) {
        return !audioPlayers[url].paused && audioPlayers[url].currentTime > 0;
    }
    return false;
}