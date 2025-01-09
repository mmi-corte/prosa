import { addBtnImg, addInvisibleBtn, ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground, addImg } from './js/fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './js/texte.js';
import { addSVG } from './js/svg.js';
import { warningSvg } from './assets/svgcode.js';
import { showStaticMap } from './js/map.js';
import { loadSound, suspendSound } from './js/Sound/sound.js';
import { lunchFight } from './js/fight.js';
//import { AREsterelle, ARAfata, ARBerger } from './js/ARFunction.js';
import { changeStyleBG, skin, selectAvatar, selectButton, changeStyleBGB } from './js/functionChangeStyle.js';
import { addOverlay } from './js/overlay.js';
import { addAutoPlayVideo } from './js/video.js';
import { step2 } from './js/functionstep.js'
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
//var container
const container = 'container';
const btnNext = 'btnInvNext';
const btnChoix1 = 'btnChoix1';
const btnChoix2 = 'btnChoix2';
const txtNarr = 'narrationText';
const name = 'PersoTxt';
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


                    const allButtons = document.querySelectorAll('.btnLoc');
                    selectButton(allButtons);
                    ajouterBouton(container, 'Confirmer', btnNext, 'btn');

                    const btnLocV = document.getElementById(btnNext);

                    btnLocV.addEventListener("click", function () {
                        refreshPage();
                        addAutoPlayVideo('container', './assets/video/IntroTourneeV1.mp4', 'introVideo');

                        ajouterBouton('container', '', 'btnInv2', "btnInv");
                        const boutonInv2 = document.getElementById("btnInv2");
                        //-----------ETAPE 1------------------------
                        boutonInv2.addEventListener("click", function () {
                            refreshPage();
                            changeStyleBG('bgimage');
                            //ARBerger('container');
                            addImgBackground(container, 'assets/bg/bg.png');
                            //addImg('container', 'assets/bg/bg.png', 'imgBg');
                            addDiv('container', "diagBox", 'diagBoxN');
                            addTxtNarration("E1Narra", 'diagBox', 'dialogBox');
                            ajouterBouton('diagBox', '', 'btnInvNext', 'btnInv');
                            addOverlay('audioPlayer');

                            const btnInv3 = document.getElementById('btnInvNext');

                            btnInv3.addEventListener("click", function () {
                                refreshPage();
                                addImgBackground(container, 'assets/bg/bg.png');
                                addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                addDiv('container', "diagBox", 'diagBox');
                                addNameCharacter('E1Berger', 'diagBox', 'nameCharacter');
                                addTxtNarration("E1Berger", 'diagBox', 'dialogBox');
                                addOverlay('audioPlayer');

                                ajouterBouton('diagBox', '', 'btnInvNext', 'btnInv');
                                document.getElementById(btnNext).addEventListener("click", function () {
                                    refreshPage();
                                    addImgBackground(container, 'assets/bg/bg.png');
                                    addDiv('container', "diagBox", 'diagBoxN');
                                    addTxtNarration("E1Narra1", 'diagBox', 'dialogBox');
                                    addOverlay('audioPlayer');

                                    ajouterBouton('diagBox', '', btnNext, 'btnInv');
                                    document.getElementById(btnNext).addEventListener("click", function () {
                                        refreshPage();
                                        addImgBackground(container, 'assets/bg/bg.png');
                                        addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                        addDiv('container', "diagBox", 'diagBox');
                                        addNameCharacter('E1Berger1', 'diagBox', 'nameCharacter');
                                        addTxtNarration("E1Berger1", 'diagBox', 'dialogBox');
                                        addOverlay('audioPlayer');

                                        ajouterBouton('diagBox', '', btnNext, 'btnInv');
                                        document.getElementById(btnNext).addEventListener("click", function () {
                                            refreshPage();
                                            addImgBackground(container, 'assets/bg/bg.png');
                                            addDiv('container', "diagBox", 'diagBoxN');
                                            addTxtNarration("E1Narra2", 'diagBox', 'dialogBox');
                                            addOverlay('audioPlayer');

                                            ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                refreshPage();
                                                addImgBackground(container, 'assets/bg/bg.png');
                                                addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                addDiv('container', "diagBox", 'diagBox');
                                                addNameCharacter('E1Berger2', 'diagBox', 'nameCharacter');
                                                addTxtNarration("E1Berger2", 'diagBox', 'dialogBox');
                                                addOverlay('audioPlayer');

                                                ajouterBouton('diagBox', '', btnNext, 'btnInv');
                                                document.getElementById(btnNext).addEventListener('click', function () {
                                                    refreshPage();
                                                    addImgBackground(container, 'assets/bg/bg.png');
                                                    addDiv('container', "diagBox", 'diagBoxN');
                                                    addTxtNarration("E1Narra3", 'diagBox', 'dialogBox');
                                                    addOverlay('audioPlayer');

                                                    ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                    document.getElementById(btnNext).addEventListener("click", function () {
                                                        refreshPage();
                                                        addImgBackground(container, 'assets/bg/bg.png');
                                                        addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                        addDiv('container', "diagBox", 'diagBox');
                                                        addNameCharacter('E1Berger3', 'diagBox', 'nameCharacter');
                                                        addTxtNarration("E1Berger3", 'diagBox', 'dialogBox');
                                                        addOverlay('audioPlayer');

                                                        ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                        document.getElementById(btnNext).addEventListener("click", function () {
                                                            refreshPage();
                                                            addImgBackground(container, 'assets/bg/bg.png');
                                                            addDiv('container', "diagBox", 'diagBoxN');
                                                            addTxtNarration("E1Narra4", 'diagBox', 'dialogBox');
                                                            addOverlay('audioPlayer');

                                                            ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                                refreshPage();
                                                                addImgBackground(container, 'assets/bg/bg.png');
                                                                addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                                addDiv('container', "diagBox", 'diagBox');
                                                                addNameCharacter('E1Berger4', 'diagBox', 'nameCharacter');
                                                                addTxtNarration("E1Berger4", 'diagBox', 'dialogBox');
                                                                addOverlay('audioPlayer');

                                                                ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                document.getElementById(btnNext).addEventListener("click", function () {
                                                                    refreshPage();
                                                                    addImgBackground(container, 'assets/bg/bg.png');
                                                                    addDiv('container', "diagBox", 'diagBoxN');
                                                                    addTxtNarration("E1Narra5", 'diagBox', 'dialogBox');
                                                                    addOverlay('audioPlayer');

                                                                    ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                    document.getElementById(btnNext).addEventListener("click", function () {
                                                                        refreshPage();
                                                                        addImgBackground(container, 'assets/bg/bg.png');
                                                                        addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                                        addDiv('container', "diagBox", 'diagBox');
                                                                        addNameCharacter('E1Berger5', 'diagBox', 'nameCharacter');
                                                                        addTxtNarration("E1Berger5", 'diagBox', 'dialogBox');
                                                                        addOverlay('audioPlayer');

                                                                        ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                        document.getElementById(btnNext).addEventListener("click", function () {
                                                                            refreshPage();
                                                                            addImgBackground(container, 'assets/bg/bg.png');
                                                                            addDiv('container', "diagBox", 'diagBoxN');
                                                                            addTxtNarration("E1Narra6", 'diagBox', 'dialogBox');
                                                                            addOverlay('audioPlayer');

                                                                            ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                                                refreshPage();
                                                                                addImgBackground(container, 'assets/bg/bg.png');
                                                                                addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                                                addDiv('container', "diagBox", 'diagBox');
                                                                                addNameCharacter('E1Berger6', 'diagBox', 'nameCharacter');
                                                                                addTxtNarration("E1Berger6", 'diagBox', 'dialogBox');
                                                                                addOverlay('audioPlayer');

                                                                                ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                                document.getElementById(btnNext).addEventListener("click", function () {
                                                                                    refreshPage();
                                                                                    addImgBackground(container, 'assets/bg/bg.png');
                                                                                    addDiv('container', "diagBox", 'diagBoxN');
                                                                                    addTxtNarration("E1Narra7", 'diagBox', 'dialogBox');


                                                                                    ajouterBouton('diagBox', '', btnChoix1, 'btnChoix choix1');
                                                                                    addTxtNarration("E1Choix1", btnChoix1, "");
                                                                                    ajouterBouton('diagBox', '', btnChoix2, 'btnChoix choix2');
                                                                                    addTxtNarration("E1Choix2", btnChoix2, "");
                                                                                    addOverlay('audioPlayer');
                                                                                    //-----------------ETAPE 1 BIS-------------------------------------------
                                                                                    document.getElementById(btnChoix1).addEventListener("click", function () {
                                                                                        refreshPage();
                                                                                        addImgBackground(container, 'assets/bg/bg.png');
                                                                                        addDiv('container', "diagBox", 'diagBoxN');
                                                                                        addTxtNarration("E1BNarra", 'diagBox', 'dialogBox');
                                                                                        addOverlay('audioPlayer');

                                                                                        ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                                        document.getElementById(btnNext).addEventListener("click", function () {
                                                                                            refreshPage();
                                                                                            addImgBackground(container, 'assets/bg/bg.png');
                                                                                            addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                                                            addDiv('container', "diagBox", 'diagBox');
                                                                                            addNameCharacter('E1BBerger', 'diagBox', 'nameCharacter');
                                                                                            addTxtNarration("E1BBerger", 'diagBox', 'dialogBox');
                                                                                            addOverlay('audioPlayer');

                                                                                            ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                                                                refreshPage();
                                                                                                addImgBackground(container, 'assets/bg/bg.png');
                                                                                                addDiv('container', "diagBox", 'diagBoxN');
                                                                                                addTxtNarration("E1BNarra2", 'diagBox', 'dialogBox');
                                                                                                //METTRE POP UP

                                                                                                addOverlay('audioPlayer');

                                                                                                ajouterBouton('diagBox', '', btnNext, 'btnInv');

                                                                                                document.getElementById(btnNext).addEventListener("click", function () {
                                                                                                    //METTRE POP UP
                                                                                                    refreshPage();
                                                                                                    changeStyleBG(container);
                                                                                                    addTxt(container,"pop up");

                                                                                                    ajouterBouton(container, '', btnNext, 'btnInv');
                                                                                                    //-------------ETAPE 2  CHOIX 1
                                                                                                    document.getElementById(btnNext).addEventListener("click", function () {
                                                                                                        refreshPage();
                                                                                                        step2();
                                                                                                        /*console.log('teste kk');
                                                                                                        //peut etre lancer l'AR sans perso car pas de sens
                                                                                                        ARBerger(container);
                                                                                                        addOverlay('audioPlayer');
                                                                                                        addTxtNarrationAR("E2Narra",txtNarr,'dialogBox');
                                                                                                        ajouterBouton('diagBox', '', btnNext, 'btnInv');
                                                                                                        
                                                                                                        document.getElementById(btnNext).addEventListener("click", function(){
                                                                                                            refreshPage();
                                                                                                            ARBerger(container);
                                                                                                            addOverlay('audioPlayer');
                                                                                                            addNamePersoAR("E2Berger",name,"nameCharacter");
                                                                                                            addTxtNarrationAR("E2Berger",txtNarr,'dialogBox');                                                                                                                                                                                                               
                                                                                                        })*/

                                                                                                    });

                                                                                                });
                                                                                            });
                                                                                        });

                                                                                    });
                                                                                    //----------------------ETAPE 2 CHOIX 2
                                                                                    document.getElementById(btnChoix2).addEventListener("click", function () {
                                                                                            step2();
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });

                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });



                            });


                        });
                    });
                });
            });
        });
    });
});
