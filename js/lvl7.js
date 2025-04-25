import { path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { nextScreen } from "./navigation.js";
import { log } from "./trace.js";
import { path_narration } from "./paths.js";

export function loadLvl7() {

    // Trace de l'entrée dans le niveau 7
    log("Enter in L7", "blue");

    // Store the current level in local storage
    localStorage.setItem("level", "7");

    // Steps for level 7
    const steps = [
        { background: path_backgrounds + 'fondEtape7.mp4', narration: "E7Narra", character: null, sound: path_narration+'Narrateur-E7/NarrateurE7-001.mp3'},
        // test
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7NarraTunT", character: path_personnages+'Berger/berger.png', sound: path_narration+'Berger-E7/BergerE7-001.mp3' },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7NarraTunF", character: null, sound: path_narration+'Narrateur-E7/NarrateurE7-002.mp3'},
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7BergerTunF", name:"E7BergerTunF", character: path_personnages+'Berger/berger.png', name: 'E6Berger2',sound: path_narration+'Berger-E7/BergerE7-002.mp3',
            choices: [
                { text: "E7Choix1", action: () => { nextScreen("5", "6bis") }},
                { text: "E7Choix2", action: () => { nextScreen("5", "8") }}
            ]
        }
    ];

    // Play the steps
    playSteps(steps);
    
}