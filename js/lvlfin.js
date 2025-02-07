import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";

export function loadLvlfin() {

    log("Enter in LFin", "blue");

    refreshPage();
    
    const steps = [
        { character: "NaraChara", Txt: "EndNarra" },
        {character : "EsterelleChara", Txt : "EndEsterelle",name : "EndEsterelle"},
        {character : "FataChara", Txt : "EndFata",name : "EndFata"},
        { character: "NaraChara", Txt: "EndNarra2" }
    ];

    playSteps(steps , 0, true ,4);
    
    localStorage.setItem("level", "fin");    
}