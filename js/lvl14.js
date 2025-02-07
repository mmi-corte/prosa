import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl14() {

    log("Enter in L14", "blue");

    refreshPage();
    
    const steps = [
        { character: "NaraChara", Txt: "E14Narra" },
    ];
    // Lance les étapes
    playSteps(steps, 0, true, 4);

    if (incantation) {
        const steps = [
            { character: "NaraChara", Txt: "E14NarraSpellST" },
            { character: "NaraChara", Txt: "E14NarraSpellST2" },
        ];
        playSteps(steps, 0, true, 4);
    } else {
        const steps = [
            { character: "NaraChara", Txt: "E14NarraSpellSF" },
        ];
        playSteps(steps, 0, true, 4);
    }

    const steps2 = [
        { character: "BergerChara", Txt: "E14Berger", nextLvl : nextScreen("5","15") }
    ];
    
    playSteps(steps2, 0 , true, 4);
    
    localStorage.setItem("level", "14");
}