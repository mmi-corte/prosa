import { refreshPage } from "./refreshPage.js";
import { log } from "./trace.js";
import { enemies, lunchFight } from "./fight.js";
import { path_narration } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl15() {

    // Trace the entry in the console
    log("Enter in L15", "blue");

    // Set the level in the local storage
    localStorage.setItem("level", "15");

    //Set the steps to play
    var steps = [
        { character: "NaraChara", Txt: "E15Narra",  sound: path_narration+'Narrateur-E15/narrateurE15-001.mp3' }
    ]

    const collectible = localStorage.getItem("collectible") || true;

    if (collectible) {

        //test fight
        async function luncher() {
            let weapons = [
                {
                    name: "Arc",
                    damage: 10,
                },
                {
                    name: "Grimoire",
                    damage: 10,
                }
            ];
            refreshPage();
            const fightResult = await lunchFight(skin, weapons, enemies[2]);
            log(fightResult);

            const steps = [
                { character: "BergerChara", Txt: "E15BergerCollec2T", name: "E2Berger2", sound: path_narration+'Berger-E15/bergerE15-001.mp3',
                    nextLvl: () => { nextScreen("5", "16"); window.location.reload(false); }
                 }
            ];

            refreshPage();
            playSteps(steps, 0, true, 2);
        }

        steps = steps.concat([
            { character: "BergerChara", Txt: "E15BergerCollec2T", name: "E2Berger2", sound: path_narration+'Berger-E15/bergerE15-001.mp3' },
            { character: "NaraChara", Txt: "E15NarraCollec2T", sound: path_narration+'Narrateur-E15/narrateurE15-002.mp3'},
            { character: "NaraChara", Txt: "E15NarraCollec2T", popup: "E15MessCollec2T" },
            { character: "NaraChara", Txt: "E15NarraCollec2T2", sound: path_narration+'Narrateur-E15/narrateurE15-003.mp3',
                choices: [
                { text: "E11Fight", action: () => {luncher();} }
              ] },
        ]);

        playSteps(steps, 0, true, 2);

    }
}