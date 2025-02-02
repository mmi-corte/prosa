
import {log} from "./trace.js"

const container = document.getElementById("container");

export function refreshPage() {  

    if (container) {       
        log("---------- Cleaning page ----------", "blue", "normal");
        // document.body.style.background = "";
        // container.style.backgroundImage = "none";
        container.style = "";
        container.innerHTML = ""; // Efface tout le contenu de la div "container"
    } else {
        console.error('refreshPage: Aucun élément avec l\'id "container" trouvé.');
    }
}