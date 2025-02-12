// fichier : screen5.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 5 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { ajouterBouton } from "./button.js";
import { refreshPage } from "./refreshPage.js";
//import { addAutoPlayVideo } from "./video.js";
import { addMediaBackground, removeMediaBackground } from "./functionImg.js";
import { nextScreen } from "./navigation.js";
import {log} from "./trace.js";
import {path_sound, path_videos} from "./paths.js";
import { stopSound } from "./Sound/sound.js";

// Fonction pour charger l'écran 5 du jeu
export function loadScreen5() {

  // refresh the page
  refreshPage();

  // begin trace
  log("Loading S5...", "blue");

  // stop the intro sound
  stopSound(path_sound+"intro.mp3");

  // add content
  // add video cinematique
  const cinematique_path = path_videos + "Cinematique.mp4";
  addMediaBackground("container", cinematique_path, () => {
    setTimeout(() => {
      const boutonInv2 = document.getElementById("btnInv2");
      if (boutonInv2) {
          boutonInv2.click(); // Simule un clic sur le bouton
      } else {
          console.error("Le bouton btnInv2 n'existe pas !");
      }
    }, 3000); // 3 secondes de délai avant le clic
  });

  // add button to go on next level
  ajouterBouton("container", "", "btnInv2", "btnInv");

  const boutonInv2 = document.getElementById("btnInv2");
  boutonInv2.addEventListener("click", () => {

    // remove video cinematique
    removeMediaBackground("container", cinematique_path);

    // move to the next page (first level!)
    nextScreen("5","1");
  });

  // end trace
  log("S5 loaded!", "blue");

}
