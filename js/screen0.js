// fichier : screen0.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 0 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { addImg, addImgBackground } from './fonctionImg.js';
import { ajouterBouton } from './button.js';
import { loadSound } from './Sound/sound.js';
import { nextScreen } from './navigation.js';
import { log } from './trace.js';
import { addTxt } from './texte.js';

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
  const btn1 = ajouterBouton(
    "container",
    "JOUER MAINTENANT",
    "btn1",
    "btnclass"
  );

  addTxt("container", "© 2025 - MMI - IUT Corte & Toulon", "footer");

  // binding
  btn1.addEventListener("click", () =>{
    // move to the next page
    nextScreen("1");
  });
  
  // end trace
  log("S0 loaded!", "blue");
}



