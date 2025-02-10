import { skin } from "./functionChangeStyle.js";
import { path_personnages, path_backgrounds, path_narration} from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { enemies, lunchFight } from "./fight.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { refreshPage } from "./refreshPage.js";

export function loadLvl6() {

  // Set the level in localStorage
  log("Enter in L6", "blue");

  // Set the level in localStorage
  localStorage.setItem("level", "6");

  if (localStorage.getItem("vue_fulettu")) {

    const steps = [
      {
        background: path_backgrounds+"fondEtape6.mp4",
        narration: "E6NarraFarfaT",
        character: null,
       sound: path_narration+'Narrateur-E6/narrateurE6-001.mp3',
       choices: [
          { text: "E6Choix1", action: () => {nextScreen("5", "6bis");} },
          { text: "E6Choix2", action: () => {nextScreen("5", "7");} }
        ]
      },
    ];

  } else {

    if (localStorage.getItem('vue_orcu')) {
      steps = steps.concat([
        {
          background: path_backgrounds+"fondEtape6.png",
          narration: "E6BergerOrcuT",
          character: path_personnages+"Berger/berger.png",
          name: "E6Berger",
        },
      ]);

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

      localStorage.setItem('fight_lion', true);

    // } else {
    //   //else not see Orcu
    //   steps = steps.concat([
    //     {
    //       background: path_backgrounds + "fondEtape6.png",
    //       narration: "E6BergerOrcuF",
    //       character: path_personnages+"Berger/berger.png",
    //       name: "E6Berger",
    //     },
    //     {
    //       background: path_backgrounds + "fondEtape6.png",
    //       narration: "E6NarraOrcuF",
    //       character: null,
    //       choices: [
    //         { text: "E3Choix1", action: nextScreen("5", "6bis") },
    //         { text: "E3Choix2", action: nextScreen("5", "9") },
    //       ],
    //     },
    //   ]);

    }

    //else farfafet
    const steps = [
      {
        background: path_backgrounds + "fondEtape6.png",
        narration: "E6NarraFarfaF",
        character: null,
        sound: path_narration+'Narrateur-E6/narrateurE6-002.mp3',
        choices: [
          { text: "E6Choix1", action: () => {nextScreen("5", "7");} },
          { text: "E6Choix2", action: () => {nextScreen("5", "10");} }
      ]
      },
    ];
  }

  refreshPage();

  playSteps(steps, 0 , true, 2) ; // Démarrage des étapes
  
}
