import { refreshPage } from "./refreshPage.js";
import { ajouterBouton } from "./button.js";
import { addImgBackground, addMediaBackground, addImg } from "./fonctionImg.js";
import { addTxtNarration, addNameCharacter, addDiv, addTxt } from "./texte.js";
import { log } from "./trace.js";
import { showStaticMap } from "./map.js";

const personnages = [
  `
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
  `<!-- premier plan  (en avant) -->
                <a-image 
                src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega2-premier%20plan.png?v=1734341061681" 
                position="0 0 0" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>

                <!-- deuxième plan (un peu plus loin) -->
                <a-image
                src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega2-sujet%20(milieu).png?v=1734341063827" 
                position="0 -0.5 0" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>

                <!-- troisième plan (encore plus loin) -->
                <a-image 
                src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega2-background%20maison.png?v=1734341057146" 
                position="0 -1 0" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>
                <!-- quatrième plan (le plus éloigné) -->
                <a-image
                src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega3-background%20soleil.png?v=1734341748536" 
                position="0 -1.5 -0.5" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/2b8c8b55-9c74-4faf-b4c8-d0db196ea145/premier%20plan.png?v=1734345923869"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/2b8c8b55-9c74-4faf-b4c8-d0db196ea145/second%20plan.png?v=1734345924943"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/2b8c8b55-9c74-4faf-b4c8-d0db196ea145/troisieme%20plan.png?v=1734345926329"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="2 2 2"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/de3037ae-fec7-44e8-9622-a20736f62f2b/personnage.png?v=1734624420467"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>

                <a-image
                src="https://cdn.glitch.global/de3037ae-fec7-44e8-9622-a20736f62f2b/arbre.png?v=1734624506224"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <a-image
                src="https://cdn.glitch.global/de3037ae-fec7-44e8-9622-a20736f62f2b/montagne.png?v=1734624436540"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <a-image
                src="https://cdn.glitch.global/de3037ae-fec7-44e8-9622-a20736f62f2b/soleil.png?v=1734624442024"
                position="0 -2 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/68c71a06-3c13-4a4b-b099-67f4abc0f7ed/a_Sciacquaghjola_6.png?v=1734614329385"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/68c71a06-3c13-4a4b-b099-67f4abc0f7ed/a_Sciacquaghjola_2.png?v=1734614335968"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/68c71a06-3c13-4a4b-b099-67f4abc0f7ed/a_Sciacquaghjola_1.png?v=1734614340899"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/68c71a06-3c13-4a4b-b099-67f4abc0f7ed/a_Sciacquaghjola_5.png?v=1734614332310"
                position="0 -2 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/86015dbb-1327-4ad6-8054-6e776b3f1bd4/Tarasque-V3-premier%20plan-plante.png?v=1734343035907"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/86015dbb-1327-4ad6-8054-6e776b3f1bd4/Tarasque-V3-arri%C3%A8re%20plan-tarasque.png?v=1734343033491"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/ce3019bc-7841-48cd-83b4-90ebaaaec5ff/premier%20plan1.png?v=1734337411745"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/ce3019bc-7841-48cd-83b4-90ebaaaec5ff/second%20plan.png?v=1734337416705"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/ce3019bc-7841-48cd-83b4-90ebaaaec5ff/troisieme%20plan.png?v=1734337419034"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/ce3019bc-7841-48cd-83b4-90ebaaaec5ff/quatrieme%20plan.png?v=1734337413648"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/4850b110-e117-4a72-bdb2-1ae577770264/premier%20plan.png?v=1734342706939"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/4850b110-e117-4a72-bdb2-1ae577770264/second%20plan.png?v=1734342708861"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/4850b110-e117-4a72-bdb2-1ae577770264/troisieme%20plan.png?v=1734342710331"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/4850b110-e117-4a72-bdb2-1ae577770264/fond.png?v=1734342703931"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/5fe242c3-4e4d-4beb-b573-16252cb32f99/1.png?v=1736171753100"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/16ef3a14-1c6d-442f-bf4f-1fc5e388c3da/second%20plan.png?v=1734614638342"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/16ef3a14-1c6d-442f-bf4f-1fc5e388c3da/troisieme%20plan.png?v=1734614635463"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="https://cdn.glitch.global/16ef3a14-1c6d-442f-bf4f-1fc5e388c3da/quatrieme%20plan.png?v=1734614629652"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
];

