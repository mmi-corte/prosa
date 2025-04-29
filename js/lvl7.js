import { path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { nextScreen } from "./navigation.js";
import { log } from "./trace.js";
import { path_narration } from "./paths.js";
import { refreshPage } from "./refreshPage.js";

export function loadLvl7() {

    // Trace de l'entrée dans le niveau 7
    log("Enter in L7", "blue");

    // Store the current level in local storage
    localStorage.setItem("level", "7");

    // Steps for level 7
    var steps = [
            { background: path_backgrounds + 'fondEtape7.mp4', narration: "E7Narra", character: null, sound: path_narration+'Narrateur-E7/NarrateurE7-001.mp3',
                style_button: "row",
            choices: [
                { text: "Droite ?", answer: () => {return null;}},
                { text: "Milieu ?", answer: () => {return null;}},
                { text: "Gauche ?", answer: () => {return null;}}
            ]},
            { background: path_backgrounds + 'fondEtape7.png', character: null,
                            style_button: "row",
                            choices: [
                                { text: "Droite ?", answer: () => {return null;}},
                                { text: "Milieu ?", answer: () => {return null;}},
                                { text: "Gauche ?", answer: () => {return null;}}
                        ]},
                        { background: path_backgrounds + 'fondEtape7.png', character: null,
                            style_button: "row",
                            choices: [
                                { text: "Droite ?", answer: () => {return null;}},
                                { text: "Milieu ?", answer: () => {return null;}},
                                { text: "Gauche ?", answer: () => {return null;}}
                        ]},
                        { background: path_backgrounds + 'fondEtape7.png', character: null,
                            style_button: "row",
                            choices: [
                                { text: "Droite ?", answer: () => {return null;}},
                                { text: "Milieu ?", answer: () => {return null;}},
                                { text: "Gauche ?", answer: () => {return null;}}
                        ]},
                        { background: path_backgrounds + 'fondEtape7.png', character: null,
                            style_button: "row",
                            choices: [
                                { text: "Droite ?", answer: () => {return null;}},
                                { text: "Milieu ?", answer: () => {return null;}},
                                { text: "Gauche ?", answer: () => {return null;}}
                        ]}
        ];

    const D0 = localStorage.getItem('answer_7_E0');
    const D1 = localStorage.getItem('answer_7_E1');
    const D2 = localStorage.getItem('answer_7_E2');
    const D3 = localStorage.getItem('answer_7_E3');
    const D4 = localStorage.getItem('answer_7_E4');

    if (D0=="Gauche ?" && D1=="Gauche ?" && D2=="Droite ?" && D3=="Milieu ?" && D4=="Droite ?") {
        steps = steps.concat([
            { background: path_backgrounds + 'fondEtape7.png', 
                narration: "E7NarraTunT", 
                character: path_personnages+'Berger/berger.png', 
                sound: path_narration+'Berger-E7/BergerE7-001.mp3',
                nextLvl: () => { nextScreen("5", "8");}}
        ]);
    } else {
        steps = steps.concat([
            { background: path_backgrounds + 'fondEtape7.png', 
                narration: "E7NarraTunF", 
                character: path_personnages+'Berger/berger.png', 
                sound: path_narration+'Berger-E7/BergerE7-001.mp3'},
            { background: path_backgrounds + 'fondEtape7.png', 
                narration: "E7BergerTunF", 
                name:"E7BergerTunF", 
                character: path_personnages+'Berger/berger.png', 
                sound: path_narration+'Berger-E7/BergerE7-002.mp3',
                nextLvl: () => { nextScreen("5", "6bis");}}
        ]);
    }

    refreshPage();

    // Play the steps
    playSteps(steps);
    
}