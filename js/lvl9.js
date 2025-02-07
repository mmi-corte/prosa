import { path_narration, path_personnages } from "./paths.js";

export function loadLvl9() {

   // Liste des étapes du niveau 1
   const steps = [
    { background: 'assets/bg/fondEtape9.mp4', narration: "E9Narra", character: null },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Berger", character: path_personnages+'Berger/berger.png', name: 'E3Berger' },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Narra2", character: null },
    { background: 'assets/bg/fondEtape9.png', narration: "E9Berger2", character: path_personnages+'Berger/berger.png', name: 'E3Berger1' },
    { background: 'assets/bg/fondEtape9.png', choices: [ { text: "E9Mess", action: loadLvl10 } ], character: null , },
];

playSteps(steps); // Démarrage des étapes

localStorage.setItem("level", "9");
    
}