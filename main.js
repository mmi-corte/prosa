import { refreshPage } from "./js/refreshPage.js";
import { addImg } from "./js/fonctionImg.js";
import { setOnSound, setOffSound } from "./js/Sound/sound.js";
import { nextScreen } from "./js/navigation.js";
import {log} from "./js/trace.js";

//Variable / Constante pour les combats
export let playerUserName = "";

export const DEBUG = true;

let weapons = [
  {
    name: "Epée",
    damage: 10,
  },
  {
    name: "Grimoire",
    damage: 15,
  },
  {
    name: "Arc",
    damage: 20,
  },
];

const enemies = [
  {
    name: "Cerf",
    hp: 50,
    damage: 10,
  },
  {
    name: "Sylvain",
    hp: 80,
    damage: 15,
  },
  {
    name: "Basgialiscu",
    hp: 100,
    damage: 20,
  },
  {
    name: "Tarasque",
    hp: 100,
    damage: 20,
  },
];

// addOverlay ('audioId' , 'audioSrc')

// Resey Home btn
if (DEBUG) {
  const body = document.querySelector("body");
  body.id = "body";
  addImg("body", "assets/icons/home.png", "homeStyle", "resetGame");

  // Ajout du bouton pour revenir à l'écran d'accueil
  resetGame.addEventListener("click", () => {
    // refresh page
    refreshPage();

    // reset local storage
    localStorage.clear();
    localStorage.setItem("screen", "0");
    localStorage.setItem("level", "0");

    // load screen0
    nextScreen("0","0");

  });

  ////////////////////////////////////////////////////
  // uncomment to activate home button dynamic display
  ////////////////////////////////////////////////////
  
  // Caché par défaut
  resetGame.style.display = "none"; // Caché par défaut
  
  if (resetGame) {
      resetGame.style.display = "none";
      resetGame.style.width = "40px";
      resetGame.style.opacity = "0";
      resetGame.style.transform = "translateX(-50px)"; // Départ hors écran
      resetGame.style.transition = "opacity 0.3s ease-in-out, transform 0.4s ease-in-out";

      document.addEventListener("mousemove", (event) => {
          const seuil = 50; // Distance en pixels pour déclencher l'affichage
          if (event.clientX < seuil && event.clientY < seuil) {
              resetGame.style.display = "block"; // Afficher immédiatement
              requestAnimationFrame(() => {
                  resetGame.style.opacity = "1"; 
                  resetGame.style.transform = "translateX(0)"; // Revient à sa position normale
              });
          } else {
              resetGame.style.opacity = "0"; 
              resetGame.style.transform = "translateX(-50px)"; // Repart vers la gauche

              // Ajout d'un timeout pour éviter le problème de transition ignorée
              setTimeout(() => {
                  if (resetGame.style.opacity === "0") {
                      resetGame.style.display = "none"; 
                  }
              }, 350); // Légèrement plus long que la transition
          }
      });
  } else {
      console.error("L'élément resetGame n'existe pas !");
  }
}

// Ajout du bouton pour activer/désactiver le son
const SoundBtn = document.createElement("div");
SoundBtn.id = "SoundBtn";
document.body.appendChild(SoundBtn);

const SoundIcon = document.createElement("img");
SoundIcon.id = "SoundIcon";
SoundIcon.src = "assets/icons/sonCoupe.png";
SoundBtn.appendChild(SoundIcon);

SoundBtn.addEventListener("click", () => {
  if (SoundIcon.src.includes("SonActif")) {
    SoundIcon.src = "assets/icons/sonCoupe.png";
    setOffSound();
  } else {
    SoundIcon.src = "assets/icons/SonActif.png";
    setOnSound();
  }
});

// Ajout du bouton pour recharger la page
const ReloadBtn = document.createElement('div');
ReloadBtn.id = "ReloadBtn";
document.body.appendChild(ReloadBtn);

const ReloadIcon = document.createElement("img");
ReloadIcon.id = "ReloadIcon";
ReloadIcon.src = "assets/icons/reload.png";
ReloadBtn.appendChild(ReloadIcon);

ReloadBtn.addEventListener("click", () => {

  // clear page
  refreshPage();

  // reload page
  nextScreen("5", "1", false);

});

window.addEventListener("DOMContentLoaded", () => {

  let screenValue = localStorage.getItem("screen") || "0";
  let levelValue = localStorage.getItem("level") || "0";

  localStorage.setItem("screen", screenValue);
  localStorage.setItem("level", levelValue);

  // Load the first screen
  nextScreen(screenValue, levelValue);

});


// // TODO: decomment to activate the service worker
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("sw.js")
//     .then(() => log("Service Worker enregistré", "orange"))
//     .catch((error) => log(`Erreur Service Worker : ${error}`, "orange"));
// }