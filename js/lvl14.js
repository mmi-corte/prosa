import { refreshPage } from "./refreshPage.js";
import { addBtnImg, addInvisibleBtn, ajouterBouton } from './button.js';

import { addForm } from './form.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './texte.js';
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
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl15 } from "./lvl15.js";



export function loadLvl14() {

    refreshPage();
    console.log("loadLvl14 :  je suis là");
    
    
    const steps = [
        { character: "NaraChara", Txt: "E14Narra" },
    ];
    // Lance les étapes
    playSteps(steps, 0, true, 4);

    if (incantation) {
        const steps = [
            { character: "NaraChara", Txt: "E14NarraSpellST" },
            { character: "NaraChara", Txt: "E14NarraSpellST2" },
        ];
        playSteps(steps, 0, true, 4);
    } else {
        const steps = [
            { character: "NaraChara", Txt: "E14NarraSpellSF" },
        ];
        playSteps(steps, 0, true, 4);
    }

    const steps2 = [
        { character: "BergerChara", Txt: "E14Berger", nextLvl : loadLvl15 }
    ];
    playSteps(steps2, 0 , true, 4);
    localStorage.setItem("level", "14");
}