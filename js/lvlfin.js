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
        { character: "NaraChara", Txt: "EndNarra", sound: path_narration+'Narrateur-Fin2/narrateurFin1-001.mp3' },
        { character: "EsterelleChara", Txt: "EndEsterelle", name: "EndEsterelle", sound: path_narration+'Esterelle-F1.mp3'},
        { character: "FataChara", Txt: "EndFata", name: "EndFata", sound: path_narration+'Fata-Fin-001.mp3'},
        { character: "NaraChara", Txt: "EndNarra2", sound: path_narration+'Narrateur-Fin2/narrateurFin2-001.mp3' }
    ];

    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0, true , 2);
      
}