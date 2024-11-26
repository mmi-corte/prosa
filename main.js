import { addInvisibleBtn, ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground, addImg } from './js/fonctionImg.js';
import { addTxt, addTxtWithBoldWord } from './js/texte.js';


// Appelle la fonction pour ajouter un bouton dans la div avec l'id "container"
ajouterBouton('container', 'Commencer', 'btnStart');

// Récupère le bouton Start
const boutonStart = document.getElementById("btnStart");

// Ajoute un écouteur d'événement "click" au bouton Start
boutonStart.addEventListener("click", function () {
    // Efface la page et ajoute un formulaire et un bouton Valider
    refreshPage();
    addTxt('container', 'Veuillez entrer votre nom');
    const labelform = document.getElementsByClassName('txt');
    labelform[0].id='txt1'
    addForm('container');
    ajouterBouton('container', 'Valider', 'btnSubmit');
    addImg('container','assets/logo.png','logoimg');
    const logoimg = document.getElementsByClassName('logoimg');
    logoimg[0].id='logoImgP2'

    // Récupère le bouton Submit (après sa création)
    const boutonSubmit = document.getElementById("btnSubmit");

    // Ajoute un écouteur d'événement "click" au bouton Submit
    boutonSubmit.addEventListener("click", function () {
        refreshPage();
        addImg('container','https://w7.pngwing.com/pngs/1012/979/png-transparent-computer-icons-picto-thumbnail.png','icon');
        addTxtWithBoldWord('container','Pour votre sécurité, restez attentif à votre environnement et évitez les zones à risque', 'sécurité');
        //addImgBackground ('container','https://i.pinimg.com/736x/81/1a/4c/811a4c0afe4051eb8353a563b58673b8.jpg');
        addImg('container','https://w7.pngwing.com/pngs/1012/979/png-transparent-computer-icons-picto-thumbnail.png','logo');
        ajouterBouton('container','','btnInv');

        const btnInv = document.getElementById('btnInv');
        btnInv.addEventListener("click", function(){
            refreshPage();
            addTxt('container');
        }
    );
    });
});





