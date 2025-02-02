// fichier : screen5.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 5 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { ajouterBouton } from "./button.js";
import { refreshPage } from "./refreshPage.js";
//import { addAutoPlayVideo } from "./video.js";
import { addMediaBackground } from "./fonctionImg.js";
import { nextScreen } from "./navigation.js";
import {log} from "./trace.js"

// Fonction pour charger l'écran 5 du jeu
export function loadScreen5() {

  // refresh the page
  refreshPage();

  // begin trace
  log("Loading S5...", "blue");

  // add content
  addMediaBackground("container", "./assets/video/IntroTourneeV1.mp4")
  ajouterBouton("container", "", "btnInv2", "btnInv");

  const boutonInv2 = document.getElementById("btnInv2");
  boutonInv2.addEventListener("click", () => {
    // move to the next page (first level!)
    nextScreen("5","1");
  });

  // end trace
  log("S5 loaded!", "blue");

}
