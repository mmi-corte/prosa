// fichier : screen0.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 0 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { addImg, addImgBackground } from './functionImg.js';
import { ajouterBouton } from './button.js';
import { loadSound, setOffSound, setOnSound } from './Sound/sound.js';
import { nextScreen } from './navigation.js';
import { log } from './trace.js';
import { addTxt } from './texte.js';
// import { goFullscreen, isMobileDevice } from './functions.js';

// Fonction pour charger l'écran 1 du jeu
export function loadScreen0() {

  // begin trace
  log("Loading S0...", "blue");
  
  // load sound intro but dont play
  loadSound("assets/sound/intro.mp3", true);

  // add logo
  addImg('container','assets/logo.png','logoimg', 'logoImgP1');
  addImgBackground('container',"assets/bg/Accueil.png");

  // add button
  const startBtn = ajouterBouton(
    "container",
    "JOUER MAINTENANT",
    "btn1",
    "btnclass"
  );

  addTxt("container", "© 2025 - MMI - IUT Corte & Toulon", "footer");

  // binding
  startBtn.addEventListener("click", () =>{
    // move to the next page
    nextScreen("1");

    // app in full screen
    // if (isMobileDevice()) {
    //   goFullscreen();
    // }

    // if replay and the button sound is unmuted, we need a interaction from the user to activate the sound
    const SoundBtn = document.getElementById("SoundBtn");
    if(SoundBtn) {    
      if (SoundBtn.src.includes("unmute")) {
        setOnSound();
      } else {
        setOffSound();
      }
    }
    
  });
  
  // end trace
  log("S0 loaded!", "blue");

}



