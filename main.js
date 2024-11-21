
import { ajouterBouton } from './js/btn/startBtn.js';
import { refreshPage } from './js/event/refreshPage.js'

// Appelle la fonction pour ajouter un bouton dans la div avec l'id "conteneur"
ajouterBouton('conteneur');


//teste bouton event efface la page et ajoute un autre btn

// Sélectionne le bouton par son ID
const bouton = document.getElementById("btnStart");

// Ajoute un écouteur d'événement "click" au bouton
bouton.addEventListener("click", function() {
    // Cette condition sera toujours vraie, car elle réagit au clic
    if (true) {
        refreshPage()
        ajouterBouton("conteneur")
    }
});




