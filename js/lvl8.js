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



export function loadLvl8() {

    const steps =[
        {character : "NarraChara", Txt : "E6Narra", name : "Narrateur"},
    ]
        if (Ruse) { 
            const steps = [
                { character : "NarraChara", Txt : "E8NarraRuseT", name : "Narrateur" },
                { character : "MessChara", popup : "E8Mess" },
                { character : "NarraChara", Txt : "E8NarraRuseT2", name : "Narrateur" },
                { character : "BergerChara", Txt : "E8BergerRuseT", name : "Berger" },
                { character : "NarraChara", Txt : "E8NarraRuseT3", name : "Narrateur" },
                { character : "BergerChara", Txt : "E8BergerRuseT2", name : "Berger" },
                { character : "NarraChara", Txt : "E8NarraRuseT4", name : "Narrateur" },
                { character : "BergerChara", Txt : "E8BergerRuseT3", name : "Berger" },
                { character : "NarraChara", Txt : "E8NarraRuseT5", name : "Narrateur" },
               
            ];
            playSteps(steps); // Démarrage des étapes

            //mettre code pour étape suivante 
        }
       
        if (lion) { 
            const steps = [
                { character : "NarraChara", Txt : "E8NarraLeoT", name : "Narrateur" },
                { character : "StregaChara", Txt : "E8StregaLeoT", name : "Strega" },
                { character : "NarraChara", Txt : "E8NarraLeoT2", name : "Narrateur" },
                { character : "StregaChara", Txt : "E8StregaT2", name : "Strega" },
                { character : "NarraChara", Txt : "E8NarraLeoT3", name : "Narrateur" },
                { character : "MessChara", popup : "E8MessLeoT" },
                { character : "NarraChara", Txt : "E8NarraLeoT4", name : "Narrateur" },
                { character : "StregaChara", Txt : "E8StregaLeoT3", name : "Strega" },
                { character : "NarraChara", Txt : "E8NarraLeoT5", name : "Narrateur" },
                { character : "BergerChara", Txt : "E8BergerLeoT", name : "Berger" },
                { character : "NarraChara", Txt : "E8NarraLeoT6", name : "Narrateur" },
            ];
            playSteps(steps); // Démarrage des étapes

            //mettre code pour étape suivante 
        }  


    refreshPage();
    console.log("loadLvl8 :  je suis là");
    
}