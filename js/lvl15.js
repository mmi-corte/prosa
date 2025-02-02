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



export function loadLvl15() {

    refreshPage();
    console.log("loadLvl15 :  je suis là");
    
    const steps = [
        { character: "NaraChara", Txt: "E15Narra" }
    ]

    refreshPage();
    // Lance les étapes
    playSteps(steps, 0, true, 4);

    if (Colectible) {
        const steps = [
            { character: "BergerChara", Txt: "E15BergerCollec2T", name: "E2Berger2" },
            { character: "NaraChara", Txt: "E15NarraCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T", popup: "E15MessCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T2" },
        ];
        playSteps(steps, 0, true, 4);
        let weapons = [
            {
                name: "Epée",
                damage: 10,
            },
        ];

        //test fight
        async function luncher() {
            const fightResult = await lunchFight(skin, weapons, enemies[2]);
            console.log(fightResult);
        }
        luncher();
        // voir comment on passe a letape d'apres ??? 

    }

    localStorage.setItem("level", "15");

}