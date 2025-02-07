import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvlfin() {

    refreshPage();
    console.log("loadLvlfin :  je suis là");
    

    const steps = [
        { character: "NaraChara", Txt: "EndNarra" },
        {character : "EsterelleChara", Txt : "EndEsterelle",name : "EndEsterelle"},
        {character : "FataChara", Txt : "EndFata",name : "EndFata"},
        { character: "NaraChara", Txt: "EndNarra2" }
    ];
    playSteps(steps , 0, true ,4);
    localStorage.setItem("level", "fin");    
}