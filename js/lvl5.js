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


export function loadLvl5() {
  
    const steps =[
        {character : "NarraChara", Txt : "E5Narra"},
        {character : "BergerChara", Txt : "E5Berger", name : "E5Berger"},
        {character : "NarraChara", Txt : "E5Narra2"},
        {character : "MascoChara", Txt : "E5Masco", name : "E5Masco"},
        {character : "NarraChara", Txt : "E5Narra3"},
        {character : "MascoChara", Txt : "E5Masco2", name : "E5Masco2"},
        {character : "NarraChara", Txt : "E5Narra4", name : "E5Narra4"},
        {character : "MascoChara", Txt : "E5Masco3", name : "E5Masco3"},
        {character : "NarraChara", Txt : "E5Narra5"},
        {character : "MascoChara", Txt : "E5Masco4", name : "E5Masco4"},
        {character : "NarraChara", Txt : "E5Narra6"},
        {character : "BergerChara", Txt : "E5Berger4", name : "E5Berger4"},
        {character : "NarraChara", Txt : "E5Narra7"},
        
    ]

    refreshPage();
    
    console.log("loadLvl5 :  je suis là");
    
    playSteps(steps);

    localStorage.setItem("level", "5");
}