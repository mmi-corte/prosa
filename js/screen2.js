
import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton } from './button.js';
import { setCookie, getCookie, setCityCookie } from './cookieHandler.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { refreshPage } from './refreshPage.js';
import { addSVG } from './svg.js';

import { loadSound, suspendSound,stopSound } from './Sound/sound.js';

import  {loadScreen3} from './screen3.js';

export function loadScreen2() {
    console.log("loadScreen2:je suis là");
  
    refreshPage();
  
    addImgBackground("container", "./assets/bg/fondVille.jpg");
    addH1("container", "Où te trouves-tu ?", "classTxtCity");
  
    addDiv("container", "containerBtnCity", "classContainerCity");
    ajouterBouton("containerBtnCity", "Corte", "btnCorte", "btnclass");
    ajouterBouton("containerBtnCity", "Toulon", "btnToulon", "btnclass");
  
    // Ajouter les gestionnaires d'événements pour chaque bouton
    const btnCorte = document.getElementById("btnCorte");
    const btnToulon = document.getElementById("btnToulon");
  
    // Lorsque le bouton Corte est cliqué, on stocke "Corte" dans le cookie
    btnCorte.addEventListener("click", function () {
      setCityCookie("Corte"); // Stocker Corte dans le cookie
      loadScreen3();
    });
  
    // Lorsque le bouton Toulon est cliqué, on stocke "Toulon" dans le cookie
    btnToulon.addEventListener("click", function () {
      setCityCookie("Toulon"); // Stocker Toulon dans le cookie
      loadScreen3();
    });
  
    document.cookie = "screen=2; level=0; path=/;";
  
    setCookie("screen", "2", 7, "/");
  
    const villeChoisie = getCookie("ville"); // Récupère la ville stockée dans le cookie
    console.log("La ville choisie est : ", villeChoisie);
  }
 