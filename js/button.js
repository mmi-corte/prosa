// buttonModule.js

export function ajouterBouton(conteneurId, txtBtn, btnId, btnClassName) {
    // Sélectionne la div par son ID
    const conteneur = document.getElementById(conteneurId);
    //verifi si la div existe
    if (!conteneur) {
        console.error(`Aucune div trouvée avec l'id "${conteneurId}"`);
        return;
    }

    // Crée un élément bouton
    const new_bouton = document.createElement("button");
    //bouton.className = "btn"; // Une manière simple d'ajouter une classe
    // bouton.classList.add("mon-bouton"); // Alternative pour ajouter une ou plusieurs classes dynamiquement

    // Définit le texte du bouton
    new_bouton.textContent = txtBtn;
    new_bouton.id = btnId;
    new_bouton.className=btnClassName;

    // Ajoute le bouton à la div
    conteneur.appendChild(new_bouton);

    return new_bouton
}

export function addBtnImg(conteneurId, urlImgBtn, btnId, className="btn-image") {
    // Sélectionne la div par son ID
    const conteneur = document.getElementById(conteneurId);
    
    // Vérifie si la div existe
    if (!conteneur) {
        console.error(`Aucune div trouvée avec l'id "${conteneurId}"`);
        return;
    }

    // Crée un élément img
    const btnImg = document.createElement("img");
    
    // Définit l'URL de l'image
    btnImg.src = urlImgBtn;

    // Définit l'ID de l'image
    btnImg.id = btnId;
    btnImg.className = className

    // Ajoute l'image au conteneur
    conteneur.appendChild(btnImg);
}
