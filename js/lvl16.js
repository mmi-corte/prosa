import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { enemies, lunchFight } from "./fight.js";
import { path_narration } from "./paths.js";

export function loadLvl16() {

    // Trace the entry into the function
    log("Enter in L16", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "16");

    // Define the steps
    const steps = [

        { character: "NaraChara", Txt: "E16Narra", sound: path_narration+'Narrateur-E16/narrateurE16.mp3' }
    ];

    // Refresh the page because AR
    refreshPage();
    
    // Play the steps
    playSteps(steps, 0, true, 2);

    //test fight
    async function luncher() {
        let weapons = [
            {
                name: "Epée",
                damage: 10,
            },
        ];
        const fightResult = await lunchFight(skin, weapons, enemies[2]);
        console.log(fightResult);
    }
    luncher();

    // voir la fonction fight si on peut savoir si on endormie lenemie ou pas ??, 

}