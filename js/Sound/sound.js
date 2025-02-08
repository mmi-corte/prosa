import { log } from "../trace.js";

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
    if(url){
        let sound = audioPlayers[url];
        if (sound) {
            // On met en pause si l'instance existe
            audioPlayers[url].pause();
            log(`Pause sound: ${sound.src}`, 'green');
        }
    }
}

// Fonction pour suspendre la lecture d'un fichier audio
export function stopSound(url) {
    
    if(url) {
        let sound = audioPlayers[url];
        if (sound) {
            audioPlayers[url].pause();
            // On met en pause si l'instance existe
            audioPlayers[url].currentTime = 0;
            deleteSound(url);
            log(`Stop & delete sound: ${sound.src}`, 'green');
        }
    }
}

export function deleteSound(url="") {
    // Fonction pour supprimer un fichier audio
    // Si url est vide, supprime tous les sons
    // Sinon, supprime uniquement le son correspondant à l'URL fournie

    // if url, delete only url, else delete all
    if(url) {
        let sound = audioPlayers[url];
        if (sound) {
            delete audioPlayers[url];
            log(`Delete sound: ${sound.src}`, 'green');
        }
    }else{
        Object.keys(audioPlayers).forEach(sound => {
            stopSound(sound);
        });
    }
}

export function setOffSound(){
    Object.values(audioPlayers).forEach(sound => {
        sound.pause();
        if(sound.src) {
            log(`Pause sound: ${sound.src}`, 'green');
        }
    });

    document.querySelectorAll("video").forEach(video => {
        video.muted = true;
        if(video.src) {
            log(`Mute video: ${video.src}`, 'green');
        }
      });
}

export function setOnSound(){
    Object.values(audioPlayers).forEach(sound => {
        sound.play();
        if (sound.src) {
            log(`Play sound: ${sound.src}`, 'green');
        }
    });

    document.querySelectorAll("video").forEach(video => {
        video.muted = false;
        if(video.src) {
            log(`Unmute video: ${video.src}`, 'green');
        }
      });
}

// Fonction pour vérifier si un son est en cours de lecture
export function isPlaying(url) {
    if (audioPlayers[url]) {
        return !audioPlayers[url].paused && audioPlayers[url].currentTime > 0;
    }
    return false;
}