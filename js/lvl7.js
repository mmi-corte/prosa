import { path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { nextScreen } from "./navigation.js";
import { log } from "./trace.js";

export function loadLvl7() {

    // Trace de l'entrée dans le niveau 7
    log("Enter in L7", "blue");

    // Store the current level in local storage
    localStorage.setItem("level", "7");

    // Steps for level 7
    const steps = [
        { background: path_backgrounds + 'fondEtape7.mp4', narration: "E7Narra", character: null },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7Narra", character: path_personnages+'Berger/berger.png', name: 'E6Berger' },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7Narra2", character: null },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7Berger2", character: path_personnages+'Berger/berger.png', name: 'E6Berger2',
            choices: [
                { text: "E6Choix1", action: () => { nextScreen("5", "9") }},
                { text: "E6Choix2", action: () => { nextScreen("5", "10") }}
            ]
        }
    ];

    // Play the steps
    playSteps(steps, 0 , false , 2);
    
}