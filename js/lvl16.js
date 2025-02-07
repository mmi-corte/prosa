import { refreshPage } from "./refreshPage.js";
import { lunchFight } from './fight.js';
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";

export function loadLvl16() {

    log("Enter in L16", "blue");

    refreshPage();
       
    const steps = [

        { character: "NaraChara", Txt: "E16Narra" }
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

    // voir la fonction fight si on peut savoir si on endormie lenemie ou pas ??, 
    localStorage.setItem("level", "16");

}