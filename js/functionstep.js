import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './texte.js';
import { refreshPage } from './refreshPage.js';
import { addOverlay } from './overlay.js';
import { ajouterBouton } from './button.js';
import { AREsterelle,ARBerger, ARAfata, ARBerger } from './ARFunction.js';

//var container
const container = 'container';
const btnNext = 'btnInvNext';
const btnChoix1 = 'btnChoix1';
const btnChoix2 = 'btnChoix2';
const txtNarr = 'narrationText';
const name = 'PersoTxt';

export function step2() {
    refreshPage();

    ARBerger(container)

    addTxtNarrationAR("E2Narra", txtNarr, "");
    addNamePersoAR("E2Narra", Narra, "");

    ajouterBouton('container', '', txtNarr, 'btnChoix choix2');

    document.getElementById(txtNarr).addEventListener("click", function () {
        refreshPage();
        ARBerger(container)
        addTxtNarrationAR("E2Berger", txtNarr, "");
        addNamePersoAR("E2Berger", Berger, "");
    })
}