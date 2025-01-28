
import { addForm } from './form.js';
import { addTxt } from './texte.js';
import { loadScreen4 } from './screen4.js';
import { refreshPage } from './refreshPage.js';
import { getCookie, isCookiePresent, setCookie } from './cookieHandler.js';
import { popup } from './popup.js';

export function loadScreen3() {

    console.log('loadScreen3:je suis là');
    
    refreshPage();

    addTxt("container", "Écris ton nom de héro", "txtFormName");
    addForm("container")

    const input = document.getElementById("userInput");
    const btnSubmit = document.getElementById("btnSubmit");

    if (isCookiePresent("playerName")) {
        input.value=getCookie("playerName");
    }

    btnSubmit.addEventListener("click", function (event) {
        event.preventDefault();
    
        const playerUserName = input.value.trim();
    
        if (playerUserName === "") {
            popup("Ce champ est requis !");
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