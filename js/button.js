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
// a voir si on modifit pas la function add button ???
export function addInvisibleBtn(containerID, buttonID) {
    // Select the container by its ID
    const container = document.getElementById(containerID);

    // Check if the container exists
    if (!container) {
        console.error(`No container found with ID "${containerID}"`);
        return;
    }

    // Create the button element
    const button = document.createElement("button");

    // Set the button ID
    button.id = buttonID;

    // Apply styles to make the button invisible
    button.style.background = "none";
    button.style.border = "none";
    button.style.padding = "0";
    button.style.margin = "0";
    button.style.width = "50%"; // Example size, adjust as needed
    button.style.height = "100VH";
    button.style.display = "flex";
    button.style.justifyContent = 'end';

    button.style.cursor = "pointer"; // Makes it clickable
    button.style.opacity = "0"; // Completely invisible


    // Append the button to the container
    container.appendChild(button);
}

export function addBtnImg(conteneurId, urlImgBtn, btnId) {
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

    // Ajoute une classe pour styliser l'image si nécessaire (facultatif)
    btnImg.className = "btn-image";

    // Ajoute l'image au conteneur
    conteneur.appendChild(btnImg);

    console.log(`Image avec l'ID "${btnId}" ajoutée au conteneur "${conteneurId}".`);
}
