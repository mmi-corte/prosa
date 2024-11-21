export function refreshPage() {
    const container = document.getElementById("conteneur");
    console.log('Page refreshed');
    
    if (container) {
        container.innerHTML = ""; // Efface tout le contenu de la div "container"
    } else {
        console.error('Aucun élément avec l\'id "container" trouvé.');
    }
}