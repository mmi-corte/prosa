import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";

export function loadLvlfin() {

    // Trace the entry into the function
    log("Enter in LFin", "blue");

    // Set the level to "fin" in local storage
    localStorage.setItem("level", "fin");  
    
    // Define the steps for the narrative
    const steps = [
        { character: "NaraChara", Txt: "EndNarra" },
        { character: "EsterelleChara", Txt: "EndEsterelle", name: "EndEsterelle"},
        { character: "FataChara", Txt: "EndFata", name: "EndFata"},
        { character: "NaraChara", Txt: "EndNarra2" }
    ];

    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0, true , 2);
      
}