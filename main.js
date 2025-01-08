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
import { changeStyleBG, skin, selectAvatar ,selectButton,changeStyleBGB} from './js/functionChangeStyle.js';
import { addOverlay } from './js/overlay.js';
import { addAutoPlayVideo } from './js/video.js';

//Variable / Constante pour les combats

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
        hp: 50,
        damage: 10
    },
    {
        name: "Sylvain",
        hp: 80,
        damage: 15
    },
    {
        name: "Basgialiscu",
        hp: 100,
        damage: 20
    },
    {
        name: "Tarasque",
        hp: 100,
        damage: 20
    }
]

export let playerUserName = "";

// Create an object to store the audio players


// Appelle la fonction pour ajouter un bouton dans la div avec l'id "container"
ajouterBouton('container', 'Commencer', 'btnStart', 'btn');

// Récupère le bouton Start
const boutonStart = document.getElementById("btnStart");

boutonStart.addEventListener("click", function () {
    refreshPage();
    addImg("container", 'assets/berger.jpg');
    ajouterBouton('container', '', 'btnInvI', "btnInv");
    const btnInvI1 = document.getElementById("btnInvI");

    // ------------ PREVENTION -------------------------------------
    btnInvI1.addEventListener("click", function () {
        refreshPage();
        loadSound('assets/sound/buttoneffect.mp3');
        addSVG('container', warningSvg);
        document.getElementsByTagName('svg')[0].id = 'svg1';
        addTxt('container', 'ATTENTION');
        addTxtWithBoldWord('container', 'Pour votre sécurité, restez\nattentif à votre\nenvironnement et évitez\nles zones à risques.', 'sécurité');
        addImg('container', 'assets/logo.png', 'logoimg');
        ajouterBouton('container', '', 'btnInv1', "btnInv");

        const btnInv1 = document.getElementById("btnInv1");

        // -------------- PSEUDO -------------------------
        btnInv1.addEventListener("click", function () {
            loadSound('assets/sound/buttoneffect.mp3');
            refreshPage();
            addTxt('container', 'Veuillez entrer votre nom');
            addForm('container');
            addImg('container', 'assets/logo.png', 'logoimg');

            const boutonSubmit = document.getElementById("btnSubmit");

            // ----------------------- AVATAR --------------------------------
            boutonSubmit.addEventListener("click", function () {
                const usernameInput = document.getElementById("userInput");
                const playerUserName = usernameInput.value; // Stocke le pseudo utilisateur
                refreshPage();

                addDiv("container", "containerAvatar", "divAvatar");
                addDiv("containerAvatar", "imgAvatarContainer", "imgAvatarContainer");
                const avatarPaths = [
                    "./assets/avatar/AvatarT1.png",
                    "./assets/avatar/AvatarT2.png",
                    "./assets/avatar/AvatarT3.png",
                    "./assets/avatar/AvatarT4.png"
                ];
                avatarPaths.forEach((path, index) => {
                    addBtnImg("imgAvatarContainer", path, `a${index + 1}`);
                });

                const avatars = avatarPaths.map((_, index) => document.getElementById(`a${index + 1}`));
                selectAvatar(avatars);

                ajouterBouton('containerAvatar', 'Confirmer', 'btnConfirm', "btn");

                const btnConfirm = document.getElementById('btnConfirm');

                // -------------- LOCALISATION -----------------------
                btnConfirm.addEventListener("click", function () {
                    refreshPage();
                    addTxtWithBoldWord("container", 'Vous êtes à :', '');
                    addDiv('container', 'containerBtnLoc', "");
                    ajouterBouton('containerBtnLoc', "Corte", 'btnLocCorte', 'btn btnLoc');
                    ajouterBouton('containerBtnLoc', 'Toulon', 'btnLocToulon', 'btn btnLoc');

                    const btnLocV = document.createElement('button');
                    btnLocV.id = 'btnLocV';
                    btnLocV.textContent = 'Confirmer';
                    btnLocV.className = 'btn';
                    document.getElementById('container').appendChild(btnLocV);

                    btnLocV.addEventListener("click", function () {
                        refreshPage();
                        addAutoPlayVideo('container', './assets/video/IntroTourneeV1.mp4', 'introVideo');

                        ajouterBouton('container', '', 'btnInv2', "btnInv");
                        const boutonInv2 = document.getElementById("btnInv2");

                        boutonInv2.addEventListener("click", function () {
                            refreshPage();

                            const containerId = 'container';
                            const centerLatitude = 42.309409; 
                            const centerLongitude = 9.149022;
                            const zoom = 15;
                            const apiKey = '8b92289a637347489b3b13811907ebdd'; 

                            const markers = [
                                { latitude: 42.309409, longitude: 9.149022, color: 'red' },
                                { latitude: 48.8606, longitude: 2.3376, color: 'blue' }
                            ];

                            showStaticMap(containerId, centerLatitude, centerLongitude, zoom, apiKey, markers[0]);
                            addTxtWithBoldWord('container', "Il est temps pour vous de vous diriger vers la fontaine.", "fontaine");

                            if (!document.getElementById('btnNext')) {
                                ajouterBouton('container', 'Confirmez votre arrivée', 'btnNext', "btn");
                                const btnNext = document.getElementById('btnNext');
                                btnNext.addEventListener('click', function () {
                                    refreshPage();
                                    changeStyleBG('bgimage');
                                    ARAfata('container');
                                    addOverlay('audioPlayer');
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});
