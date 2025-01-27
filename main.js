import { addBtnImg, addInvisibleBtn, ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground, addImg } from './js/fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './js/texte.js';
import { addSVG } from './js/svg.js';
import { warningSvg } from './assets/svgcode.js';
import { showStaticMap } from './js/map.js';
import { loadSound, suspendSound } from './js/Sound/sound.js';
import { lunchFight } from './js/fight.js';
//import { AREsterelle, ARAfata, ARBerger } from './js/ARFunction.js';
import { changeStyleBG, skin, selectAvatar, selectButton, changeStyleBGB } from './js/functionChangeStyle.js';
import { addAutoPlayVideo } from './js/video.js';
import { addOverlay } from './js/overslay.js';
import { step2, step6 } from './js/functionstep.js'
import { ARBerger } from './js/ARFunction.js';
import { popup } from './js/popup.js';

import {getCookie, getCookieValue, isCookiePresent} from './js/cookieHandler.js';

import { loadScreen0, loadScreen1 } from './js/screen.js';

//Variable / Constante pour les combats
export let playerUserName = "";

let weapons = [
    {
        name: "Epée",
        damage: 10
    },
    {
        name: "Grimoire",
        damage: 15
    },
    {
        name: "Arc",
        damage: 20
    }
]

const enemies = [
    {
        name: "Cerf",
        hp: 50,
        damage: 10
    },
    {
        name: "Sylvain",
        hp: 80,
        damage: 15
    },
    {
        name: "Basgialiscu",
        hp: 100,
        damage: 20
    },
    {
        name: "Tarasque",
        hp: 100,
        damage: 20
    }
]

let levelValue = 0;

// Resey Home btn
const body = document.querySelector("body");
body.id = "body";
addImg("body", "assets/icons/home.png", "homeStyle", 'resetGame')

resetGame.addEventListener("click", 
    ()=>{
        if (levelValue != 0){
            loadScreen0();
        };
        
    }
);

//---------------------------------------------
// logic du jeu
//---------------------------------------------

if (isCookiePresent('screen')) {
    // Récupérer la valeur de "level"
    levelValue = getCookieValue('screen');

    console.log(`Le cookie 'screen' est présent avec la valeur level à : ${levelValue}`);

  
    switch (levelValue) {
        case "1":
            loadScreen1();
            break;
            
        default:
            loadScreen0();       
    }

} else {
    console.log('Le cookie "screen" n\'est pas présent');

    // Créer un cookie
    document.cookie = "screen=0; level=0; path=/;";
    loadScreen0(); 
}