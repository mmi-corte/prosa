
import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton } from './button.js';
import { setCookie, getCookie } from './cookieHandler.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { refreshPage } from './refreshPage.js';
import { addSVG } from './svg.js';

import { loadSound, suspendSound,stopSound } from './Sound/sound.js';
import { addForm } from "./form.js";
import { loadScreen4 } from './screen4.js';


export function loadScreen3() {

    console.log('loadScreen3:je suis là');
    
    refreshPage();

    addTxt("container", "Écris ton nom de héro", "txtFormName");
    addForm("container")

    const input = document.getElementById("userInput");
    const btnSubmit = document.getElementById("btnSubmit");

    btnSubmit.addEventListener("click", function (event) {
        event.preventDefault();
    
        const playerUserName = input.value.trim();
    
        if (playerUserName === "") {
            // Afficher le message d'erreur dans le placeholder
            input.value = ""; // Vider l'input si l'utilisateur a saisi des espaces
            input.placeholder = "Ce champ est requis !";
            input.style.border = "2px solid red"; // Ajout d'une bordure rouge
            return; // Empêche le passage à screen4
        }
    
        // Si le champ est rempli, passer à l'écran suivant
        input.style.border = "none"; // Réinitialiser le style
        console.log("Nom du joueur : ", playerUserName);
        setCookie("playerName", playerUserName, 7, "/");
        loadScreen4();
    });
    
    // Effacer l'erreur lorsque l'utilisateur se concentre sur l'input
    input.addEventListener("focus", function () {
        input.placeholder = "Entrez votre nom"; // Restaurer le placeholder original
        input.style.border = "1px solid #ccc"; // Bordure par défaut
    });
    

     // update screen cookie
     setCookie("screen", "3", 7, "/");
  
}