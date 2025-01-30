import { refreshPage } from "./refreshPage.js";
import { addBtnImg, addInvisibleBtn, ajouterBouton } from './button.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxtNarration, addNameCharacter, addDiv } from './texte.js';

const chara = [`
            <!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/1b69fdd3-47b6-4e6d-be87-e3f260672761/berger%20V1%20premier%20plan.png?v=1734344342544"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/1b69fdd3-47b6-4e6d-be87-e3f260672761/berger%20V1%20plan%20milieu.png?v=1734344339129"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/1b69fdd3-47b6-4e6d-be87-e3f260672761/berger%20V1%20arri%C3%A8re%20plan.png?v=1734344345055"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,

            `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/d38faf7e-01c3-44e6-9906-e36768c14259/f%C3%A9e%20des%20plantes%20textur%C3%A9e%20V1.png?v=1734346180920"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,

            `<!-- premier plan (en avant) -->
                <a-image
                src="https://cdn.glitch.global/6edc1d7c-0499-4753-9956-9dfec8252444/f%C3%A9e%20de%20l'eau%20textur%C3%A9e%20v1%20premier%20plan.png?v=1734345000981"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="3 3 3"
                material="transparent: true; alphaTest: 0.5;"
                ></a-image>

                <a-image
                src="https://cdn.glitch.global/6edc1d7c-0499-4753-9956-9dfec8252444/f%C3%A9e%20de%20l'eau%20textur%C3%A9e%20v1%20background.png?v=1734344997628"
                position="0 -2 0"
                rotation="-90 0 0"
                scale="3 3 3"
                material="transparent: true; alphaTest: 0.5;"
                ></a-image>`,
            ]

export function playSteps(steps, index = 0, AR = false, marker = null) {

    if (!AR)
        {
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

                    btn.classList.add(btnClass);

                    // Ajouter le texte du choix
                    addTxtNarration(choice.text, btnId, '');

                    // Ajouter l'événement au bouton
                    btn.addEventListener("click", choice.action);

                });
            } else {
                console.log("passe à l'étape", index + 1);
                ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
                const btnNext = document.getElementById("btnNext");
                btnNext.addEventListener("click", () => playSteps(steps, index + 1));
            }
        }
        else
        {
            

            const container = document.getElementById("container");
            

            container.innerHTML = `
            <div id ="diagBox" class="diagBox"></div>
            <a-scene embedded
            arjs="debugUIEnabled: false; smooth: true; smoothCount: 10; smoothTolerance: 0.01; smoothThreshold: 5;"
            renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; sortObjects: true;"
            >

            <a-marker
                id="marker"
                preset="pattern"
                type="pattern"
                url="../assets/markers/marker${marker}.patt"
            >

            </a-marker>
                <a-entity camera position="0 0 0"></a-entity>
            </a-scene>
            `;
            container.style.background="none";
            document.body.style.background = "none";

            function charaChanger(index, steps){

                if (index >= steps.length) return; // Fin des étapes

                const step = steps[index];

            const charaContainer = document.querySelector("#marker");
            const diagBox = document.querySelector("#diagBox");
            diagBox.innerHTML = "";
            console.log(charaContainer);

            switch (step.character) {
                        case "BergerChara":
                            charaContainer.innerHTML = "";
                            charaContainer.innerHTML = chara[0];
                            break;
                        case "EsterelleChara":
                            charaContainer.innerHTML = "";
                            charaContainer.innerHTML = chara[1];
                            break;
                        case "FataChara":
                            charaContainer.innerHTML = "";
                            charaContainer.innerHTML = chara[2];
                            break;    
            }


            addTxtNarration(step.Txt, 'diagBox', 'dialogBox');
            ajouterBouton('diagBox', '', 'btnNext', 'btnInv');
            const btnNext = document.getElementById("btnNext");
            btnNext.addEventListener("click", () => charaChanger(index + 1, steps));

        }

        charaChanger(index, steps);
    }
}

