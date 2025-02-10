import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl14() {

    // Trace the entry in the console
    log("Enter in L14", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "14");
    
    // Steps to play
    let steps = [
        { character: "NaraChara", Txt: "E14Narra" },
    ];

    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0, true, 2);

    if (incantation) {
        steps = [
            { character: "NaraChara", Txt: "E14NarraSpellST" },
            { character: "NaraChara", Txt: "E14NarraSpellST2" },
        ];

    } else {
        steps = [
            { character: "NaraChara", Txt: "E14NarraSpellSF" },
        ];
    }

    // Refresh the page because AR
    refreshPage();
    
    // Play the steps
    playSteps(steps, 0, true, 2);

    steps = [
        { character: "BergerChara", Txt: "E14Berger", nextLvl : () => {nextScreen("5","15");} }
    ];
    
    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0 , true, 2);

}