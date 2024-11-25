// buttonModule.js
export function addTxt(conteneurId) {
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
    txt.textContent = `Dans une vallée verdoyante, un jeune dinosaure nommé Téo, un tricératops curieux, s'éveillait au premier rayon du soleil. 
    Son monde était immense, rempli de montagnes imposantes, de rivières scintillantes et de forêts denses où les fougères géantes dansaient avec le vent. 
    Chaque jour, Téo partait à l’aventure, ses trois cornes pointées vers l’horizon. Il adorait découvrir de nouvelles plantes à déguster et observer les autres dinosaures, 
    qu’ils soient les immenses brontosaures ou les redoutables tyrannosaures, qu’il préférait admirer de loin.`;

    // Ajoute le paragraphe à la div
    container.appendChild(txt);
}
export function addTxtWithBoldWord(containerId, text, boldWord) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`No element found with id "${containerId}"`);
        return;
    }

    // Split the text into parts around the bold word
    const parts = text.split(boldWord);

    // Iterate over the parts to rebuild the text with the bold word
    for (let i = 0; i < parts.length; i++) {
        // Add the normal text part
        container.appendChild(document.createTextNode(parts[i]));

        // Add the bold word except after the last part
        if (i < parts.length - 1) {
            const boldText = document.createElement("strong");
            boldText.textContent = boldWord;

            // Add a class for styling if needed
            boldText.className = "bold";
            container.appendChild(boldText);
        }
    }
}



