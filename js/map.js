export function showStaticMap(containerId, centerLatitude, centerLongitude, zoom, apiKey, markers) {
    // Vérifiez si le conteneur existe
    const container = document.getElementById(containerId);

    // Si le conteneur n'est pas trouvé, affichez une erreur dans la console
    if (!container) {
        console.error(`Conteneur avec l'ID "${containerId}" introuvable.`);
        return; // Arrête l'exécution de la fonction
    }

    // Construire l'URL de la carte avec les marqueurs
    let markersParam = markers.map(marker => `lonlat:${marker.longitude},${marker.latitude};color:red;size:medium`).join('&');

    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${centerLongitude},${centerLatitude}&zoom=${zoom}&marker=${markersParam}&apiKey=${apiKey}`;

    // Crée une balise <img> pour afficher la carte
    const img = document.createElement('img');
    img.src = mapUrl;
    img.alt = "Carte Statique avec Marqueurs";

    // Nettoyer tout contenu précédent dans le conteneur et ajoute l'image
    container.innerHTML = ''; // Nettoyer le conteneur avant d'ajouter une nouvelle image
    container.appendChild(img); // Ajouter l'image dans le conteneur
}