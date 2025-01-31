// fichier : screen0.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 0 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { addImg, addImgBackground } from './fonctionImg.js';
import { ajouterBouton } from './button.js';
import { loadScreen1 } from './screen1.js';
import { setCookie } from './cookieHandler.js';
import { loadSound } from './Sound/sound.js';

// Fonction pour charger l'écran 1 du jeu
export function loadScreen0() {

  console.log("loading loadScreen0...");
  
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

  // binding
  btn1.addEventListener("click", () =>{
    loadScreen1();
  });

  // update screen cookie
  setCookie("screen", "0", 7, "/");

  console.log("loadScreen0 loaded!");
}