export function playSteps(steps, index = 0, AR = false, marker = null) {
  if (!AR) {
    if (index >= steps.length) return; // Fin des étapes

    const step = steps[index];
    refreshPage(); // Réinitialise la page

    // Ajoute le fond d'écran ou la vidéo de fond en fonction de l'URL fournie dans l'étape actuelle
    const isImg = /\.(png|jpeg|svg|jpg)$/i.test(step.background);

    if (isImg) {
      // Ajoute l'image de fond
      addImgBackground("container", step.background);
    } else {
      // Ajoute la video de fond
      addMediaBackground("container", step.background);
    }

    // Ajoute une boîte de dialogue
    const dialogClass = step.character ? "diagBox" : "diagBoxN"; // Utiliser diagBoxN pour narrateur, sinon diagBox
    addDiv("container", "diagBox", dialogClass); // Ajout de la classe correcte pour chaque étape

    // Ajoute le personnage si nécessaire
    if (step.character) {
      addImg("container", step.character, "imgPerso");
    }

    // Ajoute le nom du personnage au-dessus de la boîte de dialogue
    if (step.name) {
      addNameCharacter(step.name, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
    }

    //Ajoute l'écan de la map si elle est dans
    if (step.map) {
      addTxt(
        "container",
        "Vous devez vous dirige vers la prochaine étape",
        "textTitle"
      );
      showStaticMap(step.map);
      ajouterBouton("container", "Confimer votre arrivée","btnNext", 'btnclass');
    }

    // Ajoute le texte de narration ou du personnage
    addTxtNarration(step.narration, "diagBox", "dialogBox");
    
    //Passe au niveau suivant
    if (step.nextLvl) {
      if (!document.getElementById("btnNext")) {
        // Vérifie si le bouton "Suivant" n'existe pas déjà
        ajouterBouton("diagBox", "", "btnNext", "btnInv"); // Crée le bouton "Suivant"
      }
      const btnNext = document.getElementById("btnNext");
      btnNext.addEventListener("click", step.nextLvl); // Charge le niveau suivant
    } else {
      // Gestion des choix ou du bouton "Suivant"
      if (step.choices) {
        step.choices.forEach((choice, i) => {
          const btnId = `btnChoix${i + 1}`;
          const btnClass = `choix${i + 1}`; // Classe spécifique pour chaque bouton

          // Ajouter un bouton avec le bon style
          ajouterBouton("diagBox", "", btnId, "btnChoix");

          // Appliquer la classe spécifique au bouton
          const btn = document.getElementById(btnId);
          btn.classList.add(btnClass);

          if (step.name) {
            addNameCharacter(step.name, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
          }
          // Ajouter le texte du choix
          addTxtNarration(choice.text, btnId, "");

          // Ajouter l'événement au bouton
          btn.addEventListener("click", choice.action);
        });
      } else {
        // Ajouter le bouton "Suivant" si aucune étape de choix n'est présente
        if (!document.getElementById("btnNext")) {
          // Vérifie si le bouton "Suivant" n'existe pas déjà
          ajouterBouton("diagBox", "", "btnNext", "btnInv"); // Crée le bouton "Suivant"
        }
        const btnNext = document.getElementById("btnNext");
        btnNext.addEventListener("click", () => playSteps(steps, index + 1)); // Passe à l'étape suivante
      }
    }
  } else {
    const container = document.getElementById("container");

    container.innerHTML = `
            <div id ="diagBox" class="diagBox"></div>
            <a-scene embedded 
            arjs="debugUIEnabled: false; smooth: true; smoothCount: 10; smoothTolerance: 0.01; smoothThreshold: 5; detectionMode: mono_and_matrix; matrixCodeType: 4x4;"
            renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; sortObjects: true;"
            >

            <a-marker
                id="marker"
                preset="pattern"
                type="pattern"
                url="assets/markers/marker${marker}.patt"
            >

            </a-marker>
                <a-entity camera position="0 0 0"></a-entity>
            </a-scene>
            `;

        container.style.background = "none";
        document.body.style.background = "none";

    function charaChanger(index, steps) {
      if (index >= steps.length) return; // Fin des étapes

      log(`Loading L${localStorage.getItem("level") + 1}.E${i}`, "purple");

            log(`Loading L${localStorage.getItem("level")+1}.E${index}`, "purple");

      const charaContainer = document.querySelector("#marker");
      const diagBox = document.querySelector("#diagBox");
      diagBox.innerHTML = "";
      log(charaContainer);

      switch (step.character) {
        case "BergerChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[0];
          break;
        case "EsterelleChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[1];
          break;
        case "FataChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[2];
          break;
        case "StregaChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[3];
          break;
        case "SylvainChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[4];
          break;
        case "FulettuChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[5];
          break;
        case "SciacquaghjolaChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[6];
          break;
        case "TarrasqueChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[7];
          break;
        case "OrcuChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[8];
          break;
        case "BasgialiscuChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[9];
          break;
        case "MascoChara":
          charaContainer.innerHTML = "";
          charaContainer.innerHTML = personnages[10];
          break;
        case "NaraChara":
          charaContainer.innerHTML = "";
          break;
      }

      // Gestion des choix ou du bouton "Suivant"
      if (step.choices) {
        step.choices.forEach((choice, i) => {
          const btnId = `btnChoix${i + 1}`;
          const btnClass = `choix${i + 1}`; // Classe spécifique pour chaque bouton

          // Ajouter un bouton avec le bon style
          ajouterBouton("diagBox", "", btnId, "btnChoix");

          // Appliquer la classe spécifique au bouton
          const btn = document.getElementById(btnId);

          btn.classList.add(btnClass);

          if (step.name) {
            addNameCharacter(step.name, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
          }
          // Ajouter le texte du choix
          addTxtNarration(choice.text, btnId, "");

          // Ajouter l'événement au bouton
          btn.addEventListener("click", choice.action);
        });
      } else if (step.nextLvl) {
        if (step.name) {
          addNameCharacter(step.name, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
        }
        addTxtNarration(step.Txt, "diagBox", "dialogBox");
        ajouterBouton("diagBox", "", "btnNext", "btnInv");
        const btnNext = document.getElementById("btnNext");
        btnNext.addEventListener("click", step.nextLvl);
      } else {
        if (step.name) {
          if (step.Txt == "Narrateur") {
            addNameCharacter(step.Txt, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
            addTxtNarration(step.Txt, "diagBox", "dialogBox");
            const diagBox = document.querySelector("#diagBox");
            diagBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            diagBox.style.color = "rgb(255, 255, 255)";
          } else {
            addNameCharacter(step.Txt, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
            addTxtNarration(step.Txt, "diagBox", "dialogBox");
          }
        }

        ajouterBouton("diagBox", "", "btnNext", "btnInv");
        const btnNext = document.getElementById("btnNext");
        btnNext.addEventListener("click", () => charaChanger(index + 1, steps));
      }
    }

    charaChanger(index, steps);
  }
}
