import { addBtnImg, addInvisibleBtn, ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground, addImg } from './js/fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit } from './js/texte.js';
import { addSVG } from './js/svg.js';
import { warningSvg } from './assets/svgcode.js';
import { showStaticMap } from './js/map.js';
import { loadSound, suspendSound } from './js/Sound/sound.js';
import { lunchFight } from './js/fight.js';
import { addEsterelle, ARAfata } from './js/ARSaint-mart.js';
import { changeStyleBG, selectAvatar ,selectButton} from './js/functionChangeStyle.js';
import { addOverlay } from './js/overlay.js';



let weapons = [
    {
        name: "Epée",
        damage: 10
    },
    {
        name: "Grimoire",
        damage: 15
    },
    {
        name: "Arc",
        damage: 20
    }
]

const enemies = [
    {
        name: "Cerf",
        hp: 100,
        damage: 10
    }
]

let playerName = "";

// Create an object to store the audio players


// Appelle la fonction pour ajouter un bouton dans la div avec l'id "container"
ajouterBouton('container', 'Commencer', 'btnStart', 'btn');

// Récupère le bouton Start
const boutonStart = document.getElementById("btnStart");

//------------PREVENTION-------------------------------------
// Ajoute un écouteur d'événement "click" au bouton Start
boutonStart.addEventListener("click", function () {
    loadSound('assets/sound/buttoneffect.mp3');
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

    const btnInv1 = document.getElementById("btnInv1")
    //--------------PSEUDO-------------------------
    // Ajoute un écouteur d'événement "click" au bouton Submit
    btnInv1.addEventListener("click", function () {
        // button sound
        loadSound('assets/sound/buttoneffect.mp3');

        // Efface la page et ajoute un formulaire et un bouton Valider
        refreshPage();
        addTxt('container', 'Veuillez entrer votre nom');
        const labelform = document.getElementsByClassName('txt');
        labelform[0].id = 'txt1'
        addForm('container');
        addImg('container', 'assets/logo.png', 'logoimg');
        const logoimg = document.getElementsByClassName('logoimg');
        logoimg[0].id = 'logoImgP2'

        // Récupère le bouton du btn submit
        const boutonSubmit = document.getElementById("btnSubmit");
        //-----------------------AVATAR--------------------------------
        boutonSubmit.addEventListener("click", function () {
            refreshPage();
            addDiv("container", "containerAvatar", "divAvatar");
            addDiv("containerAvatar", "imgAvatarContainer", "imgAvatarContainer")
            addBtnImg("imgAvatarContainer", "./assets/avatar/AvatarT1.png", "a1");
            addBtnImg("imgAvatarContainer", "./assets/avatar/AvatarT2.png", "a2");
            addBtnImg("imgAvatarContainer", "./assets/avatar/AvatarT3.png", "a3");
            addBtnImg("imgAvatarContainer", "./assets/avatar/AvatarT4.png", "a4");

            const avatar1 = document.getElementById("a1");
            const avatar2 = document.getElementById("a2");
            const avatar3 = document.getElementById("a3");
            const avatar4 = document.getElementById("a4");
            // Regrouper toutes les images dans une liste
            const allAvatars = [avatar1, avatar2, avatar3, avatar4];

            selectAvatar(allAvatars);

            ajouterBouton('containerAvatar', 'Confirmer', 'btnConfirm', "btn");
            const btnConfirm = document.getElementById('btnConfirm');
            //--------------LOCALISATION-----------------------
            btnConfirm.addEventListener("click", function () {
                refreshPage();
                addTxtWithBoldWord("container", 'Vous êtes à :', '');
                addDiv('container', 'containerBtnLoc', "");
                ajouterBouton('containerBtnLoc', "Corte", 'btnLocCorte', 'btn btnLoc');
                ajouterBouton('containerBtnLoc', 'Toulon', 'btnLocToulon', 'btn btnLoc');
                const buttons = document.querySelectorAll('.btnLoc');
                selectButton(buttons);

                ajouterBouton('container', 'Confirmer', 'btnLocV', 'btn');

                const btnLocV = document.getElementById('btnLocV');
                //-------------------INTRO-----------------------------
                btnLocV.addEventListener("click", function () {

                    refreshPage();
                    addImg("container", "assets/berger.jpg", 'imgIntro');
                    addDiv("container", "divNarra1", "dialogBox");
                    addNameCharacter("E1Narra", 'divNarra1', "nameCharacter");
                    addTxtNarration("E1Narra", "divNarra1", "narration");
                    //-----------------MAP----------------------
                    /*                
                        //test fight
                        lunchFight(weapons, enemies[0]);
                    })*/
                    ajouterBouton('container', '', 'btnInv2', "btnInv");
                    // Récupère le bouton du btn invisible
                    const boutonInv2 = document.getElementById("btnInv2");
                    boutonInv2.addEventListener("click", function () {
                        refreshPage();
                        //--------MAP----------------------
                        const containerId = 'container';
                        const centerLatitude = 42.309409; // Exemple : Paris
                        const centerLongitude = 9.149022;
                        const zoom = 15;
                        const apiKey = '8b92289a637347489b3b13811907ebdd'; // Remplacez par votre clé Geoapify

                        // Définition des deux marqueurs
                        const marker1 = {
                            latitude: 42.309409,
                            longitude: 9.149022,
                            color: 'red' // Couleur personnalisée
                        };

                        const marker2 = {
                            latitude: 48.8606,
                            longitude: 2.3376,
                            color: 'blue' // Couleur personnalisée
                        };

                        // Appel de la fonction
                        showStaticMap(containerId, centerLatitude, centerLongitude, zoom, apiKey, marker1);


                        //showStaticMap('container', "42.309409", '9.149022', "15", "8b92289a637347489b3b13811907ebdd", markers);

                        addTxtWithBoldWord('container', "Il est temps pour vous de vous diriger vers la fontaine.", "fontaine");
                        // Vérifiez si le bouton n'existe pas avant de l'ajouter
                        if (!document.getElementById('btnNext')) {
                            ajouterBouton('container', 'Confirmez votre arrivée', 'btnNext', "btn");

                            const btnNext = document.getElementById('btnNext');
                            btnNext.addEventListener('click', function () {
                                refreshPage(); // Optionnel si vous voulez nettoyer à nouveau la page
                                changeStyleBG('bgimage')
                                ARAfata('container');

                                addOverlay('audioPlayer');

                                //loadSound(  "./assets/son.mp3",true);

                            });
                        }
                    });
                });

            });

        });

    });
});





