import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl15 } from "./lvl15.js";

export function loadLvl14() {

    refreshPage();
    console.log("loadLvl14 :  je suis là");
    
    
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
        { character: "BergerChara", Txt: "E14Berger", nextLvl : loadLvl15 }
    ];
    playSteps(steps2, 0 , true, 4);
    localStorage.setItem("level", "14");
}