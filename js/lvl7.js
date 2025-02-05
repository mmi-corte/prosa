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



export function loadLvl7() {

    // Liste des étapes du niveau 1
    const steps = [
        { background: 'assets/bg/fondEtape7.png', narration: "E7Narra", character: null },
        { background: 'assets/bg/fondEtape7.png', narration: "E7Narra", character: 'assets/personnages/Berger/berger.png', name: 'E6Berger' },
        { background: 'assets/bg/fondEtape7.png', narration: "E7Narra2", character: null },
        { background: 'assets/bg/fondEtape7.png', narration: "E7Berger2", character: 'assets/personnages/Berger/berger.png', name: 'E6Berger2',
            choices: [
                { text: "E6Choix1", action: loadLvl9 },
                { text: "E6Choix2", action: loadLvl10 }
            ]
        }
    ];

    playSteps(steps); // Démarrage des étapes
 
    localStorage.setItem("level", "7");
    
}