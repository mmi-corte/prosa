import { refreshPage } from "./js/refreshPage.js";
import { addImg } from "./js/fonctionImg.js";
import { setOnSound, setOffSound } from "./js/Sound/sound.js";
import { nextScreen } from "./js/navigation.js";

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
SoundIcon.src = "assets/icons/mute.svg";
SoundBtn.width = 50;
SoundBtn.height = 50;
SoundBtn.appendChild(SoundIcon);

SoundBtn.addEventListener("click", () => {
  if (SoundIcon.src.includes("unmute")) {
    SoundIcon.src = "assets/icons/mute.svg";
    setOffSound();
  } else {
    SoundIcon.src = "assets/icons/unmute.svg";
    setOnSound();
  }
});

// Ajout du bouton pour recharger la page
const ReloadBtn = document.createElement('div');
ReloadBtn.id = "ReloadBtn";
document.body.appendChild(ReloadBtn);

const ReloadIcon = document.createElement("img");
ReloadIcon.id = "ReloadIcon";
ReloadIcon.src = "assets/icons/reload.svg";
ReloadBtn.appendChild(ReloadIcon);

ReloadBtn.addEventListener("click", () => {

  // clear page
  refreshPage();

  // TODO add popup to choose the level. 1 restard the game sart the init phase
  // reload page
  nextScreen("5", "1", false);

});

// window.addEventListener("DOMContentLoaded", () => {

// document.documentElement.style.opacity = "1";

let screenValue = localStorage.getItem("screen") || "0";
let levelValue = localStorage.getItem("level") || "0";

localStorage.setItem("screen", screenValue);
localStorage.setItem("level", levelValue);

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