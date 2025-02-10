import { refreshPage } from "./refreshPage.js";
import { ajouterBouton } from "./button.js";
import { addImgBackground, addMediaBackground, addImg } from "./fonctionImg.js";
import { addTxtNarration, addNameCharacter, addDiv, addTxt } from "./texte.js";
import { log } from "./trace.js";
import { deleteSound, loadSound, setOnSound } from "./Sound/sound.js";
import { path_personnages } from "./paths.js";

const personnages = [
  `
            <!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Berger/berger.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}Berger/berger-V1-plan-milieu.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}Berger/berger-V1-arrière-plan.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,

  `<!-- premier plan  (en avant) -->
             <a-image
              src="${path_personnages}Esterelle/esterelle.png"
              position="0 -0.5 0"
              rotation="-90 0 0"
              scale="6 6 6"
              material="transparent: true; alphaTest: 0.5;"
              >
              </a-image>`,

  `<!-- premier plan (en avant) -->
               <a-image
               src="${path_personnages}A-Fata/premier-plan.png"
               position="0 -0.5 0"
               rotation="-90 0 0"
               scale="3 3 3"
               material="transparent: true; alphaTest: 0.5;"
               ></a-image>
               <a-image
               src="${path_personnages}A-Fata/second-plan.png"
               position="0 -2 0"
               rotation="-90 0 0"
               scale="3 3 3"
               material="transparent: true; alphaTest: 0.5;"
               ></a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image 
                src="${path_personnages}a_Strega/a-strega2-premier-plan.png" 
                position="0 0 0" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>

                <!-- deuxième plan (un peu plus loin) -->
                <a-image
                src="${path_personnages}a_Strega/a-strega2-deuxième-plan.png" 
                position="0 -0.5 0" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>

                <!-- troisième plan (encore plus loin) -->
                <a-image 
                src="${path_personnages}a_Strega/a-strega2-background-maison.png" 
                position="0 -1 0" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>
                <!-- quatrième plan (le plus éloigné) -->
                <a-image
                src="${path_personnages}a_Strega/a-strega2-background-soleil.png" 
                position="0 -1.5 -0.5" 
                rotation="-90 0 0" 
                scale="10 10 10"
                material="transparent: true; alphaTest: 0.5;">
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Sylvain/premier-plan.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="=${path_personnages}Sylvain/second-plan.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}Sylvain/troisieme-plan.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="2 2 2"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Fulettu/arbre.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>

                <a-image
                src="${path_personnages}Fulettu/personnage.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <a-image
                src="${path_personnages}Fulettu/montagne.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <a-image
                src="${path_personnages}Fulettu/soleil.png"
                position="0 -2 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->h
                <a-image
                src="${path_personnages}a-Sciacquaghjola/a_Sciacquaghjola_6.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}a-Sciacquaghjola/a_Sciacquaghjola_2.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}a-Sciacquaghjola/a_Sciacquaghjola_1.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="${path_personnages}a-Sciacquaghjola/a_Sciacquaghjola_5.png"
                position="0 -2 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Tarrasque/Tarasque-V3-premier plan-plante.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}Tarrasque/Tarasque-V3-arriere-plan-plante.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Orcu/premier-plan1.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}Orcu/second-plan.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}Orcu/trosieme-plan.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="${path_personnages}Orcu/quatrieme-plan.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Bagialiscu/premier-plan.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}Bagialiscu/second-plan.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}Bagialiscu/trosieme-plan.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="${path_personnages}Bagialiscu/fond.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}fuleton/premier-plan.png"
                position="0 -0.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}fuleton/second-plan.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                
                <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}fuleton/arriere-plan.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,
                
    `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Masco/1.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                 <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}Masco/2.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                 <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}Masco/3.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                <!-- quatrième plan  (en avant) -->
                <a-image
                src="${path_personnages}Masco/4.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                </a-image>
                <!-- cinquième plan  (en avant) -->
                <a-image
                src="${path_personnages}Masco/5.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>`,

  `<!-- premier plan  (en avant) -->
                <a-image
                src="${path_personnages}Santo-Marto/fond1.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                 <!-- deuxième plan  (en avant) -->
                <a-image
                src="${path_personnages}Santo-Marto/fond2.png"
                position="0 -1 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >
                </a-image>
                 <!-- troisième plan  (en avant) -->
                <a-image
                src="${path_personnages}Santo-Marto/fond3.png"
                position="0 -1.5 0"
                rotation="-90 0 0"
                scale="6 6 6"
                material="transparent: true; alphaTest: 0.5;"
                >`
];

