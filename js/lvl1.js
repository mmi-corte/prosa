import { refreshPage } from "./refreshPage.js";
import { addBtnImg, addInvisibleBtn, ajouterBouton } from './button.js';

import { addForm } from './form.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './texte.js';
import { addSVG } from './svg.js';
import { warningSvg } from '../assets/svgcode.js';
import { showStaticMap } from './map.js';
import { loadSound, suspendSound } from './Sound/sound.js';
import { lunchFight } from './fight.js';
//import { AREsterelle, ARAfata, ARBerger } from './js/ARFunction.js';
import { changeStyleBG, skin, selectAvatar, selectButton, changeStyleBGB } from './functionChangeStyle.js';
import { addOverlay } from './overlay.js';
import { addAutoPlayVideo } from './video.js';
import { step2, step6 } from './functionstep.js'
import { ARBerger } from './ARFunction.js';
import { popup } from './popup.js';
import { loadLvl2 } from "./lvl2.js";
import { loadLvl3 } from "./lvl3.js";




export function loadLvl1() {

    refreshPage();
    console.log("loadLvl1 :  je suis là");
    addImgBackground("container", 'assets/bg/fondEtape1.jpg');
    addDiv('container', "diagBox", 'diagBoxN');
    addTxtNarration("E1Narra", 'diagBox', 'dialogBox');
    ajouterBouton('diagBox', '', 'btnNext', 'btnInv');


    document.getElementById("btnNext").addEventListener("click", function () {
        refreshPage();
        addImgBackground("container", 'assets/bg/fondEtape1.jpg');
        addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
        addDiv('container', "diagBox", 'diagBox');
        addNameCharacter('E1Berger', 'diagBox', 'nameCharacter');
        addTxtNarration("E1Berger", 'diagBox', 'dialogBox');

        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
        document.getElementById("btnNext").addEventListener("click", function () {
            refreshPage();
            addImgBackground("container", 'assets/bg/fondEtape1.jpg');
            addDiv('container', "diagBox", 'diagBoxN');
            addTxtNarration("E1Narra1", 'diagBox', 'dialogBox');

            ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

            document.getElementById("btnNext").addEventListener("click", function () {
                refreshPage();
                addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                addDiv('container', "diagBox", 'diagBox');
                addNameCharacter('E1Berger1', 'diagBox', 'nameCharacter');
                addTxtNarration("E1Berger1", 'diagBox', 'dialogBox');

                ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                document.getElementById("btnNext").addEventListener("click", function () {
                    refreshPage();
                    addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                    addDiv('container', "diagBox", 'diagBoxN');
                    addTxtNarration("E1Narra2", 'diagBox', 'dialogBox');

                    ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                    document.getElementById("btnNext").addEventListener("click", function () {
                        refreshPage();
                        addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                        addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                        addDiv('container', "diagBox", 'diagBox');
                        addNameCharacter('E1Berger2', 'diagBox', 'nameCharacter');
                        addTxtNarration("E1Berger2", 'diagBox', 'dialogBox');

                        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                        document.getElementById("btnNext").addEventListener("click", function () {
                            refreshPage();
                            addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                            addDiv('container', "diagBox", 'diagBoxN');
                            addTxtNarration("E1Narra3", 'diagBox', 'dialogBox');
                            

                            ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                            document.getElementById("btnNext").addEventListener("click", function () {
                                refreshPage();
                                addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                addDiv('container', "diagBox", 'diagBox');
                                addNameCharacter('E1Berger3', 'diagBox', 'nameCharacter');
                                addTxtNarration("E1Berger3", 'diagBox', 'dialogBox');

                                ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                                document.getElementById("btnNext").addEventListener("click", function () {
                                    refreshPage();
                                    addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                    addDiv('container', "diagBox", 'diagBoxN');
                                    addTxtNarration("E1Narra4", 'diagBox', 'dialogBox');

                                    ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
                                    document.getElementById("btnNext").addEventListener("click", function () {
                                        refreshPage();
                                        addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                        addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                        addDiv('container', "diagBox", 'diagBox');
                                        addNameCharacter('E1Berger4', 'diagBox', 'nameCharacter');
                                        addTxtNarration("E1Berger4", 'diagBox', 'dialogBox');

                                        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
                                        document.getElementById("btnNext").addEventListener("click", function () {
                                            refreshPage();
                                            addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                            addDiv('container', "diagBox", 'diagBoxN');
                                            addTxtNarration("E1Narra5", 'diagBox', 'dialogBox');

                                            ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                                            document.getElementById("btnNext").addEventListener("click", function () {
                                                refreshPage();
                                                addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                                addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                addDiv('container', "diagBox", 'diagBox');
                                                addNameCharacter('E1Berger5', 'diagBox', 'nameCharacter');
                                                addTxtNarration("E1Berger5", 'diagBox', 'dialogBox');

                                                ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                                                document.getElementById("btnNext").addEventListener("click", function () {
                                                    refreshPage();
                                                    addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                                    addDiv('container', "diagBox", 'diagBoxN');
                                                    addTxtNarration("E1Narra6", 'diagBox', 'dialogBox');
                                                   

                                                    ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
                                                    document.getElementById("btnNext").addEventListener("click", function () {
                                                        refreshPage();
                                                        addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                                        addImg("container", 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
                                                        addDiv('container', "diagBox", 'diagBox');
                                                        addNameCharacter('E1Berger6', 'diagBox', 'nameCharacter');
                                                        addTxtNarration("E1Berger6", 'diagBox', 'dialogBox');

                                                        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                                                        document.getElementById("btnNext").addEventListener("click", function () {
                                                            refreshPage();
                                                            addImgBackground("container", 'assets/bg/fondEtape1.jpg');
                                                            addDiv('container', "diagBox", 'diagBoxN');
                                                            addTxtNarration("E1Narra7", 'diagBox', 'dialogBox');


                                                            ajouterBouton('diagBox', '', "btnChoix1", 'btnChoix choix1');
                                                            addTxtNarration("E1Choix1", "btnChoix1", "");
                                                            ajouterBouton('diagBox', '', "btnChoix2", 'btnChoix choix2');
                                                            addTxtNarration("E1Choix2", "btnChoix2", "");

                                                            document.getElementById("btnChoix1").addEventListener("click", function () {
                                                                loadLvl2();
                                                            });
                                                            document.getElementById("btnChoix2").addEventListener("click", function () {
                                                                loadLvl3();
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

    setCookie("level", "1", 7, "/");
}