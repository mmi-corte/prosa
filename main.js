import { refreshPage } from "./js/refreshPage.js";
import { addImg } from "./js/fonctionImg.js";
import { setOnSound, setOffSound } from "./js/Sound/sound.js";
import { nextScreen } from "./js/navigation.js";
import { showStaticMap } from "./js/map.js";
import { addBtnImg } from "./js/button.js";
import { log } from "./js/trace.js";
import { MapPopup } from "./js/popup.js";

//Variable / Constante pour les combats
export let playerUserName = "";

export const DEBUG = true;

// addOverlay ('audioId' , 'audioSrc')

// Resey Home btn
if (DEBUG) {
  const body = document.querySelector("body");
  body.id = "body";
  addImg("body", "assets/icons/home.svg", "homeStyle", "resetGame");

  // Ajout du bouton pour revenir à l'écran d'accueil
  resetGame.addEventListener("click", () => {
    // refresh page
    refreshPage();

    // reset local storage
    localStorage.clear();
    localStorage.setItem("screen", "0");
    localStorage.setItem("level", "0");

    // reload if we are coming from AR!
    window.location.reload(false);

    // load screen0
    nextScreen("0", "0");

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

//////////////////////////////////////////////////////
// Sound Button
/////////////////////////////////////////////////////



// Ajout du bouton pour activer/désactiver le son
addBtnImg("body", (localStorage.getItem("isMuted") === "true") ? "assets/icons/mute.svg": "assets/icons/unmute.svg", "SoundBtn", "SoundIcon");

// Bind the sound button to the sound functions
const SoundBtn = document.getElementById("SoundBtn");
SoundBtn.addEventListener("click", () => {
  if (SoundBtn.src.includes("unmute")) {
    SoundBtn.src = "assets/icons/mute.svg";
    setOffSound();
    localStorage.setItem("isMuted", "true");
  } else {
    SoundBtn.src = "assets/icons/unmute.svg";
    setOnSound();
    localStorage.setItem("isMuted", "false");
  }
});

//////////////////////////////////////////////////////
// Reload Button
/////////////////////////////////////////////////////

// Ajout du bouton pour activer/désactiver le son
addBtnImg("body", "assets/icons/reload.svg", "ReloadBtn", "ReloadIcon");

// Bind the reload button to the reload functions
const ReloadBtn = document.getElementById("ReloadBtn");
ReloadBtn.addEventListener("click", () => {

  // clear page
  refreshPage();

  window.location.reload(false);
  
  // TODO add popup to choose the level. 1 restard the game sart the init phase
  // reload page
  nextScreen("5", "1", false);

});

//////////////////////////////////////////////////////
// Map Button
/////////////////////////////////////////////////////

// Ajout du bouton pour activer/désactiver le son
addBtnImg("body", "assets/icons/map_black.svg", "MapBtn", "MapIcon");

// Bind the reload button to the reload functions
const MapBtn = document.getElementById("MapBtn");
MapBtn.addEventListener("click", () => {

    //load map
    showStaticMap("container");
    
    const map = document.getElementById("staticMap");

    // update map icon & display map
    if (MapBtn.src.includes("map_black")) {
        MapBtn.src = "assets/icons/map_white.svg";
        map.style.display = "block";
    } else {
        MapBtn.src = "assets/icons/map_black.svg";
        map.style.display = "none";
    }

});

// window.addEventListener("DOMContentLoaded", () => {

// document.documentElement.style.opacity = "1";

let screenValue = localStorage.getItem("screen") || "0";
let levelValue = localStorage.getItem("level") || "0";
let isMuted = localStorage.getItem("isMuted") || true;

localStorage.setItem("screen", screenValue);
localStorage.setItem("level", levelValue);
localStorage.setItem("isMuted", isMuted);

// Load the first screen
nextScreen(screenValue, levelValue);

// });

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", function() {
//     navigator.serviceWorker
//       .register("/sw.js")
//       .then(res => console.log("service worker registered"))
//       .catch(err => console.log("service worker not registered", err));
//   });
// }
