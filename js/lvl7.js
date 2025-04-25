import { path_personnages, path_backgrounds } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { nextScreen } from "./navigation.js";
import { log } from "./trace.js";
import { path_narration } from "./paths.js";

export function loadLvl7() {

    // Trace de l'entrée dans le niveau 7
    log("Enter in L7", "blue");

    // Store the current level in local storage
    localStorage.setItem("level", "7");

    const D1 = "";
    const D2 = "";
    const D3 = "";
    const D4 = "";

    // Steps for level 7
    const steps1 = [
            { background: path_backgrounds + 'fondEtape7.mp4', narration: "E7Narra", character: null, sound: path_narration+'Narrateur-E7/NarrateurE7-001.mp3',
            choices: [
                { text: "Droite", answer: () => {D1="d"; return null;}},
                { text: "Millieu", answer: () => {D1="m"; return null;}},
                { text: "Gauche", answer: () => {D1="g"; return null;}}
            ]},
            { background: path_backgrounds + 'fondEtape7.png', character: null,
                choices: [
                    { text: "Droite", answer: () => {D2="d"; return null;}},
                    { text: "Millieu", answer: () => {D2="m"; return null;}},
                    { text: "Gauche", answer: () => {D2="g"; return null;}}
            ]},
            { background: path_backgrounds + 'fondEtape7.png', character: null,
                choices: [
                    { text: "Droite", answer: () => {D3="d"; return null;}},
                    { text: "Millieu", answer: () => {D3="m"; return null;}},
                    { text: "Gauche", answer: () => {D3="g"; return null;}}
            ]},
            { background: path_backgrounds + 'fondEtape7.png', character: null,
                choices: [
                    { text: "Droite", answer: () => {D4="d"; return null;}},
                    { text: "Millieu", answer: () => {D4="m"; return null;}},
                    { text: "Gauche", answer: () => {D4="g"; return null;}}
            ]},
    ];

    // Play the steps
    playSteps(steps1);

    if (D1=='g' && D2=='g' && D3=='d' && D4=='m') {
        const steps2 = [
            { background: path_backgrounds + 'fondEtape7.png', narration: "E7NarraTunT", character: path_personnages+'Berger/berger.png', sound: path_narration+'Berger-E7/BergerE7-001.mp3',
                nextLvl: () => { nextScreen("5","15");}}
        ]
    } else {
        const steps2 = [
            { background: path_backgrounds + 'fondEtape7.png', narration: "E7NarraTunF", character: path_personnages+'Berger/berger.png', sound: path_narration+'Berger-E7/BergerE7-001.mp3'},
            { background: path_backgrounds + 'fondEtape7.png', narration: "E7BergerTunF", name:"E7BergerTunF", character: path_personnages+'Berger/berger.png', sound: path_narration+'Berger-E7/BergerE7-002.mp3',
                nextLvl: () => { nextScreen("5","13");}}
        ]
    }

    // Play the steps
    playSteps(steps2);
    
}