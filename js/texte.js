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
export async function recupererScenarioParStepCode(stepCode, conteneurId,txtClassName) {
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