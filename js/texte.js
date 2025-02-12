import { popup } from "./popup.js";
import { getTextByStepCode, getPersonnageByStepCode } from "./jsonLoader.js";

// buttonModule.js
export function addTxt(conteneurId, content, classNameTxt) {
    // Sélectionne la div par son ID
    const container = document.getElementById(conteneurId);
    // Vérifie si la div existe
    if (!container) { // Correction ici
        console.error(`Aucune div trouvée avec l'id "${conteneurId}"`);
        return;
    }
    
    // Crée un élément de texte (paragraphe)
    const txt = document.createElement("p");
    txt.className = classNameTxt ; // Ajout d'une classe
    
    // Définit le contenu du paragraphe
    txt.textContent = content;

    // Ajoute le paragraphe à la div
    container.appendChild(txt);
}

export function addH1(containerId,textContent,className){
    // Sélectionne la div par son ID
    const container = document.getElementById(containerId);
  
    // Crée un élément de texte (paragraphe)
    const txt = document.createElement("h1");
    txt.className = className ; // Ajout d'une classe
    
    // Définit le contenu du paragraphe
    txt.textContent = textContent;

    // Ajoute le paragraphe à la div
    container.appendChild(txt);
}

export function addTxtWithBoldWord(containerId, textContent, boldWord) {
    const container = document.getElementById(containerId);

    // Vérifie si le conteneur est un élément valide
    if (!(container instanceof HTMLElement)) {
        throw new Error("Le conteneur fourni n'est pas un élément HTML valide.");
    }

    // Création de la balise texte (par exemple, une balise <p>)
    const textElement = document.createElement("p");

    // Ajoute automatiquement la classe 'txt'
    textElement.classList.add("txt");

    // Remplace les occurrences du mot en gras
    const textParts = textContent.split(new RegExp(`(${boldWord})`, 'gi'));

    textParts.forEach((part) => {
        if (part.toLowerCase() === boldWord.toLowerCase()) {
            // Si c'est le mot à mettre en gras
            const boldElement = document.createElement("strong");
            boldElement.textContent = part;
            textElement.appendChild(boldElement);
        } else {
            // Remplace les caractères \n par des sauts de ligne
            part.split('\n').forEach((line, index, array) => {
                textElement.appendChild(document.createTextNode(line));
                if (index < array.length - 1) {
                    textElement.appendChild(document.createElement("br"));
                }
            });
        }
    });

    // Ajoute l'élément texte au conteneur
    container.appendChild(textElement);
}
//---------------------------------------------------
// firestoreFunctions.js (ou main.js si vous préférez tout garder dans un seul fichier)


function typeWriter(text, element, txtClassName, speed = 100, callback = null) {
    element.textContent = ""; // Réinitialise le contenu
    element.classList.add(txtClassName);
    let index = 0;

    function writeCharacter() {
        if (index < text.length) {
            element.textContent += text.charAt(index); // Ajoute un caractère au contenu
            index++;

            setTimeout(writeCharacter, speed); // Appelle la fonction après un délai
        } else if (callback) {
            // Si le callback est fourni, on l'appelle après avoir terminé l'écriture
            callback();
        }
    }

    writeCharacter(); // Démarre l'effet
}


// Fonction pour récupérer un scénario basé sur un stepCode
export async function addTxtNarration(stepCode, conteneurId, txtClassName) {

    // stepCode doit être une chaîne de caractères
    if (typeof stepCode !== "string") {
        if (typeof stepCode === "function") {
            stepCode();
        } else {
            console.error("stepCode est incorrect!");
        }
    } else {

        const conteneur = document.getElementById(conteneurId);
        if (!conteneur) {
            throw new Error(`Le conteneur avec l'ID "${conteneurId}" est introuvable.`);
        }

        try {

            // get data from Json file
            const dialog_txt = await getTextByStepCode(stepCode);

            const p = document.createElement("p");
            if(txtClassName == '') {
                p.textContent = dialog_txt;
                p.className = txtClassName;

            } else {
                typeWriter(dialog_txt, p, txtClassName, 50, ()=> {
                    // Fonction qui ajoutera un chevron au milieu droit de la boîte .diagBox
                    function addChevronToDiagBox(containerID) {
                        // Sélectionner l'élément container par son ID (qui est .diagBox)
                        const container = document.getElementById(containerID);
                        
                        // Vérifier si l'élément existe
                        if (!container) {
                            console.error(`Aucun élément trouvé avec l'ID "${containerID}"`);
                            return;
                        }

                        // Créer un élément <span> pour le chevron
                        const chevron = document.createElement('span');
                        
                        // Ajouter une classe pour le style du chevron
                        chevron.classList.add('chevron-up', 'blinking'); // Ajouter la classe 'blinking' pour l'animation
    
                        
                        // Si tu veux ajouter un caractère de chevron :
                        chevron.innerHTML = '<img id="next" src="assets/icons/arrows.svg" alt="Chevron" style="width: 30px; height: auto;">'; 


                        // Positionner le chevron au centre du côté droit
                        chevron.style.position = 'absolute';
                        chevron.style.top = '50%'; // Centré verticalement
                        chevron.style.right = '0px'; // Aligné à droite
                        chevron.style.transform = 'translateY(-50%)'; // Ajuste le centrage vertical
                        chevron.style.fontSize = '24px'; // Taille du chevron
                        chevron.style.cursor = 'pointer'; // Changer le curseur au survol

                        // Ajouter le chevron à la containerID
                        container.appendChild(chevron);

                        // Ajout d'une interaction : au clic, tu peux ajouter une action spécifique
                        // chevron.addEventListener('click', () => {
                        //     console.log('Chevron cliqué');
                        //     // Appel d'une action après clic (par exemple, faire défiler ou cacher l'élément)
                        // });
                    }

                    // Appel de la fonction avec l'ID de ton élément (par exemple, "diagBox")
                    addChevronToDiagBox('btnNext');

                });
            };

            conteneur.appendChild(p);
            
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des données Firestore : ${error}`);
        }
    }
}

// Fonction pour récupérer le nom du personnage
export async function addNameCharacter(stepCode, conteneurId, txtClassName) {
    try {
  
            const personnage_name = await getPersonnageByStepCode(stepCode);
            const conteneur = document.getElementById(conteneurId);
            if (conteneur) {
                const txtPerso = document.createElement("h2");
                txtPerso.textContent = personnage_name.toUpperCase(); // Convertir en majuscules
                txtPerso.className = txtClassName;
                conteneur.appendChild(txtPerso);
                
            } else {
                throw new Error(`Conteneur avec l'ID ${conteneurId} introuvable.`);
            }
          
    } catch (error) {
        throw new Error("Erreur lors de la récupération des données Firestore :");
    }
}

