import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { path_narration } from "./paths.js";


export function loadLvl14() {

    // Trace the entry in the console
    log("Enter in L14", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "14");
    
    // Steps to play
    var steps = [
        { character: "NaraChara", Txt: "E14Narra", sound: path_narration+'Narrateur-E14/narrateurE14-001.mp3' },
    ];

    const incantation = localStorage.getItem('incantation') == 'true' || true;

    if (incantation) {
        steps = steps.concat([
            { character: "NaraChara", Txt: "E14NarraSpellST", sound: path_narration+'Narrateur-E14/narrateurE14-002.mp3' },//alors je sais pas si il y a pas l'incantation du Berger
            { character: "NaraChara", Txt: "E14NarraSpellST2", sound: path_narration+'Narrateur-E14/narrateurE14-003.mp3' },
        ]);

    } else {
        steps = steps.concat([
            { character: "NaraChara", Txt: "E14NarraSpellSF", sound: path_narration+'Narrateur-E14/narrateurE14-004.mp3' },
        ]);
    }

    steps = steps.concat([
        { character: "BergerChara", 
            Txt: "E14Berger", 
            name:'E14Berger', 
            sound: path_narration+'Berger-E14/bergerE14-002.mp3', 
            nextLvl : () => {nextScreen("5", "15");} }
    ]);
    
    // Refresh the page because AR
    refreshPage();

    // Play the steps
    playSteps(steps, 0 , true, 2);

}