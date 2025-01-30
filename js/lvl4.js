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
import { playSteps } from "./functionMakeSteps.js";

const steps =[
    {character : "NarraChara", Txt : "E2Narra", name : "Narrateur"},
    {character : "BergerChara", Txt : "E2Berger", name : "Berger"},
    {character : "NarraChara", Txt : "E2Narra2", name : "Narrateur"},
    {character : "FataChara", Txt : "E2Fata", name : "A Fata"},
    {character : "EsterelleChara", Txt : "E2Esterelle",name : "Esterelle"},
    {character : "NarraChara", Txt : "E2Narra3", name : "Narrateur"},
    {character : "EsterelleChara", Txt : "E2Esterelle2", name : "Esterelle"},
    {character : "FataChara", Txt : "E2Fata2", name : "A Fata"},
    {character : "EsterelleChara", Txt : "E2Esterelle3", name : "Esterelle"},
    {character : "FataChara", Txt : "E2Fata3", name : "A Fata"},
    {character : "NarraChara", Txt : "E2Narra4",name : "Narrateur"},
    {character : "FataChara", Txt : "E2Fata4", name : "A Fata"},
    {character : "EsterelleChara", Txt : "E2Esterelle4", name : "Esterelle"},
    {character : "FataChara", Txt : "E2Fata5", name : "A Fata"},
    {character : "NarraChara", Txt : "E2Narra5",name : "Narrateur"},
    {character : "EsterelleChara", Txt : "E2Esterelle5", name : "Esterelle"},
    {character : "FataChara", Txt : "E2Fata6",name : "A Fata"},
    {character : "NarraChara", Txt : "E2Narra6", name : "Narrateur"},
    {character : "BergerChara", Txt : "E2Berger2", name : "Berger"},
]



export function loadLvl4() {

    refreshPage();
    console.log("loadLvl4 :  je suis là");

    playSteps(steps, 0, true, 4);
    
    // update screen cookie
    setCookie("level", "4", 7, "/"); 
}