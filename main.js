import { refreshPage } from "./js/refreshPage.js";
import { addImg } from "./js/fonctionImg.js";
import {
  setCookie,
  getCookieValue,
  isCookiePresent,
} from "./js/cookieHandler.js";
import { setOnSound, setOffSound } from "./js/Sound/sound.js";

import { loadScreen0 } from "./js/screen0.js";
import { loadScreen1 } from "./js/screen1.js";
import { loadScreen2 } from "./js/screen2.js";
import { loadScreen5 } from "./js/screen5.js";
import { loadScreen4 } from "./js/screen4.js";
import { loadScreen3 } from "./js/screen3.js";
import { loadLvl1 } from "./js/lvl1.js";
import { loadLvl1bis } from "./js/lvl1bis.js";
import { loadLvl2 } from "./js/lvl2.js";
import { loadLvl3 } from "./js/lvl3.js";
import { loadLvl4 } from "./js/lvl4.js";
import { loadLvl5 } from "./js/lvl5.js";
import { loadLvl6 } from "./js/lvl6.js";
import { loadLvl6bis } from "./js/lvl6bis.js";
import { loadLvl7 } from "./js/lvl7.js";
import { loadLvl8 } from "./js/lvl8.js";
import { loadLvl9 } from "./js/lvl9.js";
import { loadLvl10 } from "./js/lvl10.js";
import { loadLvl11 } from "./js/lvl11.js";
import { loadLvl12 } from "./js/lvl12.js";
import { loadLvl14 } from "./js/lvl14.js";
import { loadLvl15 } from "./js/lvl15.js";
import { loadLvl16 } from "./js/lvl16.js";
import { loadLvlfin } from "./js/lvlfin.js";
//import 

//Variable / Constante pour les combats
export let playerUserName = "";

const DEBUG = true;

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

let levelValue = 0;
let screenValue = 0;

// addOverlay ('audioId' , 'audioSrc')

// Resey Home btn
if (DEBUG) {
  const body = document.querySelector("body");
  body.id = "body";
  addImg("body", "assets/icons/home.png", "homeStyle", "resetGame");

  resetGame.addEventListener("click", () => {
    refreshPage();
    loadScreen0();
    setCookie("level", "0", 7, "/");
  });

  ////////////////////////////////////////////////////
  // uncomment to activate home button dynamic display
  ////////////////////////////////////////////////////

    
    // Caché par défaut
   resetGame.style.display = "none"; // Caché par défaut
  

    if (resetGame) {
        resetGame.style.display = "none";
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
SoundIcon.src = "assets/icons/sonCoupe.png";
SoundIcon.style.width = "50px";
SoundBtn.appendChild(SoundIcon);

SoundBtn.addEventListener("click", function () {
  if (SoundIcon.src.includes("SonActif")) {
    SoundIcon.src = "assets/icons/sonCoupe.png";
    setOffSound();
  } else {
    SoundIcon.src = "assets/icons/SonActif.png";
    setOnSound();
  }
});

//---------------------------------------------
// logic du jeu
//---------------------------------------------

if (isCookiePresent("screen")) {
  // Récupérer la valeur de "level"
  screenValue = getCookieValue("screen");
  levelValue = getCookieValue("level");

  console.log(
    `Le cookie 'screen' est présent avec la valeur level à : ${screenValue}`
  );

  if (screenValue <= 5 && levelValue == 0) {
    switch (screenValue) {
      case "1":
        loadScreen1();
        break;
      case "2":
        loadScreen2();
        break;
      case "3":
        loadScreen3();
        break;
      case "4":
        loadScreen4();
        break;
      case "5":
        loadScreen5();
        break;
      default:
        loadScreen0();
    }
  } else {
    
    if (isCookiePresent("level")) {
      switch (levelValue) {
        case "1":
          loadLvl1();
          break;
        case "1bis":
          loadLvl1bis();
          break;
        case "2":
          loadLvl2();
          break;
        case "3":
          loadLvl3();
          break;
        case "4":
          loadLvl4();
          break;
        case "5":
          loadLvl5();
          break;
        case "6":
          loadLvl6();
          break;
        case "6bis":
          loadLvl6bis();
          break;
        case "7":
          loadLvl7();
          break;
        case "8":
          loadLvl8();
          break;
        case "9":
          loadLvl9();
          break;
        case "10":
          loadLvl10();
          break;
        case "11":
          loadLvl11();
          break;
        case "12":
          loadLvl12();
          break;
        case "13":
          loadLvl13();
          break;
        case "14":
          loadLvl14();
          break;
        case "15":
          loadLvl15();
          break;
        case "16":
          loadLvl16();
          break;
        case "fin":
          loadLvlfin();
          break;
        case "finAlt":
          loadLvlfinAlt();
          break;
        default:
          loadLvl1();
      }
    }
  }
} else {
  console.log('Le cookie "screen" n\'est pas présent');

  // Créer un cookie
  document.cookie = "screen=0; level=0; path=/;";
  loadScreen0();
}
