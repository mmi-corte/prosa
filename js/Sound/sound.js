const play = document.getElementById('callLoadSound')
const suspend = document.getElementById('callSuspendSound')

const play2 = document.getElementById('callnewLoadSound')
const suspend2 = document.getElementById('callnewSuspendSound')

let audio;
// Musique 1
play.addEventListener('click',()=>{
    loadSound('sound1.mp3', true)
})

suspend.addEventListener('click',()=>{
    suspendSound('sound1.mp3')
})



//Musique 2

play2.addEventListener('click',()=>{
    loadSound('sound2.mp3')
})

suspend2.addEventListener('click',()=>{
    suspendSound('sound2.mp3')
})

// Création d'un objet pour stocker les instances audio
const audioPlayers = {};

// Fonction pour charger et jouer un fichier audio
function loadSound(url, loop = false) {
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
function suspendSound(url) {
    if (audioPlayers[url]) {
        // On met en pause si l'instance existe
        audioPlayers[url].pause();
    }
}