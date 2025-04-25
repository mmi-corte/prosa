
import { nextScreen } from './navigation.js';
import { log } from './trace.js';
import { path_backgrounds, path_narration } from './paths.js';
import { enemies, lunchFight } from "./fight.js";
import { playSteps } from './functionMakeSteps.js';
import { refreshPage } from './refreshPage.js';

export function loadLvl13() {

    //Trace the level
    log("Enter in L13", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "13");
    
    //faire combat
    let weapons = [
        {
            name: "Grimoire",
            damage: 10,
        },
    ];

    //test fight
    async function luncher() {
        refreshPage();
        // Fight with cerf
        const fightResult = await lunchFight(weapons, enemies[0]);
        log(fightResult);

        const steps = [
                {   background: path_backgrounds+'fondEtape13.mp4', 
                    narration: "E13Narra2",
                    sound: path_narration+'Narrateur-E13/narrateurE13-002.mp3', 
                    character: null , 
                    nextLvl: () => {nextScreen("5", "14"); window.location.reload(false);}},
        ];

        refreshPage();
        playSteps(steps, 0, false, 2);
    }
    
    // Steps for the level
    const steps = [
        { background: path_backgrounds+'fondEtape13.png', narration: "E13Narra", character: null , sound: path_narration+'Narrateur-E13/narrateurE13-001.mp3',
            choices: [
                { text: "E11Fight", action: () => {luncher();} }
              ] 
        },
    ];

    refreshPage();

    playSteps(steps, 0, false, 2); 
   
}