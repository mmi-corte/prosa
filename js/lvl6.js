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

    var steps = [{  background: path_backgrounds+"fondEtape6.mp4",
                narration: "E6NarraFarfaT",
                character: null,
                sound: path_narration+'Narrateur-E6/narrateurE6-001.mp3'
            }];
  } else {

    var steps = [{  background: path_backgrounds+"fondEtape6.mp4",
                narration: "E6NarraFarfaF",
                character: null,
                sound: path_narration+'Narrateur-E6/narrateurE6-002.mp3'
            }];
  }
  
  // refreshPage();

  // playSteps(steps);

  if (localStorage.getItem('vue_orcu')) {

    let weapons = [
      {
        name: "Epée",
        damage: 10,
      },
    ];
  
    //test fight
    async function luncher() {
      const fightResult = await lunchFight(weapons, enemies[2]);
      console.log(fightResult);
    }

    var steps = steps.concat([
      { background: path_backgrounds+"fondEtape6.png",
        narration: "E6BergerOrcuT",
        character: path_personnages+"Berger/berger.png",
        sound: path_narration+'Berger-E6/bergerE6-002.mp3',
        name: "E6Berger",
         choices: [
            { text: "E11Fight", action: () => {luncher();} }
          ] 
        },
        {  background: path_backgrounds+"fondEtape6.mp4",
          narration: "E6NarraOrcuT2",
          character: null,
          sound: path_narration+'Narrateur-E6/narrateurE6-005.mp3',
          nextLvl: () => { nextScreen("5", "8"); window.location.reload(false);}
        }
    ]);

    localStorage.setItem('fight_lion', true);
  
  } else {

    var steps = steps.concat([
      { background: path_backgrounds+"fondEtape6.png",
        narration: "E6BergerOrcuF",
        character: path_personnages+"Berger/berger.png",
        sound: path_narration+'Berger-E6/bergerE6-001.mp3',
        name: "E6BergerOrcuF"
      },
      { background: path_backgrounds+"fondEtape6.mp4",
        narration: "E6NarraOrcuF",
        character: null,
        sound: path_narration+'Narrateur-E6/narrateurE6-003.mp3',
        choices: [
                  { text: "E6ChoixOrcuF1", action: () => {nextScreen("5", "6bis");} },
                  { text: "E6ChoixOrcuF2", action: () => {nextScreen("5", "7");} }
        ]
      }
    ]);
  }

  refreshPage();
  
  playSteps(steps);
    
}
