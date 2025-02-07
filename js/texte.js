import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { popup } from "./popup.js";

let querySnapshot;

// buttonModule.js
export function addTxt(conteneurId, content,classNameTxt) {
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


function typeWriter(text, element, txtClassName, speed = 100) {
    element.textContent = ""; // Réinitialise le contenu
    element.classList.add(txtClassName);
    let index = 0;

    function writeCharacter() {
        if (index < text.length) {
            element.textContent += text.charAt(index); // Ajoute un caractère au contenu
            
            index++;

            setTimeout(writeCharacter, speed); // Appelle la fonction après un délai
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
            if (!querySnapshot) {
                querySnapshot = await getDocs(collection(db, "scenario"));
            };

            const docFound = querySnapshot.docs.find(doc => doc.data().stepCode === stepCode);
            
            // if stepCode not found, use stepCode as text content
            let data; 
            if (!docFound) {
                data = stepCode;
                console.warn(`Aucun scénario trouvé pour le stepCode "${stepCode}".`);
            } else {
                data = docFound.data().txt;
            }

            const p = document.createElement("p");
            if(txtClassName == '') {
                p.textContent = data;
                p.className = txtClassName;

            } else {
                typeWriter(data, p, txtClassName, 50);
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

        if (!querySnapshot) {
            querySnapshot = await getDocs(collection(db, "scenario"));
        };
        querySnapshot.forEach((doc) => {
            if (doc.data().stepCode === stepCode) {
                // Trouver le conteneur par son ID et ajouter le texte
                const conteneur = document.getElementById(conteneurId);
                if (conteneur) {
                    const txtPerso = document.createElement("h2");
                    txtPerso.textContent = doc.data().personnage.toUpperCase(); // Convertir en majuscules
                    txtPerso.className = txtClassName;
                    conteneur.appendChild(txtPerso);
                    
                } else {
                    throw new Error(`Conteneur avec l'ID ${conteneurId} introuvable.`);
                }
            }
        });
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
        if (!querySnapshot) {
            querySnapshot = await getDocs(collection(db, "scenario"));
        };

        querySnapshot.forEach((doc) => {
            if (doc.data().stepCode === stepCode) {
                const aTextElement = document.getElementById(aTextId);
                if (aTextElement) {
                    // Ajout d'un écouteur pour l'événement `loaded`
                    aTextElement.addEventListener("loaded", () => {
                        // Mise à jour du texte dans l'attribut `value`
                        aTextElement.setAttribute("value", doc.data().txt);

                        // Ajout de la classe
                        if (className) {
                            aTextElement.classList.add(className);
                        }

                        console.log("Texte ajouté :", doc.data().txt);
                    });
                } else {
                    throw new Error(`Balise <a-text> avec l'ID ${aTextId} non trouvée.`);
                }
            }
        });
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des données Firestore : ${error}`);
    }
}

export async function addNamePersoAR(stepCode, aTextId, className) { 
    try {
        if (!querySnapshot) {
         querySnapshot = await getDocs(collection(db, "scenario"));
        };

         querySnapshot.forEach((doc) => {
            if (doc.data().stepCode === stepCode) {
                const aTextElement = document.getElementById(aTextId);
                if (aTextElement) {
                    // Ajout d'un écouteur pour l'événement `loaded`
                    aTextElement.addEventListener("loaded", () => {
                        // Mise à jour du texte dans l'attribut `value`
                        aTextElement.setAttribute("value", doc.data().personnage);

                        // Ajout de la classe
                        if (className) {
                            aTextElement.classList.add(className);
                        }

                        console.log("Texte ajouté :", doc.data().personnage);
                    });

                } else {
                    throw new Error(`Balise <a-text> avec l'ID ${aTextId} non trouvée.`);
                }
            }
        });

    } catch (error) {
        throw new Error(`Erreur lors de la récupération des données Firestore : ${error}`);
    }
}
