import { skin } from "./functionChangeStyle.js";
import {path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { enemies, lunchFight } from "./fight.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl6() {

  // Set the level in localStorage
  log("Enter in L1", "blue");

  // Set the level in localStorage
  localStorage.setItem("level", "6");

  if (Farfadet) {
    const steps = [
      {
        background: path_backgrounds + "fondEtape6.mp4",
        narration: "E6NarraFarfaT",
        character: null,
      },
    ];

    playSteps(steps); // Démarrage des étapes

    if (Orcu) {
      const steps = [
        {
          background: path_backgrounds + "fondEtape6.png",
          narration: "E6BergerOrcuT",
          character: path_personnages+"Berger/berger.png",
          name: "E6Berger",
        },
      ];
      playSteps(steps); // Démarrage des étapes

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

      playSteps(steps); // Démarrage des étapes

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
            { text: "E3Choix1", action: nextScreen("5", "6bis") },
            { text: "E3Choix2", action: nextScreen("5", "9") },
          ],
        },
      ];
      playSteps(steps); // Démarrage des étapes
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
    playSteps(steps) ; // Démarrage des étapes
  }
  
}
