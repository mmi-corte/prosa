import { loadLvl2 } from "./lvl2.js";

import { playSteps } from "./functionMakeSteps.js";
import { loadLvl1bis } from "./lvl1bis.js";
import { stopSound} from "./Sound/sound.js";
import { log } from "./trace.js";

export function loadLvl1() {

    log("Enter in L1", "blue");

    // stop the sounf used for the intro
    stopSound('assets/sound/intro.mp3');
    
    // Liste des étapes du niveau 1
    const steps = [
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra", character: null , sound: 'asset/sound/Narrateur/Narrateur-E1/narrateurE1-001.wav'},
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra1", character: null },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger1", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger1' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra2", character: null },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger2", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger2' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra3", character: null },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger3", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra4", character: null },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger4", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger4' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra5", character: null },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger5", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger5' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra6", character: null },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger6", character: 'assets/personnages/Berger/berger.png', name: 'E1Berger6' },
        {
            background: 'assets/bg/fondEtape1.mp4',
            narration: "E1Narra7",
            character: null,
            choices: [
                { text: "E1Choix1", action: loadLvl1bis },
                { text: "E1Choix2", action: loadLvl2 }
            ]
        }
    ];

    playSteps(steps, 0 , false, 4); // Démarrage des étapes

}






