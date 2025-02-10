import { refreshPage } from './refreshPage.js';
import { playSteps } from "./functionMakeSteps.js";
import { path_narration } from "./paths.js";
import { log } from './trace.js';
import { nextScreen } from './navigation.js';

export function loadLvl2() {

    // Trace the entry in the level 2
    log("Enter in L2", "blue");
    
    // Set the level in localStorage
    localStorage.setItem("level", "2"); 
    
    // steps of level 2
    const steps = [
        {character: "NaraChara", Txt: "E2Narra", sound: path_narration+'Narrateur-E2/narrateurE2-001.mp3'},
        {character: "BergerChara", Txt: "E2Berger", name: "E2Berger", sound: path_narration+'Berger-E2/Berger-E2-001.mp3'},
        {character: "NaraChara", Txt: "E2Narra2", sound: path_narration+'Narrateur-E2/narrateurE2-002.mp3'},
        {character: "FataChara", Txt: "E2Fata", name: "E2Fata", sound: path_narration+'Fata-E2/Fata-E2-001.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle", name: "E2Esterelle", sound: path_narration+'Esterelle-E2/Esterelle-E2-001.mp3'},
        {character: "NaraChara", Txt: "E2Narra3", sound: path_narration+'Narrateur-E2/narrateurE2-003.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle2", name: "E2Esterelle2", sound: path_narration+'Esterelle-E2/Esterelle-E2-002.mp3'},
        {character: "FataChara", Txt: "E2Fata2", name: "E2Fata2", sound: path_narration+'Fata-E2/Fata-E2-002.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle3", name: "E2Esterelle3", sound: path_narration+'Esterelle-E2/Esterelle-E2-003.mp3'},
        {character: "FataChara", Txt: "E2Fata3", name: "E2Fata3", sound: path_narration+'Fata-E2/Fata-E2-003.mp3'},
        {character: "NaraChara", Txt: "E2Narra4", sound: path_narration+'Narrateur-E2/narrateurE2-004.mp3'},
        {character: "FataChara", Txt: "E2Fata4", name: "E2Fata4", sound: path_narration+'Fata-E2/Fata-E2-004.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle4", name: "E2Esterelle4", sound: path_narration+'Esterelle-E2/Esterelle-E2-004.mp3'},
        {character: "FataChara", Txt: "E2Fata5", name: "E2Fata5", sound: path_narration+'Fata-E2/Fata-E2-005.mp3'},
        {character: "NarraChara", Txt: "E2Narra5", sound: path_narration+'Narrateur-E2/narrateurE2-005.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle5", name: "E2Esterelle5", sound: path_narration+'Esterelle-E2/Esterelle-E2-005.mp3'},
        {character: "FataChara", Txt: "E2Fata6", name: "E2Fata6", sound: path_narration+'Fata-E2/Fata-E2-006.mp3'},
        {character: "NaraChara", Txt: "E2Narra6", sound: path_narration+'Narrateur-E2/narrateurE2-006.mp3'},
        {character: "BergerChara", Txt: "E2Berger2", name: "E2Berger2", sound: path_narration+'Berger-E2/Berger-E2-002.mp3'},
        {character: "NaraChara", Txt: "E2Narra7", sound: path_narration+'Narrateur-E2/narrateurE2-006.mp3', 
            nextLvl: () => { nextScreen("5", "3"); window.location.reload(false); }}
        ];

    // Refresh the page because the AR mode is active in thos level
    refreshPage();

    // Display the map button to allow the user to see the map during the AR mode
    const MapBtn = document.getElementById("MapBtn");
    if(MapBtn) {
        MapBtn.style.display = "block";
    }

    // Play the steps
    playSteps(steps, 0, true, 2);
    
}
