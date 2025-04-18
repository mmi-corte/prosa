import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { path_narration } from "./paths.js";

export function loadLvl10() {

    log("Enter in L10", "blue");

    localStorage.setItem("vue_orcu", true);

    if(localStorage.getItem("level", "4")){
        localStorage.setItem("vue_fairy", true);
    };
    
    localStorage.setItem("level", "10"); 

    const steps = [
        { character: "NarraChara", Txt: "E10Narra", sound: path_narration+'Narrateur-E10/narrateurE10-001.mp3' },
        { character: "BergerChara", Txt: "E10Berger", name: "E10Berger", sound: path_narration+'Berger-E10/bergerE10-001.mp3' },
        { character: "NarraChara", Txt: "E10Narra2", sound: path_narration+'Narrateur-E10/narrateurE10-002.mp3'},
        { character: "OrcuChara", Txt: "E10Orcu", name: "E10Orcu", sound: path_narration+'Orcu-E10/Orcu-E10-005.mp3' }
    ];

    //Viens après les fées ?
    if(localStorage.getItem("fairy")) {
        steps.push( { character: "NarraChara", Txt: "E10NarraAFairy", name: "E10NarraAFairy", sound: path_narration+'Narrateur-E10/narrateurE10-005.mp3'},
                    { character: "OrcuChara", Txt: "E10OrcuAFairy", name: "Orcus", sound: path_narration+'Orcu-E10/Orcu-E10-006.mp3' });
    }

    if (localStorage.getItem("lion")) {
        steps.push( { character: "NarraChara", Txt: "E10NarraALeoS", name: "E10NarraALeoS", sound: path_narration+'Narrateur-E10/narrateurE10-006.mp3'},
                    { character: "OrcuChara", Txt: "E10OrcuALeoS", name: "E10OrcuALeoS", sound: path_narration+'Orcu-E10/Orcu-E10-005.mp3' });
    }

    steps.push({ character: "NarraChara", Txt: "E10Narra3", sound: path_narration+'Narrateur-E10/narrateurE10-007.mp3'},
            { character: "OrcuChara", Txt: "E10Orcu2", name: "E10Orcu2", sound: path_narration+'Orcu-E10/Orcu-E10-007.mp3' },
            { character: "BergerChara", Txt: "E10Berger2", name: "E10Berger2" },
            { character: "OrcuChara", Txt: "E10Orcu3", name: "E10Orcu3" },
            { character: "NarraChara", Txt: "E10Narra4", popup: "E8Mess"},
            { character: "OrcuChara", Txt: "E10Orcu4", name: "E10Orcu4" },
            { character: "NarraChara", Txt: "E10Narra5", nextLvl: () => { nextScreen("5","11");}})

    refreshPage();

    playSteps(steps, 0, true, 2);

}