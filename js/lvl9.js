import { path_backgrounds, path_narration, path_personnages } from "./paths.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl9() {

    // Trace the entry in the console
    log("Enter in L9", "blue");

    // Set the level in localStorage
    localStorage.setItem("level", "9");

    // Steps for the level
    const steps = [
        { background: path_backgrounds+'fondEtape9.mp4', narration: "E9Narra", character: null, sound: path_narration+'Narrateur-E9/narrateurE9-001.mp3' },
        { background: path_backgrounds+'fondEtape9.png', narration: "E9Berger", character: path_personnages+'Berger/berger.png', name: 'E3Berger', sound: path_narration+'Berger-E9/bergerE9-001.mp3' },
        { background: path_backgrounds+'fondEtape9.png', narration: "E9Narra2", character: null, sound: path_narration+'Narrateur-E9/narrateurE9-002.mp3' },
        { background: path_backgrounds+'fondEtape9.png', narration: "E9Berger2", character: path_personnages+'Berger/berger.png', name: 'E9Berger2', sound: path_narration+'Berger-E9/bergerE9-002.mp3' },
        { background: path_backgrounds+'fondEtape9.png', narration: "E9Narra3", character: null, sound: path_narration+'Narrateur-E9/narrateurE9-003.mp3',
            nextLvl: () => { nextScreen("5", "10"); window.location.reload(false);}
        }
    ];

    //Play the steps
    playSteps(steps); 
    
}