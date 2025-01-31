// fichier : screen2.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 2 du jeu.

// import des fonctions nécessaires
import { addDiv, addH1 } from './texte.js';
import { addImgBackground } from './fonctionImg.js';
import { ajouterBouton } from './button.js';
import { getCookie, setCookie } from './cookieHandler.js';
import { loadScreen3 } from './screen3.js';
import { refreshPage } from './refreshPage.js';

// fonction pour charger l'écran 2
export function loadScreen2() {

    console.log("loading loadScreen2...");
  
    // refresh the page
    refreshPage();

    // add content
    addImgBackground("container", "./assets/bg/fondVille.jpg");
    addH1("container", "Où te trouves-tu ?", "classTxtCity");
  
    addDiv("container", "containerBtnCity", "classContainerCity");
    ajouterBouton("containerBtnCity", "Corte", "btnCorte", "btnclass");
    ajouterBouton("containerBtnCity", "Toulon", "btnToulon", "btnclass");
  
    // Add button
    const btnCorte = document.getElementById("btnCorte");
    const btnToulon = document.getElementById("btnToulon");
  
    // binding
    btnCorte.addEventListener("click", () => {
      setCookie("ville", "Corte", 7, "/"); // Stocker Corte dans le cookie
      loadScreen3();
    });
  
    btnToulon.addEventListener("click", () => {
      setCookie("ville", "Toulon", 7, "/"); // Stocker Toulon dans le cookie
      loadScreen3();
    });
    
    console.log("La ville choisie est : ", getCookie("ville"));

    // update screen cookie
    setCookie("screen", "2", 7, "/");

    console.log("loadScreen2 loaded!");
  }
 