// import
import { loadLvl2 } from "./lvl2.js";
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl1bis } from "./lvl1bis.js";
import { loadSound, stopSound} from "./Sound/sound.js";
import { log } from "./trace.js";

// consts
const path_sound = "assets/sound/";
const path_personnages = "assets/personnages/";
const path_narration = path_sound + "narration/";

export function loadLvl1() {

    log("Enter in L1", "blue");

    // stop the sounf used for the intro
    stopSound('assets/sound/intro.mp3');
    
    // Liste des étapes du niveau 1
    const steps = [
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra", character: null , sound: path_narration+"Narrateur-E1/narrateurE1-001.mp3"},
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger", character: path_personnages+'Berger/berger.png', name: 'E1Berger' , sound: path_narration+"Berger-E1/Berger-E1-001.mp3" },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra1", character: null , sound: path_narration+'Narrateur-E1/narrateurE1-003.mp3'},
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger1", character: path_personnages+'Berger/berger.png', name: 'E1Berger1' , sound: path_narration+"Berger-E1/Berger-E1-002.mp3" },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra2", character: null , sound: path_narration+'Narrateur-E1/narrateurE1-004.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger2", character: path_personnages+'Berger/berger.png', name: 'E1Berger2' , sound: path_narration+"Berger-E1/Berger-E1-003.mp3" },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra3", character: null , sound: path_narration+'Narrateur-E1/narrateurE1-005.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger3", character: path_personnages+'Berger/berger.png', name: 'E1Berger3' , sound: path_narration+'Berger-E1/Berger-E1-004.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra4", character: null , sound: path_narration+'Narrateur-E1/narrateurE1-006.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger4", character: path_personnages+'Berger/berger.png', name: 'E1Berger4' , sound: path_narration+'Berger-E1/Berger-E1-005.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra5", character: null , sound: path_narration+'Narrateur-E1/narrateurE1-007.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger5", character: path_personnages+'Berger/berger.png', name: 'E1Berger5' , sound: path_narration+'Berger-E1/Berger-E1-006.mp3'},
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Narra6", character: null , sound: path_narration+'Narrateur-E1/narrateurE1-008.mp3' },
        { background: 'assets/bg/fondEtape1.mp4', narration: "E1Berger6", character: path_personnages+'Berger/berger.png', name: 'E1Berger6' , sound: path_narration+'Berger-E1/Berger-E1-007.mp3' },
        {
            background: 'assets/bg/fondEtape1.mp4',
            narration: "E1Narra7",
            character: null,
            sound: path_narration+'Narrateur-E1/narrateurE1-009.mp3',
            choices: [
                { text: "E1Choix1", action: loadLvl1bis },
                { text: "E1Choix2", action: loadLvl2 }
            ]
        }
    ];

    playSteps(steps, 0 , false, 4); // Démarrage des étapes

}






