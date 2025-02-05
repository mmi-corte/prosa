
import {log} from "./trace.js"


function stopAR() {
    const scene = document.querySelector("a-scene");
    if (scene) {
        scene.parentNode.removeChild(scene); // Supprime la scène AR
    }
}

function stopCamera() {
    const video = document.querySelector("#arjs-video"); // Vidéo utilisée par AR.js
    if (video && video.srcObject) {
        let stream = video.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(track => track.stop()); // Arrête chaque flux de la caméra
        video.srcObject = null; // Supprime le flux vidéo
    }
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
        stopCamera();
        container.style = "";
        container.innerHTML = ""; // Efface tout le contenu de la div "container"
    } else {
        console.error('refreshPage: Aucun élément avec l\'id "container" trouvé.');
    }
}