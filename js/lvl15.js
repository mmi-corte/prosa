import { refreshPage } from "./refreshPage.js";
import { lunchFight } from './fight.js';

export function loadLvl15() {

    refreshPage();
    console.log("loadLvl15 :  je suis là");
    
    const steps = [
        { character: "NaraChara", Txt: "E15Narra" }
    ]

    refreshPage();
    // Lance les étapes
    playSteps(steps, 0, true, 4);

    if (Colectible) {
        const steps = [
            { character: "BergerChara", Txt: "E15BergerCollec2T", name: "E2Berger2" },
            { character: "NaraChara", Txt: "E15NarraCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T", popup: "E15MessCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T2" },
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
        // voir comment on passe a letape d'apres ??? 

    }

    localStorage.setItem("level", "15");

}