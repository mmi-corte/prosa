import { ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground } from './js/fonctionImg.js';
import { addTxt } from './js/texte.js';


// Appelle la fonction pour ajouter un bouton dans la div avec l'id "container"
ajouterBouton('container', 'Start', 'btnStart');

// Récupère le bouton Start
const boutonStart = document.getElementById("btnStart");

// Ajoute un écouteur d'événement "click" au bouton Start
boutonStart.addEventListener("click", function () {
    // Efface la page et ajoute un formulaire et un bouton Valider
    refreshPage();
    addForm('container');
    ajouterBouton('container', 'Valider', 'btnSubmit');

    // Récupère le bouton Submit (après sa création)
    const boutonSubmit = document.getElementById("btnSubmit");

    // Ajoute un écouteur d'événement "click" au bouton Submit
    boutonSubmit.addEventListener("click", function () {
        console.log("test1");
        refreshPage();
        addTxt('container');
        addImgBackground ('container','https://i.pinimg.com/736x/81/1a/4c/811a4c0afe4051eb8353a563b58673b8.jpg');
    });
});





