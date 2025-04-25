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

    //test fight
    async function luncher() {
        let weapons = [
            {
                name: "Epée",
                damage: 10,
            },
        ];
        refreshPage();
        const fightResult = await lunchFight(skin, weapons, enemies[2]);
        log(fightResult);

        const steps = [
            { nextLvl: () => { nextScreen("5", "fin"); window.location.reload(false); }
             }
        ];

        refreshPage();
        playSteps(steps, 0, true, 2);

    }

    // Define the steps
    const steps = [
        { character: "NaraChara", Txt: "E16Narra", sound: path_narration+'Narrateur-E16/narrateurE16.mp3', choices: [
            { text: "E11Fight", action: () => {luncher();} }]
        }
    ];

}