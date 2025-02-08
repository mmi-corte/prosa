import { path_personnages } from "./paths.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl9() {

    log("Enter in L9", "blue");

   // Liste des étapes du niveau 1
   const steps = [
    { background: 'assets/bg/fondEtape9.mp4', narration: "E9Narra", character: null },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Berger", character: path_personnages+'Berger/berger.png', name: 'E3Berger' },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Narra2", character: null },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Berger2", character: path_personnages+'Berger/berger.png', name: 'E3Berger1' },
    { background: 'assets/bg/fondEtape9.png', choices: [ { text: "E9Mess", action: nextScreen("5","10")} ], character: null },
];

playSteps(steps); // Démarrage des étapes

localStorage.setItem("level", "9");
    
}