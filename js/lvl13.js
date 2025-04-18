
import { nextScreen } from './navigation.js';
import { log } from './trace.js';
import { path_backgrounds, path_narration } from './paths.js';
import { enemies, lunchFight } from "./fight.js";

export function loadLvl13() {

    //Trace the level
    log("Enter in L13", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "13");

    // Steps for the level
    const steps = [
        { background: path_backgrounds+'fondEtape13.mp4', narration: "E13Narra", character: null , sound: path_narration+'Narrateur-E13/narrateurE13-001.mp3'},
    ];

    playSteps(steps, 0, false, 4);
    
    //faire combat
    let weapons = [
        {
            name: "Grimoire",
            damage: 10,
        },
    ];

    //test fight
    async function luncher() {
        const fightResult = await lunchFight(skin, weapons, enemies[2]);
        console.log(fightResult);
    }
    
    luncher();
    
    const steps2 = [
        { background: path_backgrounds+'fondEtape13.mp4', narration: "E13Narra2",sound: path_narration+'Narrateur-E13/narrateurE13-002.mp3', character: null , nextLvl: () => {nextScreen("5","14");}},
    ];
    playSteps(steps, 0, false, 2); 
   
}