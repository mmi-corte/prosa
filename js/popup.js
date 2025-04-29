import { checkImageExists } from "./functions.js";
// import { createStaticMap } from "./map.js";

export function popup(txt, imgSrc = "") {
    // Find or create a container compatible with AR mode
    let arContainer = document.getElementById('ar-container');
    if (!arContainer) {
        arContainer = document.createElement('div');
        arContainer.id = 'ar-container';
        arContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2147483647;
        `;
        document.body.appendChild(arContainer);
    }

    // Create the overlay
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        font-size: 1.2em;
        max-width: 80%;
        border: 2px solid white;
        pointer-events: auto;
    `;

    // Add text to the overlay
    const OverlayText = document.createElement("p");
    OverlayText.className = "OverlayTxt";
    OverlayText.innerHTML = txt;
    overlay.appendChild(OverlayText);

    // Add image if it exists
    if (imgSrc) {
        const OverlayImage = document.createElement("img");
        OverlayImage.className = "OverlayImg";
        OverlayImage.src = imgSrc;
        OverlayImage.style.cssText = `
            display: block;
            margin: 10px auto;
            max-width: 100px;
            max-height: 100px;
        `;
        overlay.appendChild(OverlayImage);
    }

    // Add the overlay to the AR container
    arContainer.appendChild(overlay);

    // Fade-in effect
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s ease-in-out";
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
    });

    // Auto-remove after 3 seconds with fade-out effect
    setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 500); // Match the fade-out duration
    }, 3000);
}

export function MapPopup(mapOptions, onClose) {
    // Vérifie et supprime une popup existante
    let existingPopup = document.querySelector(".map-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Création de la popup principale
    const popup = document.createElement("div");
    popup.className = "map-popup";

    // Contenu interne de la popup
    const content = document.createElement("div");
    content.className = "map-popup-content";
    content.id = "map-popup-content";

    // Conteneur de la carte
    const mapDiv = document.createElement("div");
    mapDiv.className = "map-popup-map";
    mapDiv.id = "staticMapContainer"; // ID utilisé pour afficher la carte

    // Bouton de fermeture (image croix)
    const closeButton = document.createElement("img");
    closeButton.src = "assets/icons/croix.png"; // Remplace par ton icône de croix
    closeButton.alt = "Fermer";
    closeButton.className = "map-popup-close"; // Ajoute une classe pour la styliser
    closeButton.addEventListener("click", () => {
        popup.remove();
        if (onClose) onClose();
    });

    // Ajout des éléments à la popup
    content.appendChild(mapDiv); // Ajoute d'abord la carte
    content.appendChild(closeButton); // Ensuite, ajoute la croix pour qu'elle soit par-dessus
    popup.appendChild(content);
    document.body.appendChild(popup);

    // Afficher la carte Geoapify
//    createStaticMap(mapOptions);
}


