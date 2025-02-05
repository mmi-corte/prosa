export function showStaticMap(mapOptions) {
    const container = document.getElementById(mapOptions.containerId);
    if (!container) {
        console.error(`Conteneur avec l'ID "${mapOptions.containerId}" introuvable.`);
        return;
    }

    // Récupérer la ville sélectionnée depuis localStorage
    const selectedCity = localStorage.getItem("ville") || "Toulon";

    // Vérifier si la ville a une configuration dans l'objet fourni
    const cityMap = mapOptions.maps[selectedCity.toLowerCase()];
    if (!cityMap) {
        console.error(`Aucune carte trouvée pour la ville : ${selectedCity}`);
        return;
    }

    // Construire l'URL de la carte avec les marqueurs
    const markersParam = cityMap.markers.map(marker => 
        `lonlat:${marker.longitude},${marker.latitude};color:${marker.color};size:medium`
    ).join('&marker=');

    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${cityMap.longitude},${cityMap.latitude}&zoom=${mapOptions.zoom}&marker=${markersParam}&apiKey=${mapOptions.apiKey}`;

    // Afficher l'image de la carte
    const img = document.createElement('img');
    img.src = mapUrl;
    img.alt = `Carte Statique - ${selectedCity}`;
    img.className = 'map';

    container.innerHTML = ''; 
    container.appendChild(img);
}


