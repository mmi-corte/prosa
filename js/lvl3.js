import { nextScreen } from './navigation.js';
import { playSteps } from './functionMakeSteps.js';
import { path_narration, path_personnages, path_backgrounds } from "./paths.js";
import { log } from "./trace.js";
// import { createStaticMap } from "./map.js";

export function loadLvl3() {

    // Trace the entry in the level 3
    log("Enter in L3", "blue");

    // Set the level in localStorage
    localStorage.setItem("level", "3");

    // Steps for the level 3
    const steps = [
        { background: path_backgrounds+'fondEtape3.mp4', narration: "E3Narra", character: null, sound: path_narration+'Narrateur-E3/narrateurE3-001.mp3' },
        { background: path_backgrounds+'fondEtape3.png', narration: "E3Narra1_2", character: null, sound: path_narration+'Narrateur-E3/NarrateurE3-001-002.mp3' },
        { background: path_backgrounds+'fondEtape3.png', narration: "E3Berger", character: path_personnages+'Berger/berger.png', name: 'E3Berger', sound: path_narration+'Berger-E3/Berger-E3-001.mp3' },
        { background: path_backgrounds+'fondEtape3.png', narration: "E3Narra2", character: null, sound: path_narration+'Narrateur-E3/narrateurE3-002.mp3'},
        { background: path_backgrounds+'fondEtape3.png', narration: "E3Berger2", character: path_personnages+'Berger/berger.png', name: 'E3Berger2', sound: path_narration+'Berger-E3/Berger-E3-002.mp3' },
        { background: path_backgrounds+'fondEtape3.png', narration: "E3Narra3", character: null, sound: path_narration+'Narrateur-E3/narrateurE3-003.mp3'},
        { background: path_backgrounds+'fondEtape3.png', 
            narration: "E3Berger3", 
            character: path_personnages+'Berger/berger.png', 
            name: 'E3Berger3', 
            style_button: "row",
            sound: path_narration+'Berger-E3/Berger-E3-003.mp3',
            choices: [
                { text: "E3Choix1", action: () => {nextScreen("5", "4");} }, // Strega
                { text: "E3Choix2", action: () => {nextScreen("5", "10");} } // Orcu
            ]
        }
    ];

    // Play the steps
    playSteps(steps);

    // Display the map button to allow the user to see the map during the AR mode
    // const MapBtn = document.getElementById("MapBtn");
    // if(MapBtn) {
    //     MapBtn.style.display = "block";
    //     createStaticMap("container");
    // }
}