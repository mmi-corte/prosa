import { refreshPage } from "./refreshPage.js";
import { lunchFight } from './fight.js';
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl16() {

    refreshPage();
    console.log("loadLvl16 :  je suis là");
   
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