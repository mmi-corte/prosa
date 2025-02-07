
import { lunchFight } from './fight.js';
import { skin } from './functionChangeStyle.js';
import { loadLvl14 } from "./lvl14.js";

export function loadLvl13() {

    const steps = [
        { background: 'assets/bg/fondEtape13.mp4', narration: "E13Narra", character: null },
    ];
    playSteps(steps, 0, false, 4);
    //faire combat
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
    const steps2 = [
        { background: 'assets/bg/fondEtape13.mp4', narration: "E13Narra2", character: null , nextLvl: loadLvl14},
    ];
    playSteps(steps, 0, false, 4); 
   

    
    localStorage.setItem("level", "13");
    
}