import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl10() {

    log("Enter in L10", "blue");

    localStorage.setItem("level", "10"); 

    const steps = [
        { character: "NarraChara", Txt: "E10Narra" },
        { character: "BergerChara", Txt: "E10Berger", name: "E10Berger" },
        { character: "NarraChara", Txt: "E10Narra2"},
        { character: "OrcuChara", Txt: "E10Orcu", name: "E10Orcu" }
    ];

    refreshPage();

    playSteps(steps, 0, true, 4);

    if(fairy) {
        const steps = [
            { character: "NarraChara", Txt: "E10NarraAFairy", name: "Narrateur" },
            { character: "OrcuChara", Txt: "E10OrcuAFairy", name: "Orcus" },
        ];
        playSteps(steps, 0, true, 8);
    }

    if(Leo) {
        const steps = [
            { character: "NarraChara", Txt: "E10NarraALeoS"},
            { character: "OrcuChara", Txt: "E10OrcuALeoS", name: "E10OrcuALeoS" },
        ];
        playSteps(steps, 0, true, 8);
    }

    const steps2 = [
        { character: "NarraChara", Txt: "E10Narra3"},
        { character: "OrcuChara", Txt: "E10Orcu2", name: "E10Orcu2" },
        { character: "BergerChara", Txt: "E10Berger2", name: "E10Berger2" },
        { character: "OrcuChara", Txt: "E10Orcu3", name: "E10Orcu3" },
        { character: "NarraChara", Txt: "E10Narra4"},
        { character: "NarraChara", Txt: "E10Narra4", popup: "E8Mess"},
        { character: "OrcuChara", Txt: "E10Orcu4", name: "E10Orcu4" },
        { character: "NarraChara", Txt: "E10Narra5", nextLvl: () => { nextScreen("5","11");}},

    ];

    refreshPage();

    playSteps(steps2, 0, true, 8);

}