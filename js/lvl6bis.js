import { path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl6bis() {

      // Liste des étapes du niveau 1
      const steps = [
        { background: path_backgrounds + 'fondEtape6bis.mp4', narration: "E6Narra", character: null },
        { background: path_backgrounds + 'fondEtape6bis.png', narration: "E6Berger", character: path_personnages + 'Berger/berger.png', name: 'E6Berger' },
        { background: path_backgrounds + 'fondEtape6bis.png', narration: "E6Narra2", character: null },
        { background: path_backgrounds + 'fondEtape6bis.png', narration: "E6Berger2", character: path_personnages + 'Berger/berger.png', name: 'E6Berger2',
            choices: [
                { text: "E6Choix1", action: loadLvl9 },
                { text: "E6Choix2", action: loadLvl10 }
            ]
        }
    ];

    playSteps(steps); // Démarrage des étapes
 
    localStorage.setItem("level", "6bis");
    
}