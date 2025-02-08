// import
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from './navigation.js';
import { path_narration, path_personnages, path_backgrounds} from "./paths.js";

export function loadLvl1() {

    // Vérification du niveau actuel
    log("Enter in L1", "blue");

    // Mise à jour du niveau actuel dans le localStorage
    localStorage.setItem("level", "1"); 

    // Définition des étapes pour le niveau 1
    const steps = [
        { background: path_backgrounds + 'fondEtape1.mp4', narration: "E1Narra", character: null, sound: path_narration + "Narrateur-E1/narrateurE1-001.mp3"},
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger", character: path_personnages + 'Berger/berger.png', name: 'E1Berger' , sound: path_narration + "Berger-E1/Berger-E1-001.mp3" }, // mp3 faux
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Narra1", character: null, sound: path_narration + 'Narrateur-E1/narrateurE1-003.mp3'},
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger1", character: path_personnages + 'Berger/berger.png', name: 'E1Berger1' , sound: path_narration + "Berger-E1/Berger-E1-002.mp3" }, // mp3 faux
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Narra2", character: null, sound: path_narration + 'Narrateur-E1/narrateurE1-004.mp3' },
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger2", character: path_personnages + 'Berger/berger.png', name: 'E1Berger2' , sound: path_narration + "Berger-E1/Berger-E1-003.mp3" }, // mp3 faux
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Narra3", character: null, sound: path_narration + 'Narrateur-E1/narrateurE1-005.mp3' },
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger3", character: path_personnages + 'Berger/berger.png', name: 'E1Berger3' , sound: path_narration + 'Berger-E1/Berger-E1-004.mp3' }, // mp3 faux
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Narra4", character: null, sound: path_narration + 'Narrateur-E1/narrateurE1-006.mp3' },
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger4", character: path_personnages + 'Berger/berger.png', name: 'E1Berger4' , sound: path_narration + 'Berger-E1/Berger-E1-005.mp3' }, // mp3 faux
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Narra5", character: null, sound: path_narration + 'Narrateur-E1/narrateurE1-007.mp3' },
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger5", character: path_personnages + 'Berger/berger.png', name: 'E1Berger5' , sound: path_narration + 'Berger-E1/Berger-E1-006.mp3'},
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Narra6", character: null, sound: path_narration + 'Narrateur-E1/narrateurE1-008.mp3' },
        { background: path_backgrounds + 'fondEtape1.jpg', narration: "E1Berger6", character: path_personnages + 'Berger/berger.png', name: 'E1Berger6' , sound: path_narration + 'Berger-E1/Berger-E1-007.mp3'}, 
        {
            background: path_backgrounds + 'fondEtape1.jpg',
            narration: "E1Narra7",
            character: null,
            sound: path_narration+'Narrateur-E1/narrateurE1-009.mp3',
            choices: [
                { text: "E1Choix1", action: () => { nextScreen("5", "1bis") }},
                { text: "E1Choix2", action: () => { nextScreen("5", "2")} }
            ]
        }
    ];
    
    // Fonction pour démarrer les étapes
    playSteps(steps);

}






