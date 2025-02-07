import { refreshPage } from "./refreshPage.js";
import { lunchFight } from "./fight.js";
import { skin } from "./functionChangeStyle.js";
import {path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl6() {
  refreshPage();
  console.log("loadLvl6 :  je suis là");

  if (Farfadet) {
    const steps = [
      {
        background: path_backgrounds + "fondEtape6.mp4",
        narration: "E6NarraFarfaT",
        character: null,
      },
    ];
    playSteps(steps,0, false, null); // Démarrage des étapes

    if (Orcu) {
      const steps = [
        {
          background: path_backgrounds + "fondEtape6.png",
          narration: "E6BergerOrcuT",
          character: path_personnages+"Berger/berger.png",
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
          background: path_backgrounds + "fondEtape6.png",
          narration: "E6BergerOrcuF",
          character: path_personnages+"Berger/berger.png",
          name: "E6Berger",
        },
        {
          background: path_backgrounds + "fondEtape6.png",
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
        background: path_backgrounds + "fondEtape6.png",
        narration: "E6NarraFarfaF",
        character: null,
      },
    ];
    playSteps(steps, 0, false, null ) ; // Démarrage des étapes
  }
  
  localStorage.setItem("level", "6");

}
