// fichier : screen3.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 3 du jeu.

// import des fonctions nécessaires
import { addForm } from './form.js';
import { addTxt } from './texte.js';
import { nextScreen } from './navigation.js';
import { refreshPage } from './refreshPage.js';
import { popup } from './popup.js';
import { log } from './trace.js';

// fonction pour charger l'écran 3
export function loadScreen3() {

    // refresh the page
    refreshPage();

    // begin trace
    log('Loading S3...',"blue");
        
    // add content
    addTxt("container", "Nom de ton héros", "txtFormName");
    addForm("container");

    const input = document.getElementById("userInput");
    const btnSubmit = document.getElementById("btnSubmit");

    const player_name = localStorage.getItem("playerName");
    if (player_name) {
        input.value=player_name;
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
        log(`Nom du joueur : ${playerUserName}`, "green");

        localStorage.setItem("playerName", playerUserName);

        // move to the next page
        nextScreen("4");
    });
    
    // Effacer l'erreur lorsque l'utilisateur se concentre sur l'input
    input.addEventListener("focus", () => {
        input.placeholder = "Entrez votre nom"; // Restaurer le placeholder original
        input.style.border = "1px solid #ccc"; // Bordure par défaut
    });

    // end trace
    log('S3 loaded!', "blue");
}