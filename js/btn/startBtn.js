// buttonModule.js
export function ajouterBouton(conteneurId) {
    // Sélectionne la div par son ID
    const conteneur = document.getElementById(conteneurId);

    //verifi si la div existe
    if (!conteneur) {
        console.error(`Aucune div trouvée avec l'id "${conteneurId}"`);
        return;
    }
    
    // Crée un élément bouton
    const bouton = document.createElement("button");
    bouton.className = "btn"; // Une manière simple d'ajouter une classe
    // bouton.classList.add("mon-bouton"); // Alternative pour ajouter une ou plusieurs classes dynamiquement
    
    // Définit le texte du bouton
    bouton.textContent = "Start";
    bouton.id = "btnStart"
   
    
    // Ajoute le bouton à la div
    conteneur.appendChild(bouton);
}