export function playSteps(steps, index=0, AR=false, marker=null) {
  
  log(`Loading L${localStorage.getItem("level")}_E${index}`, "purple");

  if (index >= steps.length) return; // Fin des étapes

  const step = steps[index];

  if (!AR) {
  
    refreshPage(); // Réinitialise la page
  
    if (step) {
      if (step.sound) {
        // delete all song before start nex one
        deleteSound();  

        // load sound
        loadSound(step.sound, false);

      //   // play sound
      //   const SoundBtn = document.getElementById("SoundBtn");
      //   if (SoundBtn.src.includes("unmute")) {
      //     setOnSound();
      //   }
      }

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

      // Ajoute le texte de narration ou du personnage
      addTxtNarration(step.narration, "diagBox", "dialogBox");

      //Passe au niveau suivant
      if (step.nextLvl) {
        if (!document.getElementById("btnNext")) {
          // Vérifie si le bouton "Suivant" n'existe pas déjà
          ajouterBouton("diagBox", "", "btnNext", "btnInv"); // Crée le bouton "Suivant"
        }
        const btnNext = document.getElementById("btnNext");
        // btnNext.addEventListener("click", step.nextLvl); // Charge le niveau suivant
        
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
    // steps is dict
    } 
    // else {
      //Ajoute l'écan de la map si elle est dans
      
      // if (steps.maps) {
        // addTxt(
        //   steps.containerId,
        //   "Vous devez vous dirige vers la prochaine étape",
        //   "textTitle"
        // );

        // showStaticMap(steps);
        
        // ajouterBouton(
        //   steps.containerId,
        //   "Confimer votre arrivée",
        //   "btnNext",
        //   "btnclass"
        // );
      // }
    // }
    
  // AR part
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

    charaChanger(index, steps);

  }
}

function charaChanger(index, steps) {

  log(`Loading L${localStorage.getItem("level")}_E${index}`, "purple");

  if (index >= steps.length) {
    return;
  }

  const step = steps[index];
  const charaContainer = document.querySelector("#marker");
  const diagBox = document.querySelector("#diagBox");
  diagBox.innerHTML = "";

  // TODO: Remove this to manage the song directly in AR code
  if (step) {
    if (step.sound) {
      // delete all song before start nex one
      deleteSound();  

      // load sound
      loadSound(step.sound, false);

      // play sound
      const SoundBtn = document.getElementById("SoundBtn");
      if (SoundBtn.src.includes("unmute")) {
        setOnSound();
      }
    }
  }

  charaContainer.innerHTML = "";

  switch (step.character) {
    case "BergerChara":
      charaContainer.innerHTML = personnages[0];
      break;
    case "EsterelleChara":
      charaContainer.innerHTML = personnages[1];
      break;
    case "FataChara":
      charaContainer.innerHTML = personnages[2];
      break;
    case "StregaChara":
      charaContainer.innerHTML = personnages[3];
      break;
    case "SylvainChara":
      charaContainer.innerHTML = personnages[4];
      break;
    case "FulettuChara":
      charaContainer.innerHTML = personnages[5];
      break;
    case "SciacquaghjolaChara":
      charaContainer.innerHTML = personnages[6];
      break;
    case "TarrasqueChara":
      charaContainer.innerHTML = personnages[7];
      break;
    case "OrcuChara":
      charaContainer.innerHTML = personnages[8];
      break;
    case "BasgialiscuChara":
      charaContainer.innerHTML = personnages[9];
      break;
    case "MascoChara":
      charaContainer.innerHTML = personnages[10];
      break;
    case "NaraChara":
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

    if (step.Txt) {
      addTxtNarration(step.Txt, "diagBox", "dialogBox");
    }

    ajouterBouton("diagBox", "", "btnNext", "btnInv");
    
    const btnNext = document.getElementById("btnNext");
    btnNext.addEventListener("click", step.nextLvl);

  } else {
    
    if (step.name) {
      if (step.Txt == "Narrateur") {
        const diagBox = document.querySelector("#diagBox");
        diagBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        diagBox.style.color = "rgb(255, 255, 255)";
      } else {
        addNameCharacter(step.Txt, "diagBox", "nameCharacter"); // Le nom est ajouté dans le même div
      }
    }

    if (step.Txt) {
      addTxtNarration(step.Txt, "diagBox", "dialogBox");
    }

    ajouterBouton("diagBox", "", "btnNext", "btnInv");
    const btnNext = document.getElementById("btnNext");
    // recursion
    btnNext.addEventListener("click", () => charaChanger(index + 1, steps));
  }
}