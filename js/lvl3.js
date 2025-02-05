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
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra", character: null , sound: 'asset/sound/narration/narrateur-E3/narrateurE3-001.mp3' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger", character: 'assets/personnages/Berger/berger.png', name: 'E3Berger' , sound: 'asset/sound/narration/Berger-E3/Berger-E3-001mp3' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra2", character: null , sound: 'asset/sound/narration/narrateur-E3/narrateurE3-002.mp3'},
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger2", character: 'assets/personnages/Berger/berger.png', name: 'E3Berger1' , sound: 'asset/sound/narration/Berger-E3/Berger-E3-002mp3' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra3", character: null , sound: 'asset/sound/narration/narrateur-E3/narrateurE3-003.mp3'},
        { background: 'assets/bg/fondEtape3.png', narration: "E3Overlay", character: null, action: addOverlay },// Appel de la fonction overlay ici
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger3", character: 'assets/personnages/Berger/berger.png', name: 'E3Berger6' , sound: 'asset/sound/narration/Berger-E3/Berger-E3-003mp3',
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