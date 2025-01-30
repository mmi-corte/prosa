
import { addDiv, addH1 } from './texte.js';
import { addImgBackground } from './fonctionImg.js';
import { ajouterBouton } from './button.js';
import { getCookie, setCookie } from './cookieHandler.js';
import { loadScreen3 } from './screen3.js';
import { refreshPage } from './refreshPage.js';

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
      setCookie("ville", "Corte", 7, "/"); // Stocker Corte dans le cookie
      loadScreen3();
    });
  
    // Lorsque le bouton Toulon est cliqué, on stocke "Toulon" dans le cookie
    btnToulon.addEventListener("click", function () {
      setCookie("ville", "Toulon", 7, "/"); // Stocker Toulon dans le cookie
      loadScreen3();
    });
    
    console.log("La ville choisie est : ", getCookie("ville"));

     // update screen cookie
     setCookie("screen", "2", 7, "/");
  
  }
 