const container = document.getElementById("container");

export function refreshPage() {    
    if (container) {
        // document.body.style.background = "";
        // container.style.backgroundImage = "none";
        container.style = "";
        container.innerHTML = ""; // Efface tout le contenu de la div "container"
        console.log('refreshPage: Refreshed done!');   
    } else {
        console.error('refreshPage: Aucun élément avec l\'id "container" trouvé.');
    }
}