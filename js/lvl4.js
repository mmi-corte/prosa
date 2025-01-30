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




export function loadLvl4() {

    const steps1 =[
        {character : "NarraChara", Txt : "E4Narra", name : "Narrateur"},
        {character : "BergerChara", Txt : "E4Berger", name : "Berger"},
        {character : "NarraChara", Txt : "E4Narra2", name : "Narrateur"},
        {character : "FulettuChara", Txt : "E4Fulettu", name : "Fulettu"},
        {character : "FuletounChara", Txt : "E4Fuletoun",name : "Fuletoun"},
        {character : "FulettuChara", Txt : "E4Fulettu2", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun2",name : "Fuletoun"},
        {character : "NarraChara", Txt : "E4Narra3",name : "Narrateur"},
        {character : "FulettuChara", Txt : "E4Fulettu3", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun3",name : "Fuletoun"},
        {character : "NarraChara", Txt : "E4Narra4",name : "Narrateur"},
        {character : "FulettuChara", Txt : "E4Fulettu4", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun4",name : "Fuletoun"},
        {character : "FulettuChara", Txt : "E4Fulettu5", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun5",name : "Fuletoun", nextlvl : '6'},
        {character:  "FulettuChara", Txt:"E4FulettuEC", name : "Fulettu",
            choices: [
                { text: "E4EnigmeC1", },
                { text: "E4EnigmeC2", },
            ]
        },
            {character:  "FulettuChara", Txt:"E4FulettuEC", name : "Fulettu",
                choices: [
                    { text: "E4EnigmeT1" },
                    { text: "E4EnigmeT2" },
                    { text: "E4EnigmeT3" },
                ]

        }
    ]

        //playSteps();

    if(step.choices.answear1||step.choices.answear2){
        const steps2 =[
            {character : "FulettuChara", Txt : "E4FulettuTrue", name : "Fulettu"},
            {character : "FuletounChara", Txt : "E4FouletounTrue", name : "Fuletoun"},
            {character : "FulettuChara", Txt : "E4FouletounTrue2", name : "Fuletoun"},
            {character : "NarraChara", Txt : "E4NarrateurTrue", name : "Narrateur"},
        ]
        //playSteps();

        const steps3 =[
            {character : "FulettuChara", Txt : "E4FulettuFalse", name : "Fulettu"},
            {character : "FuletounChara", Txt : "E4FouletounFalse", name : "Fuletoun"},
            {character : "FulettuChara", Txt : "E4FulettuFalse2", name : "Fulettu"},
            {character : "FuletounChara", Txt : "E4FouletounFalse2", name : "Fuletoun"},
            {character : "FulettuChara", Txt : "E4FulettuFalse3", name : "Fulettu"},
            {character : "FuletounChara", Txt : "E4FouletounFalse3", name : "Fuletoun"},
            {character : "FulettuChara", Txt : "E4FulettuFalse4", name : "Fulettu"},
        ]
    }
    
    

    refreshPage();
    console.log("loadLvl4 :  je suis là");

    playSteps(steps, 0, true, 4);
    
    // update screen cookie
    setCookie("level", "4", 7, "/"); 
}