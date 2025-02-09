import { refreshPage } from "./refreshPage.js";
import { addOverlay } from './overlay.js';
import { nextScreen } from './navigation.js';
import { playSteps } from './functionMakeSteps.js';
import { path_narration, path_personnages, path_backgrounds } from "./paths.js";
import { log } from "./trace.js";

export function loadLvl3() {

    // Trace the entry in the level 3
    log("Enter in L3", "blue");

    // Set the level in localStorage
    localStorage.setItem("level", "3");

    // Steps for the level 3
    const steps = [
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra", character: null , sound: 'assets/sound/narration/Narrateur-E3/narrateurE3-001.mp3' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger", character: 'assets/personnages/Berger/berger.png', name: 'E3Berger' , sound: 'asset/sound/narration/Berger-E3/Berger-E3-001mp3' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra2", character: null , sound: 'asset/sound/narration/Narrateur-E3/narrateurE3-002.mp3'},
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger2", character: 'assets/personnages/Berger/berger.png', name: 'E3Berger1' , sound: 'asset/sound/narration/Berger-E3/Berger-E3-002mp3' },
        { background: 'assets/bg/fondEtape3.png', narration: "E3Narra3", character: null , sound: 'asset/sound/narration/Narrateur-E3/narrateurE3-003.mp3'},
        { background: 'assets/bg/fondEtape3.png', narration: "E3Overlay", character: null, action: addOverlay },// Appel de la fonction overlay ici
        { background: 'assets/bg/fondEtape3.png', narration: "E3Berger3", character: 'assets/personnages/Berger/berger.png', name: 'E3Berger6' , sound: 'asset/sound/narration/Berger-E3/Berger-E3-003mp3',
            choices: [
                { text: "E3Choix1", action: () => {nextScreen("5", "4");} },
                { text: "E3Choix2", action: () => {nextScreen("5", "10");} }
            ]
        }
    ];

    // Map button should not be visible in this step
    const MapBtn = document.getElementById("MapBtn");
    if(MapBtn) {
        MapBtn.style.display = "none";
    }

    // Play the steps
    playSteps(steps);

}