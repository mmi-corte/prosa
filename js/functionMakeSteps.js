import { refreshPage } from "./refreshPage.js";
import { ajouterBouton } from './button.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxtNarration, addNameCharacter, addDiv } from './texte.js';

export function playSteps(steps, index = 0) {
    if (index >= steps.length) return; // Fin des étapes

    const step = steps[index];
    refreshPage(); // Réinitialise la page

    // Ajoute l'image de fond
    addImgBackground("container", step.background);

    // Ajoute une boîte de dialogue
    const dialogClass = step.character ? 'diagBox' : 'diagBoxN'; // Utiliser diagBoxN pour narrateur, sinon diagBox
    addDiv('container', "diagBox", dialogClass); // Ajout de la classe correcte pour chaque étape

    // Ajoute le personnage si nécessaire
    if (step.character) {
        addImg("container", step.character, 'imgPerso');
    }

    // Ajoute le nom du personnage au-dessus de la boîte de dialogue
    if (step.name) {
        addNameCharacter(step.name, 'diagBox', 'nameCharacter'); // Le nom est ajouté dans le même div
    }

    // Ajoute le texte de narration ou du personnage
    addTxtNarration(step.narration, 'diagBox', 'dialogBox');

    // Gestion des choix ou du bouton "Suivant"
    if (step.choices) {
        step.choices.forEach((choice, i) => {
            const btnId = `btnChoix${i + 1}`;
            const btnClass = `choix${i + 1}`; // Classe spécifique pour chaque bouton

            // Ajouter un bouton avec le bon style
            ajouterBouton('diagBox', '', btnId, 'btnChoix');
            
            // Appliquer la classe spécifique au bouton
            const btn = document.getElementById(btnId);

            element.classList.add("txtClassName");
            
            btn.classList.add(btnClass);

            // Ajouter le texte du choix
            addTxtNarration(choice.text, btnId, '');

            // Ajouter l'événement au bouton
            btn.addEventListener("click", choice.action);

        });
    } else {
        console.log("passe à l'étape", index + 1);
        ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
        btnNext = document.getElementById("btnNext")
        btnNext.addEventListener("click", () => playSteps(steps, index + 1));
    }
}




