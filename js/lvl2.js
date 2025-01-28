import { refreshPage } from "./refreshPage.js";
import { ajouterBouton } from './button.js';

import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxtNarration, addNameCharacter, addDiv } from './texte.js';
//import { AREsterelle, ARAfata, ARBerger } from './js/ARFunction.js';
import { changeStyleBG } from './functionChangeStyle.js';
import { popup } from './popup.js';
import { loadLvl3 } from "./lvl3.js";
import { setCookie } from './cookieHandler.js';


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

    // update screen cookie
    setCookie("level", "2", 7, "/");
  
}