import { refreshPage } from "./refreshPage.js";
import { log } from "./trace.js";
import { enemies, lunchFight } from "./fight.js";
import { skin } from "./functionChangeStyle.js";

export function loadLvl15() {

    // Trace the entry in the console
    log("Enter in L15", "blue");

    // Set the level in the local storage
    localStorage.setItem("level", "15");

    //Set the steps to play
    let steps = [
        { character: "NaraChara", Txt: "E15Narra" }
    ]

    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0, true, 2);


    if (Colectible) {
        steps = [
            { character: "BergerChara", Txt: "E15BergerCollec2T", name: "E2Berger2" },
            { character: "NaraChara", Txt: "E15NarraCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T", popup: "E15MessCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T2" },
        ];
        
        //Refresh the page because AR
        refreshPage();

        //Play the steps
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
        // voir comment on passe a letape d'apres ??? 

    }

}