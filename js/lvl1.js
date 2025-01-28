import { refreshPage } from "./refreshPage.js";
import { addBtnImg, addInvisibleBtn, ajouterBouton } from './button.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxtNarration, addNameCharacter, addDiv } from './texte.js';
import { loadLvl2 } from "./lvl2.js";
import { loadLvl3 } from "./lvl3.js";

export function loadLvl1() {
    // Liste des étapes du niveau 1
    const steps = [
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger' },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra1", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger1", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger1' },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra2", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger2", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger2' },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra3", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger3", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger3' },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra4", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger4", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger4' },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra5", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger5", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger5' },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Narra6", character: null },
        { background: 'assets/bg/fondEtape1.jpg', narration: "E1Berger6", character: 'assets/personnages/berger V1 premier plan.png', name: 'E1Berger6' },
        {
            background: 'assets/bg/fondEtape1.jpg',
            narration: "E1Narra7",
            character: null,
            choices: [
                { text: "E1Choix1", action: loadLvl2 },
                { text: "E1Choix2", action: loadLvl3 }
            ]
        }
    ];

    playSteps(steps); // Démarrage des étapes
    //setCookie("level", "1", 7, "/");
}

function playSteps(steps, index = 0) {
    if (index >= steps.length) return; // Fin des étapes

    const step = steps[index];
    refreshPage(); // Réinitialise la page

    // Ajoute l'image de fond
    addImgBackground("container", step.background);

    // Ajoute le personnage si nécessaire
    if (step.character) {
        addImg("container", step.character, 'imgPerso');
    }

    // Ajoute une boîte de dialogue
    addDiv('container', "diagBox", 'diagBoxN');

    // Ajoute le nom du personnage directement au-dessus de la boîte de dialogue
    if (step.name) {
        addNameCharacter(step.name, 'diagBox', 'nameCharacter'); // Directement dans diagBox
    }

    // Ajoute le texte de narration
    addTxtNarration(step.narration, 'diagBox', 'dialogBox');

    // Gestion des choix ou du bouton "Suivant"
    if (step.choices) {
        step.choices.forEach((choice, i) => {
            const btnId = `btnChoix${i + 1}`;
            ajouterBouton('diagBox', '', btnId, 'btnChoix');
            addTxtNarration(choice.text, btnId, '');
            document.getElementById(btnId).addEventListener("click", choice.action);
        });
    } else {
        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
        document.getElementById("btnNext").addEventListener("click", () => playSteps(steps, index + 1));
    }
}




