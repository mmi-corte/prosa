import { playSteps } from './functionMakeSteps.js';

import { setCookie } from './cookieHandler.js';
import { popup } from './popup.js';
import { loadLvl3 } from './lvl3.js';


export function loadLvl1bis() {

    const steps = [
        { background: 'assets/bg/fondEtape1bis.mp4', narration: "E1BNarra", character: null },
        { background: 'assets/bg/fondEtape1bis.mp4', narration: "E1BBerger", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1BBerger' },
        { background: 'assets/bg/fondEtape1bis.mp4', narration: "E1BNarra2", character: null },
        {
            background: 'assets/bg/fondEtape1bis.mp4',
            narration: () => {
                popup("Vous avez récupéré la branche d’arbre", "../assets/items/branche.png");
            },
            character: null
        },
        {
            background: 'assets/bg/fondEtape1bis.mp4',
            narration: "E1BNarra3",
            character: null,
            choices: [
                { text: "Aller au niveau 2", action: () => console.log("Choix : Aller au niveau 2") },
                { text: "Aller au niveau 3", action: loadLvl3 }
            ]
        }
    ];

    // Lance les étapes
    playSteps(steps);

     // update screen cookie
     setCookie("level", "1bis", 7, "/"); 
}