// functionImg.js

import {log} from './trace.js';

export function addImgBackground(containerID, mediaURL, callback=null) {
    const container = document.getElementById(containerID);
    
    if (!container) {
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }
    
    // Vérifie si l'URL est une image
    const isImg = /\.(png|jpeg|svg|jpg)$/i.test(mediaURL);
    
    if (isImg) {
        const img = new Image();
        img.src = mediaURL;

        // Attendre que l'image soit chargée avant de l'afficher
        img.onload = () => {
            container.style.backgroundImage = `url(${mediaURL})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            container.style.backgroundRepeat = 'no-repeat';

            // Exécuter la fonction callback une fois l’image chargée
            if (callback) callback();
        };

        img.onerror = () => {
            console.error(`Erreur lors du chargement de l'image : ${mediaURL}`);
        };
    } else {
        console.error(`L'URL "${mediaURL}" n'est pas une image valide.`);
    }
}


export function addMediaBackground(containerID, mediaURL, onVideoEnd = null) {
    // Sélectionne l'élément par son ID
    const container = document.getElementById(containerID);
    if (!container) {
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }

    // Assurez-vous que le conteneur a une position relative et des dimensions adaptées
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "hidden"; // Empêche le débordement

    // Vérifie si l'URL est une vidéo
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaURL);
    const SoundBtn = document.getElementById("SoundBtn");

    if (isVideo) {
        // Création de l'élément vidéo
        const video = document.createElement("video");
        video.src = mediaURL;
        video.autoplay = true;
        video.loop = false; // Ne pas boucler pour capter la fin

        if (SoundBtn) {
            video.muted = !SoundBtn.src.includes("unmute");
        } else {
            video.muted = true;
        }

        video.playsInline = true;

        // Styles pour un background vidéo
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.style.objectPosition = "center left";

        // Ajout d'un data attribute pour identifier la vidéo
        video.setAttribute("data-media-url", mediaURL);

        // Ajout de la vidéo au conteneur
        container.appendChild(video);

        // ✅ Détection de la fin de la vidéo
        video.addEventListener("ended", () => {
            if (typeof onVideoEnd === "function") {
                log("Vidéo terminée ! On exécute une action !");
                onVideoEnd(); // Exécute la fonction fournie si elle existe
            }
        });
    } else {
        console.error(`L'URL "${mediaURL}" n'est pas une vidéo valide.`);
    }
}


export function removeMediaBackground(containerID, mediaURL) {
    // Sélectionne le conteneur par son ID
    const container = document.getElementById(containerID);
    if (!container) {
        console.error(`Aucun conteneur trouvé avec l'id "${containerID}"`);
        return;
    }

    // Cherche la vidéo qui a l'attribut data-media-url égal à mediaURL
    const video = container.querySelector(`video[data-media-url="${mediaURL}"]`);
    
    if (video) {
        // video.remove();
        video.src="";
        video.removeAttribute("data-media-url");
        video.removeAttribute("src");
        // video.load();

        console.log(`La vidéo avec l'URL "${mediaURL}" a été supprimée.`);
    } else {
        console.warn(`Aucune vidéo trouvée avec l'URL "${mediaURL}".`);
    }
}

export function removeAllMediaBackground(containerID) {
    // Sélectionner le conteneur par son ID
    const container = document.getElementById(containerID);
    if (!container) {
        console.error(`Aucun conteneur trouvé avec l'id "${containerID}"`);
        return;
    }

    // Sélectionner tous les éléments <video> contenus dans le conteneur
    const mediaElements = container.querySelectorAll("video");

    // Supprimer chaque élément vidéo trouvé
    mediaElements.forEach(media => {
        media.remove();
    });

    // Optionnel : si vous aviez défini un style de background sur le conteneur, vous pouvez le réinitialiser
    // container.style.background = ""; // Par exemple
}

export function addImg(containerID, url, style, targetId) {
    // Sélectionne la div par son ID
    const container = document.getElementById(containerID);

    // Vérifie si la div existe
    if (!container) { // Correction ici
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }
    const img = document.createElement("img");
    img.className = style;
    img.loading = "lazy";
    img.rel = "preload";
    img.as = "image";
    img.type = "image/webp";
    img.src = url;
    img.id = targetId;
    img.alt ="icon";

    container.appendChild(img);
}

