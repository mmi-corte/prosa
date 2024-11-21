function refreshPage() {
    const container = document.getElementById("container");
    
    if (container) {
        container.innerHTML = ""; // Efface tout le contenu de la div "container"
    } else {
        console.error('Aucun élément avec l\'id "container" trouvé.');
    }
}
