const map = {
    apiKey: "8b92289a637347489b3b13811907ebdd", // Remplace par ta vraie clé API Geoapify
    zoom: 12,
    positions: {
        toulon: {
            latitude: 43.1242,
            longitude: 5.928,
            markers: [
                { latitude: 43.125, longitude: 5.93, color: "red" },
                { latitude: 43.12, longitude: 5.925, color: "blue" }
            ]
        },
        corte: {
            latitude: 42.3064,
            longitude: 9.1501,
            markers: [
                { latitude: 42.308, longitude: 9.152, color: "green" },
                { latitude: 42.305, longitude: 9.148, color: "yellow" }
            ]
        }
    }
};

export function showStaticMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur avec l'ID "${containerId}" introuvable.`);
        return;
    }

    // Récupérer la ville sélectionnée
    const selectedCity = localStorage.getItem("ville") || "Toulon";

    // Vérifier si la ville a une configuration dans l'objet fourni
    const cityMap = map.positions[selectedCity.toLowerCase()];
    if (!cityMap) {
        console.error(`Aucune carte trouvée pour la ville : ${selectedCity}`);
        return;
    }

    // Construire l'URL de la carte avec les marqueurs
    const markersParam = cityMap.markers.map(marker => 
        `lonlat:${marker.longitude},${marker.latitude};color:${marker.color};size:medium`
    ).join('&marker=');

    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${cityMap.longitude},${cityMap.latitude}&zoom=${map.zoom}&marker=${markersParam}&apiKey=${map.apiKey}`;

    // Afficher l'image de la carte
    const img = document.createElement('img');
    img.id = 'staticMap';
    img.src = mapUrl;
    // img.alt = `Carte Statique - ${selectedCity}`;
    img.className = 'map';

    container.appendChild(img);
}