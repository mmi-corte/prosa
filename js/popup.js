import { checkImageExists } from "./functions.js";
// import { createStaticMap } from "./map.js";

export function popup(txt, imgSrc = "") {

    //Overlay Transition
    const Container = document.getElementById('container');
    const overlay = document.createElement("div");
    const OverlayText = document.createElement("p");
    const OverlayImage = document.createElement("img");
    overlay.className = "overlay";
    Container.appendChild(overlay);

    function fadeIn(element) {
        element.classList.remove("fade-out");
        element.classList.add("fade-in");
        element.style.display = "flex"; // Rendre visible si nécessaire
    }

    function fadeOut(element) {
        element.classList.remove("fade-in");
        element.classList.add("fade-out");
        setTimeout(() => {
            element.style.display = "none"; // Cache l'élément après l'animation
        }, 2000); // La durée doit correspondre à celle de l'animation CSS
    }

    checkImageExists(imgSrc, (exists) => {
        if (exists) {
            OverlayImage.className = "OverlayImg";
            OverlayImage.src = imgSrc;
            overlay.appendChild(OverlayImage);
        } else {
            console.warn("Image not found:", imgSrc);
        }
    });

    OverlayText.className = "OverlayTxt";
    OverlayText.innerHTML = txt;
    overlay.appendChild(OverlayText);

    fadeIn(overlay);

    setTimeout(() => {
        fadeOut(overlay);
    }, 3000);
};

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


