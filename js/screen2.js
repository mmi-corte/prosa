// fichier : screen2.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 2 du jeu.

// import des fonctions nécessaires
import { addDiv, addH1 } from './texte.js';
import { addImgBackground } from './fonctionImg.js';
import { ajouterBouton } from './button.js';
import { nextScreen } from './navigation.js';
import { refreshPage } from './refreshPage.js';
import { log } from './trace.js';

// fonction pour charger l'écran 2
export function loadScreen2() {

  // refresh the page
  refreshPage();

  // begin trace
  log("Loading S2...", "blue");

  // add content
  addImgBackground("container", "./assets/bg/fondVille.jpg");
  addH1("container", "Où te trouves-tu ?", "classTxtCity");

  addDiv("container", "containerBtnCity", "classContainerCity");
  ajouterBouton("containerBtnCity", "Corte", "btnCorte", "btnclass");
  ajouterBouton("containerBtnCity", "Toulon", "btnToulon", "btnclass");

  // Add button
  const btnCorte = document.getElementById("btnCorte");
  const btnToulon = document.getElementById("btnToulon");

  // selected city
  var city;

  // binding
  btnCorte.addEventListener("click", () => {
    city = "Corte";
    
    log(`La ville choisie est : ${city}`, "green");
    
    // update local storage
    localStorage.setItem("ville", city); // Stocker Corte dans le localStorage

    // move to the next page
    nextScreen("3");
  });

  btnToulon.addEventListener("click", () => {
    city = "Toulon";
    
    log(`La ville choisie est : ${city}`, "green");

    // update local storage
    localStorage.setItem("ville", city); 

    // move to the next page
    nextScreen("3");
  });
 
  // end trace
  log("S2 loaded!", "blue");
}
 