import { addBtnImg, addInvisibleBtn, ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground, addImg } from './js/fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit } from './js/texte.js';
import { addSVG } from './js/svg.js';
import { warningSvg } from './assets/svgcode.js';
import { showStaticMap } from './js/map.js';


// Appelle la fonction pour ajouter un bouton dans la div avec l'id "container"
ajouterBouton('container', 'Commencer', 'btnStart', 'btn');

// Récupère le bouton Start
const boutonStart = document.getElementById("btnStart");

// Ajoute un écouteur d'événement "click" au bouton Start
boutonStart.addEventListener("click", function () {
    // Efface la page et ajoute un formulaire et un bouton Valider
    refreshPage();
    addTxt('container', 'Veuillez entrer votre nom');
    const labelform = document.getElementsByClassName('txt');
    labelform[0].id = 'txt1'
    addForm('container');
    ajouterBouton('container', 'Valider', 'btnSubmit', 'btn');
    addImg('container', 'assets/logo.png', 'logoimg');
    const logoimg = document.getElementsByClassName('logoimg');
    logoimg[0].id = 'logoImgP2'

    // Récupère le bouton Submit (après sa création)
    const boutonSubmit = document.getElementById("btnSubmit");

    // Ajoute un écouteur d'événement "click" au bouton Submit
    boutonSubmit.addEventListener("click", function () {
        handleFormSubmit("formUser", 'btnSubmit');

        refreshPage();

        //svg
        addSVG('container', warningSvg);
        const svg = document.getElementsByTagName('svg');
        svg[0].id = 'svg1'
        //attention txt
        addTxt('container', 'ATTENTION');
        const disclaimer = document.getElementsByClassName('txt');
        disclaimer[0].id = 'txt3'
        //text warning
        addTxtWithBoldWord('container', 'Pour votre sécurité, restez\nattentif à votre\nenvironnement et évitez\nles zones à risques.', 'sécurité');
        disclaimer[1].id = 'txt2'
        //logo
        addImg('container', 'assets/logo.png', 'logoimg');
        const logoimg = document.getElementsByClassName('logoimg');
        logoimg[0].id = 'logoImgP2'
        ajouterBouton('container', '', 'btnInv1', "btnInv");

        // Récupère le bouton du btn invisible
        const boutonInv = document.getElementById("btnInv1");
        boutonInv.addEventListener("click", function () {
            refreshPage();
            addDiv("container", "divNarra1", "dialogBox")
            addNameCharacter("E1Narra", 'divNarra1', "nameCharacter");
            addTxtNarration("E1Narra", "divNarra1", "narration");
            ajouterBouton('container', 'Commencer', 'btnMap', 'btn');
            const btnMap = document.getElementById("btnMap");
            btnMap.addEventListener("click", function () {
                refreshPage();
                // Liste des marqueurs à ajouter sur la carte
                const markers = [
                    { latitude: 42.308553, longitude: 9.152054 },  // Premier marqueur
                    { latitude: 42.315000, longitude: 9.153000 },  // Deuxième marqueur
                    { latitude: 42.305000, longitude: 9.148000 },  // Troisième marqueur
                ];
                //showStaticMap("42.309409", "9.149022", '15', 'container', "8b92289a637347489b3b13811907ebdd",markers);
                showStaticMap('container', "42.309409", '9.149022', "15","8b92289a637347489b3b13811907ebdd" , markers);

            })


        });
    });
});





