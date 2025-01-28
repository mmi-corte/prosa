
import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton } from './button.js';
import { setCookie, getCookie } from './cookieHandler.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { refreshPage } from './refreshPage.js';
import { addSVG } from './svg.js';

import { loadSound, suspendSound,stopSound } from './Sound/sound.js';
import { loadScreen1 } from "./screen1.js";

export function loadScreen0() {
  console.log("loadScreen0: je suis là");

  // add background
  //document.body.style.background = "linear-gradient(149deg, rgba(230, 181, 122, 1) 0%, rgba(232, 188, 134, 1) 42%, rgba(245, 225, 202, 1) 100%)";

    loadSound("./assets/sound/intro.mp3", true);
    console.log('loadScreen0: je suis là');

    // add background
    //document.body.style.background = "linear-gradient(149deg, rgba(230, 181, 122, 1) 0%, rgba(232, 188, 134, 1) 42%, rgba(245, 225, 202, 1) 100%)";
    
    // add logo
    addImg('container','./assets/logo.png','logoimg', 'logoImgP1');
    addImgBackground('container',"assets/bg/Accueil.png");
 // Ajouter un bouton pour le son

  // add button
  const btn1 = ajouterBouton(
    "container",
    "JOUER MAINTENANT",
    "btn1",
    "btnclass"
  );

  // binding
  btn1.addEventListener("click", function () {
    loadScreen1();
  });

  setCookie("screen", "0", 7, "/");
}



