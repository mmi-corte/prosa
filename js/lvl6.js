import { refreshPage } from "./refreshPage.js";
import { addBtnImg, addInvisibleBtn, ajouterBouton } from "./button.js";

import { addForm } from "./form.js";
import { addImgBackground, addImg } from "./fonctionImg.js";
import {
  addTxt,
  addTxtWithBoldWord,
  addTxtNarration,
  addNameCharacter,
  addDiv,
  handleFormSubmit,
  addTxtNarrationAR,
  addNamePersoAR,
} from "./texte.js";
import { warningSvg } from "../assets/svgcode.js";
import { showStaticMap } from "./map.js";
import { loadSound, suspendSound } from "./Sound/sound.js";
import { lunchFight } from "./fight.js";
//import { AREsterelle, ARAfata, ARBerger } from './js/ARFunction.js';
import {
  changeStyleBG,
  skin,
  selectAvatar,
  selectButton,
  changeStyleBGB,
} from "./functionChangeStyle.js";
import { addOverlay } from "./overlay.js";
import { addAutoPlayVideo } from "./video.js";
import { step2, step6 } from "./functionstep.js";
import { ARBerger } from "./ARFunction.js";
import { popup } from "./popup.js";

export function loadLvl6() {
  refreshPage();
  console.log("loadLvl6 :  je suis là");

  if (Farfadet) {
    const steps = [
      {
        background: "assets/bg/fondEtape6.mp4",
        narration: "E6NarraFarfaT",
        character: null,
      },
    ];
    playSteps(steps,0, false, null); // Démarrage des étapes

    if (Orcu) {
      const steps = [
        {
          background: "assets/bg/fondEtape6.mp4",
          narration: "E6BergerOrcuT",
          character: "assets/personnages/Berger/berger.png",
          name: "E6Berger",
        },
      ];
      playSteps(steps,0, false, null); // Démarrage des étapes

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

      playSteps(steps, 0, false, null); // Démarrage des étapes
    } else {
      //else not see Orcu
      const steps = [
        {
          background: "assets/bg/fondEtape6.mp4",
          narration: "E6BergerOrcuF",
          character: "assets/personnages/Berger/berger.png",
          name: "E6Berger",
        },
        {
          background: "assets/bg/fondEtape6.mp4",
          narration: "E6NarraOrcuF",
          character: null,
          choices: [
            { text: "E3Choix1", action: loadLvl6bis },
            { text: "E3Choix2", action: loadLvl9 },
          ],
        },
      ];
      playSteps(steps, 0, false, null); // Démarrage des étapes
    }
  } else {
    //else farfafet
    const steps = [
      {
        background: "assets/bg/fondEtape6.mp4",
        narration: "E6NarraFarfaF",
        character: null,
      },
    ];
    playSteps(steps, 0, false, null ) ; // Démarrage des étapes
  }
  
  localStorage.setItem("level", "6");

}
