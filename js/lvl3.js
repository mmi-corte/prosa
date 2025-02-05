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
import { loadLvl4} from './lvl4.js';
import { loadLvl10 } from './lvl10.js';
import { playSteps } from './functionMakeSteps.js';

export function loadLvl3() {

    // Liste des étapes du niveau 1
    const steps = [
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra", character: null },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger", character: 'assets/personnages/berger.png', name: 'E3Berger' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra2", character: null },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger2", character: 'assets/personnages/berger.png', name: 'E3Berger1' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Overlay", character: null, action: addOverlay },// Appel de la fonction overlay ici
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger3", character: 'assets/personnages/berger.png', name: 'E3Berger6',
            choices: [
                { text: "E3Choix1", action: loadLvl4 },
                { text: "E3Choix2", action: loadLvl10 }
            ]
        }
    ];

    refreshPage();

    playSteps(steps); // Démarrage des étapes
 
    localStorage.setItem("level", "3"); 
}