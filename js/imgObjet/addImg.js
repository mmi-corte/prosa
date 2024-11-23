// buttonModule.js
export function addImgBackground(containerID,url) {
    // Sélectionne la div par son ID
    const container = document.getElementById(containerID);

    // Vérifie si la div existe
    if (!container) { // Correction ici
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }
    
   // Assurez-vous de bien appliquer l'image comme fond
   container.style.backgroundImage = `url(${url})`;
   container.style.backgroundSize = 'cover'; // Pour que l'image couvre l'élément
   container.style.backgroundPosition = 'center'; // Pour centrer l'image
   container.style.backgroundRepeat = 'no-repeat'; // Éviter que l'image se répète
}
