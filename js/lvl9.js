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



export function loadLvl9() {

   // Liste des étapes du niveau 1
   const steps = [
    { background: 'assets/bg/fondEtape9.png', narration: "E9Narra", character: null },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Berger", character: 'assets/personnages/berger V1 premier plan.png', name: 'E3Berger' },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Narra2", character: null },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Berger2", character: 'assets/personnages/berger V1 premier plan.png', name: 'E3Berger1' },
    { background: 'assets/bg/fondEtape9.png', choices: [ { text: "E9Mess", action: loadLvl10 } ], character: null , },
];

playSteps(steps); // Démarrage des étapes

localStorage.setItem("level", "9");
    
}