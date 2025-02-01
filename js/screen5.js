// fichier : screen5.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 5 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { ajouterBouton } from "./button.js";
import { setCookie } from "./cookieHandler.js";
import { refreshPage } from "./refreshPage.js";
//import { addAutoPlayVideo } from "./video.js";
import { loadLvl1 } from "./lvl1.js";
import { addMediaBackground } from "./fonctionImg.js";

// Fonction pour charger l'écran 5 du jeu
export function loadScreen5() {

  console.log("loading loadScreen5...");

  // refresh the page
  refreshPage();

  // add content
  addMediaBackground("container", "./assets/video/IntroTourneeV1.mp4")
  // addAutoPlayVideo(
  //   "container",
  //   "./assets/video/IntroTourneeV1.mp4",
  //   "introVideo"
  // );

  ajouterBouton("container", "", "btnInv2", "btnInv");

  const boutonInv2 = document.getElementById("btnInv2");
  boutonInv2.addEventListener("click", () => {
    loadLvl1();
  });

  // update screen cookie
  setCookie("screen", "5", 7, "/");

  console.log("loadScreen5 loaded!");

}
