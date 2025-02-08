import { playSteps } from "./functionMakeSteps.js";
import { refreshPage } from "./refreshPage.js";
import { nextScreen } from "./navigation.js";
import { log } from "./trace.js";

export function loadLvlfinAlt() {

    // Trace the entry into the function
    log("Enter in LFinAlt", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "finAlt");

    // Define the steps for the dialogue
    const steps = [
        { character: "NaraChara", Txt: "End2Narra" },
        { character: "BergerChara", Txt: "End2Berger", name: "End2Berger"},
        { character: "NaraChara", Txt: "End2Narra2" },
        { character: "EsterelleChara", Txt: "End2Esterelle", name: "End2Esterelle"},
        { character: "FataChara", Txt: "End2Fata", name: "End2Fata"},
        { character: "NaraChara", Txt: "End2Narra3" },
        { character: "FataChara", Txt: "End2Fata2", name: "End2Fata2"},
        { character: "NaraChara", Txt: "End2Narra4" , nextLvl: () => { nextScreen("5", "1"); window.location.reload(false); }}
    ];

    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0, true, 4);

}