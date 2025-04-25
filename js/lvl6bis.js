import { path_personnages, path_backgrounds, path_narration } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { nextScreen } from "./navigation.js";
import { log } from "./trace.js";

export function loadLvl6bis() {

    // Trace the entry in the level 6bis
    log("Enter in L6bis", "blue");
    
    // Set the level in localStorage
    localStorage.setItem("level", "6bis");

    // Steps for the level 6bis
    const steps = [
        { background: path_backgrounds + 'fondEtape6bis.mp4', narration: "E6BNarra", character: null, sound: path_narration+'Narrateur-E6bis/narrateurE6bis-001.mp3' },
        { background: path_backgrounds + 'fondEtape6bis.png', narration: "E6BBerger", character: path_personnages + 'Berger/berger.png', name: 'E6BBerger', sound: path_narration+'Berger-E6bis/BergerE6bis-001.mp3' },
        { background: path_backgrounds + 'fondEtape6bis.png', narration: "E6BNarra2", character: null,sound: path_narration+'Narrateur-E6bis/narrateurE6bis-002.mp3' },
        { background: path_backgrounds + 'fondEtape6bis.png', narration: "E6BBerger2", character: path_personnages + 'Berger/berger.png', name: 'E6BBerger2', sound: path_narration+'Berger-E6bis/BergerE6bis-002.mp3',
            choices: [
                { text: "E6BChoix1", action: () => {nextScreen("5", "9");} },
                { text: "E6BChoix2", action: () => {nextScreen("5", "10")} }
            ]}
    ];

    //Play the steps
    playSteps(steps ,0 ,false, 2);
    
}