export function addDiv(conteneurId, divId, divClassName) {
    const conteneur = document.getElementById(conteneurId);

    if (!conteneur) {
        throw new Error(`Conteneur avec l'ID '${conteneurId}' introuvable.`);
    }

    // Crée l'élément div
    const nouvelleDiv = document.createElement("div");
    nouvelleDiv.id = divId;
    nouvelleDiv.className = divClassName;
    
    // Ajoute la div au conteneur
    conteneur.appendChild(nouvelleDiv);
   
}

export async function handleFormSubmit(formId, buttonId) {
    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);

    // Vérification si le formulaire et le bouton existent
    if (!form || !button) {
        throw new Error(`Aucun formulaire ou bouton trouvé avec les IDs "${formId}" et "${buttonId}"`);
    }

    // Écouteur d'événement pour le bouton
    button.addEventListener("click", async function (e) {
        e.preventDefault(); // Empêche la soumission du formulaire (rechargement de la page)

        // Récupérer la valeur du champ de texte
        const input = form.querySelector('input[type="text"]');
        if (!input) {
            throw new Error("Aucun champ de texte trouvé dans le formulaire.");
        }

        const pseudo = input.value.trim();
        if (pseudo === "") {
            popup("Veuillez entrer un pseudo !");
        }

        try {
            // Envoi des données à Firestore dans la collection 'utilisateurs'
            const docRef = await addDoc(collection(db, "utilisateurs"), {
                pseudo: pseudo, // Le pseudo saisi par l'utilisateur
                timestamp: new Date() // Ajouter un timestamp
            });
            console.log("Données enregistrées avec succès :", docRef.id);

            // Message de confirmation
            popup("Pseudo enregistré avec succès !");
            form.reset(); // Optionnel : Réinitialiser le formulaire après l'envoi
        } catch (error) {
            console.error("Erreur lors de l'ajout du document :", error);
            popup("Une erreur est survenue, veuillez réessayer.");
        }
    });
}

// fonction qui recupere le texte et qui est liée au chargement de l'AR
export async function addTxtNarrationAR(stepCode, aTextId, className) { 
    try {
        
            const dialog_txt = await getTextByStepCode(stepCode);
            const aTextElement = document.getElementById(aTextId);
            if (aTextElement) {
                // Ajout d'un écouteur pour l'événement `loaded`
                aTextElement.addEventListener("loaded", () => {
                    // Mise à jour du texte dans l'attribut `value`
                    aTextElement.setAttribute("value", dialog_txt);

                    // Ajout de la classe
                    if (className) {
                        aTextElement.classList.add(className);
                    }

                    console.log("Texte ajouté :", dialog_txt);
                });
            } else {
                throw new Error(`Balise <a-text> avec l'ID ${aTextId} non trouvée.`);
            }
            
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des données Firestore : ${error}`);
    }
}

export async function addNamePersoAR(stepCode, aTextId, className) { 
    try {
            const personnage_name = await getPersonnageByStepCode(stepCode);
            const aTextElement = document.getElementById(aTextId);
            if (aTextElement) {
                // Ajout d'un écouteur pour l'événement `loaded`
                aTextElement.addEventListener("loaded", () => {
                    // Mise à jour du texte dans l'attribut `value`
                    aTextElement.setAttribute("value", personnage_name);

                    // Ajout de la classe
                    if (className) {
                        aTextElement.classList.add(className);
                    }

                    console.log("Texte ajouté :", personnage_name);
                });

            } else {
                throw new Error(`Balise <a-text> avec l'ID ${aTextId} non trouvée.`);
            }

    } catch (error) {
        throw new Error(`Erreur lors de la récupération des données Firestore : ${error}`);
    }
}
