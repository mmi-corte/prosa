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

  const vue_orcu = localStorage.getItem('vue_orcu') == 'true';
  const vue_fulettu = localStorage.getItem('vue_fulettu') == 'true';

  var steps;

  if (vue_fulettu) {

    steps = [{  background: path_backgrounds+"fondEtape6.mp4",
                narration: "E6NarraFarfaT",
                character: null,
                sound: path_narration+'Narrateur-E6/narrateurE6-001.mp3'
            }];
  
  } else {

    steps = [{  background: path_backgrounds+"fondEtape6.mp4",
                narration: "E6NarraFarfaF",
                character: null,
                sound: path_narration+'Narrateur-E6/narrateurE6-002.mp3'
            }];
  }
  
  
  if (vue_orcu) {

    let weapons = [
      {
        name: "Epée",
        damage: 10,
      },
    ];
  
    //test fight
    async function luncher() {
      refreshPage();
      const fightResult = await lunchFight(weapons, enemies[2]);
      
      log(fightResult, "green");

      if (fightResult=='loose') {
        localStorage.setItem('lion_vict', false);
      }else{
        localStorage.setItem('lion_vict', true);
      }

      const steps = [{  background: path_backgrounds+"fondEtape6.mp4",
        narration: "E6NarraOrcuT2",
        character: null,
        sound: path_narration+'Narrateur-E6/narrateurE6-005.mp3',
        nextLvl: () => { nextScreen("5", "8");}
      }];

      refreshPage();
      
      playSteps(steps);

    }

    steps = steps.concat([
      { background: path_backgrounds+"fondEtape6.png",
        narration: "E6BergerOrcuT",
        character: path_personnages+"Berger/berger.png",
        sound: path_narration+'Berger-E6/bergerE6-002.mp3',
        name: "E6BergerOrcuT",
         choices: [
            { text: "E11Fight", action: () => {luncher();} }
          ] 
        }
    ]);

    localStorage.setItem('fight_lion', true);
  
    refreshPage();
  
    playSteps(steps);

  } else {

    steps = steps.concat([
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

    localStorage.setItem('fight_lion', false);

    refreshPage();
  
    playSteps(steps);
  }
    
}
