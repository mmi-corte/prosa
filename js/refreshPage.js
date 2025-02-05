
import {log} from "./trace.js"


function stopAR() {
    const container = document.getElementById("container");

    // Supprimer la scène AR
    const scene = document.querySelector("a-scene");
    if (scene) {
        scene.remove();
    }

    // Arrêter la caméra et libérer les ressources
    const video = document.querySelector("#arjs-video");
    if (video && video.srcObject) {
        let tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop()); // Stopper chaque flux vidéo
        video.srcObject = null;
    }

    document.body.removeAttribute("style"); 
}

// const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         console.log("🚨 Style modifié :", mutation);
//         console.trace(); // Affiche la source de la modification
//     });
// });

// observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

export function refreshPage() {  

    if (container) {       
        log("---------- Cleaning page ----------", "blue", "normal"); 
        stopAR();
        container.style = "";
        container.innerHTML = ""; // Efface tout le contenu de la div "container"
    } else {
        console.error('refreshPage: Aucun élément avec l\'id "container" trouvé.');
    }
}