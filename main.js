import { addBtnImg, addInvisibleBtn, ajouterBouton } from './js/button.js';
import { refreshPage } from './js/refreshPage.js';
import { addForm } from './js/form.js';
import { addImgBackground, addImg } from './js/fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './js/texte.js';
import { addSVG } from './js/svg.js';
import { warningSvg } from './assets/svgcode.js';
import { showStaticMap } from './js/map.js';
import { loadSound, suspendSound, setOffSound,setOnSound } from './js/Sound/sound.js';
import { lunchFight } from './js/fight.js';
//import { AREsterelle, ARAfata, ARBerger } from './js/ARFunction.js';
import { changeStyleBG, skin, selectAvatar, selectButton, changeStyleBGB } from './js/functionChangeStyle.js';
import { addAutoPlayVideo } from './js/video.js';
import { addOverlay } from './js/overlay.js';
import { step2, step6 } from './js/functionstep.js'
import { ARBerger } from './js/ARFunction.js';
import { popup } from './js/popup.js';

import {setCookie, getCookieValue, isCookiePresent} from './js/cookieHandler.js';

import { loadScreen0 } from './js/screen0.js';
import { loadScreen1 } from './js/screen1.js';
import { loadScreen2 } from './js/screen2.js';
import { loadScreen5 } from './js/screen5.js';
import { loadScreen4 } from './js/screen4.js';
import { loadScreen3 } from './js/screen3.js';
import { loadLvl1 } from './js/lvl1.js';
import { loadLvl2 } from './js/lvl2.js';

//Variable / Constante pour les combats
export let playerUserName = "";

const DEBUG = true;



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
let screenValue = 0;


// addOverlay ('audioId' , 'audioSrc')

// Resey Home btn
if (DEBUG){
    const body = document.querySelector("body");
    body.id = "body";
    addImg("body", "assets/icons/home.png", "homeStyle", 'resetGame')

resetGame.addEventListener("click", 
    ()=>{
            refreshPage();
            loadScreen0();
            setCookie("level", "0", 7, "/");
    }
);
}


// Ajout du bouton pour activer/désactiver le son
const SoundBtn = document.createElement('div')
SoundBtn.id = 'SoundBtn';
document.body.appendChild(SoundBtn);
const SoundIcon = document.createElement('img')
SoundIcon.src="./assets/icons/SonActif.png";
SoundIcon.style.width = "50px";
SoundBtn.appendChild(SoundIcon);
SoundBtn.addEventListener('click', function(){
    if (SoundIcon.src.includes("SonActif")){
        SoundIcon.src = "./assets/icons/sonCoupe.png";
        setOffSound();
    } else {
        SoundIcon.src = "./assets/icons/SonActif.png";
        setOnSound();
    }
});

//---------------------------------------------
// logic du jeu
//---------------------------------------------

if (isCookiePresent('screen')) {
    // Récupérer la valeur de "level"
    screenValue = getCookieValue('screen');
    levelValue = getCookieValue('level');

    console.log(`Le cookie 'screen' est présent avec la valeur level à : ${screenValue}`);

    if(screenValue <= 5 && levelValue == 0){
        switch (screenValue) {
            case "1":
                loadScreen1();
                break;
            case "2":
                loadScreen2();
                break;
            case "3":
                loadScreen3();
                break;
            case "4":
                loadScreen4();
                break;
            case "5":
                loadScreen5();
                break;
                
            default:
                loadScreen0();       
        }
    }else{
        console.log(isCookiePresent('level'), levelValue);
        if(isCookiePresent('level')){
            switch (levelValue) {
                case "1":
                    loadLvl1();
                    break;
                case "2":
                    loadLvl2();
                    break;   
            }
        }
        
    }
    

} else {
    console.log('Le cookie "screen" n\'est pas présent');

    // Créer un cookie
    document.cookie = "screen=0; level=0; path=/;";
    loadScreen0(); 
}