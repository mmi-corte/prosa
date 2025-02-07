import { path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl7() {

    // Liste des étapes du niveau 1
    const steps = [
        { background: path_backgrounds + 'fondEtape7.mp4', narration: "E7Narra", character: null },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7Narra", character: path_personnages+'Berger/berger.png', name: 'E6Berger' },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7Narra2", character: null },
        { background: path_backgrounds + 'fondEtape7.png', narration: "E7Berger2", character: path_personnages+'Berger/berger.png', name: 'E6Berger2',
            choices: [
                { text: "E6Choix1", action: loadLvl9 },
                { text: "E6Choix2", action: loadLvl10 }
            ]
        }
    ];

    playSteps(steps); // Démarrage des étapes
 
    localStorage.setItem("level", "7");
    
}