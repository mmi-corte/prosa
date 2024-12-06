//firebase
import { db } from '../firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// buttonModule.js
export function addTxt(conteneurId, content) {
    // Sélectionne la div par son ID
    const container = document.getElementById(conteneurId);
    // Vérifie si la div existe
    if (!container) { // Correction ici
        console.error(`Aucune div trouvée avec l'id "${conteneurId}"`);
        return;
    }
    
    // Crée un élément de texte (paragraphe)
    const txt = document.createElement("p");
    txt.className = "txt"; // Ajout d'une classe
    
    // Définit le contenu du paragraphe
    txt.textContent = content;

    // Ajoute le paragraphe à la div
    container.appendChild(txt);
}
export function addTxtWithBoldWord(containerId, textContent, boldWord) {
    const container = document.getElementById(containerId);

    // Vérifie si le conteneur est un élément valide
    if (!(container instanceof HTMLElement)) {
        console.error("Le conteneur fourni n'est pas un élément HTML valide.");
        return;
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



// Fonction pour récupérer un scénario basé sur un stepCode
export async function addTxtNarration(stepCode, conteneurId,txtClassName) {
    try {
        const querySnapshot = await getDocs(collection(db, "scenario"));
        querySnapshot.forEach((doc) => {
            if (doc.data().stepCode === stepCode) {
                // Trouver le conteneur par son ID et ajouter le texte
                const conteneur = document.getElementById(conteneurId);
                const text = document.createElement("p");
                text.textContent = doc.data().txt;
                text.className = txtClassName;
                conteneur.appendChild(text);
                console.log("Texte trouvé :", doc.data().txt);
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données Firestore :", error);
    }
}

// Fonction pour récupérer le nom du personnage
export async function addNameCharacter(stepCode, conteneurId,txtClassName) {
    try {
        const querySnapshot = await getDocs(collection(db, "scenario"));
        querySnapshot.forEach((doc) => {
            if (doc.data().stepCode === stepCode) {
                // Trouver le conteneur par son ID et ajouter le texte
                const conteneur = document.getElementById(conteneurId);
                const txtPerso = document.createElement("h2");
                txtPerso.textContent = doc.data().personnage;
                txtPerso.className = txtClassName;
                conteneur.appendChild(txtPerso);
                console.log("Texte trouvé :", doc.data().personnage);
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données Firestore :", error);
    }
}
export function addDiv(conteneurId, divId, divClassName) {
    const conteneur = document.getElementById(conteneurId);

    if (!conteneur) {
        console.error(`Conteneur avec l'ID '${conteneurId}' introuvable.`);
        return;
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
        console.error(`Aucun formulaire ou bouton trouvé avec les IDs "${formId}" et "${buttonId}"`);
        return;
    }

    // Écouteur d'événement pour le bouton
    button.addEventListener("click", async function (e) {
        e.preventDefault(); // Empêche la soumission du formulaire (rechargement de la page)

        // Récupérer la valeur du champ de texte
        const input = form.querySelector('input[type="text"]');
        if (!input) {
            console.error("Aucun champ de texte trouvé dans le formulaire.");
            return;
        }

        const pseudo = input.value.trim();
        if (pseudo === "") {
            alert("Veuillez entrer un pseudo !");
            return;
        }

        try {
            // Envoi des données à Firestore dans la collection 'utilisateurs'
            const docRef = await addDoc(collection(db, "utilisateurs"), {
                pseudo: pseudo, // Le pseudo saisi par l'utilisateur
                timestamp: new Date() // Ajouter un timestamp
            });
            console.log("Données enregistrées avec succès :", docRef.id);

            // Message de confirmation
            alert("Pseudo enregistré avec succès !");
            form.reset(); // Optionnel : Réinitialiser le formulaire après l'envoi
        } catch (error) {
            console.error("Erreur lors de l'ajout du document :", error);
            alert("Une erreur est survenue, veuillez réessayer.");
        }
    });
}