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
import { loadLvl3 } from "./lvl3.js";



export function loadLvl2() {

    refreshPage();
    console.log("loadLvl2 :  je suis là");
    addImgBackground("container", 'assets/bg/fondEtape1bis.png');
    addDiv('container', "diagBox", 'diagBoxN');
    addTxtNarration("E1BNarra", 'diagBox', 'dialogBox');

    ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

    document.getElementById("btnNext").addEventListener("click", function () {
        refreshPage();
        addImgBackground("container", 'assets/bg/fondEtape1bis.png');
        addImg('container', 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
        addDiv('container', "diagBox", 'diagBox');
        addNameCharacter('E1BBerger', 'diagBox', 'nameCharacter');
        addTxtNarration("E1BBerger", 'diagBox', 'dialogBox');

        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

        document.getElementById("btnNext").addEventListener("click", function () {
            refreshPage();
            addImgBackground("container", 'assets/bg/fondEtape1bis.png');
            addDiv('container', "diagBox", 'diagBoxN');
            addTxtNarration("E1BNarra2", 'diagBox', 'dialogBox');

            ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

            document.getElementById("btnNext").addEventListener("click", function () {
                refreshPage();
                addImgBackground("container", 'assets/bg/fondEtape1bis.png');
                addDiv('container', "diagBox", 'diagBoxN');
                addTxtNarration("E1BNarra2", 'diagBox', 'dialogBox');
                changeStyleBG('container');
                popup("Vous avez récupéré la branche d’arbre", "../assets/items/branche.png");

                ajouterBouton('diagBox', '', 'btnNext', 'btnInv');

                document.getElementById("btnNext").addEventListener("click", function () {
                    loadLvl3();
                });
            });
        });
    });
}