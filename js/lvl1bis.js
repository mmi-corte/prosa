import { playSteps } from './functionMakeSteps.js';
import { popup } from './popup.js';
import { path_narration, path_personnages, path_backgrounds } from "./paths.js";
import { log } from './trace.js';
import { nextScreen } from './navigation.js';
import { refreshPage } from './refreshPage.js';

export function loadLvl1bis() {

    log("Enter in L1bis", "blue");

    const steps = [
        { background: path_backgrounds + 'fondEtape1bis.mp4', narration: "E1BNarra", character: null, sound: path_narration+'Narrateur-E1bis/narrateurE1bis-001.mp3' },
        { background: path_backgrounds + 'fondEtape1bis.png', narration: "E1BBerger", character: path_personnages+'Berger/berger.png', name: 'E1BBerger', sound: path_narration+'Berger-E1bis/Berger-E1bis.mp3'},
        { background: path_backgrounds + 'fondEtape1bis.png', narration: "E1BNarra2", character: null, sound: path_narration+'Narrateur-E1bis/narrateurE1bis-002.mp3' },
        {
            background: path_backgrounds + 'fondEtape1bis.png',
            narration: () => {
                popup("Vous avez récupéré la branche d’arbre", "assets/items/branche.png");
            },
            character: null
        },
        {
            background: path_backgrounds + 'fondEtape1bis.png',
            narration: "E1Berger2",
            character: null,
            choices: [
                { text: "Aller au niveau 2", action: () => { nextScreen("5", "2") } },
                { text: "Aller au niveau 3", action: () => { nextScreen("5", "3") } }
            ]
        }
    ];

    // Lance les étapes
    playSteps(steps);

    localStorage.setItem("level", "1bis");
}