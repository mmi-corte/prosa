export function showStaticMapMarkers(containerId, centerLatitude, centerLongitude, zoom, apiKey, marker1, marker2) {
    // Vérifiez si le conteneur existe
    const container = document.getElementById(containerId);
    console.log('map');
    // Si le conteneur n'est pas trouvé, affichez une erreur dans la console
    if (!container) {
        console.error(`Conteneur avec l'ID "${containerId}" introuvable.`);
        return; // Arrête l'exécution de la fonction
    }

    // Construire les paramètres des marqueurs
    const markersParam = [
        `lonlat:${marker1.longitude},${marker1.latitude};color:${marker1.color};size:medium`,
        `lonlat:${marker2.longitude},${marker2.latitude};color:${marker2.color};size:medium`
    ].join('&marker=');

    // Construire l'URL de la carte avec les marqueurs
    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${centerLongitude},${centerLatitude}&zoom=${zoom}&marker=${markersParam}&apiKey=${apiKey}`;

    // Crée une balise <img> pour afficher la carte
    const img = document.createElement('img');
    img.src = mapUrl;
    img.alt = "Carte Statique avec Marqueurs";
    img.className = 'map';

    // Nettoyer tout contenu précédent dans le conteneur et ajoute l'image
    container.innerHTML = ''; // Nettoyer le conteneur avant d'ajouter une nouvelle image
    container.appendChild(img); // Ajouter l'image dans le conteneur
}

export function showStaticMap(containerId, centerLatitude, centerLongitude, zoom, apiKey, marker) {
    // Vérifiez si le conteneur existe
    const container = document.getElementById(containerId);

    // Si le conteneur n'est pas trouvé, affichez une erreur dans la console
    if (!container) {
        console.error(`Conteneur avec l'ID "${containerId}" introuvable.`);
        return; // Arrête l'exécution de la fonction
    }

    // Construire les paramètres du marqueur
    const markerParam = `lonlat:${marker.longitude},${marker.latitude};color:${marker.color};size:medium`;

    // Construire l'URL de la carte avec le marqueur
    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${centerLongitude},${centerLatitude}&zoom=${zoom}&marker=${markerParam}&apiKey=${apiKey}`;

    // Crée une balise <img> pour afficher la carte
    const img = document.createElement('img');
    img.src = mapUrl;
    img.alt = "Carte Statique avec Marqueur";
    img.className = 'map';

    // Nettoyer tout contenu précédent dans le conteneur et ajoute l'image
    container.innerHTML = ''; // Nettoyer le conteneur avant d'ajouter une nouvelle image
    container.appendChild(img); // Ajouter l'image dans le conteneur
}
