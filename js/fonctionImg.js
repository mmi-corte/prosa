// fonctionImg.js

export function addImgBackground(containerID, mediaURL) {
    // Sélectionne la div par son ID
    const container = document.getElementById(containerID);

    // Vérifie si la div existe
    if (!container) { // Correction ici
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }
    
   // Détecte si l'URL est une vidéo ou une image
   const isImg = /\.(png|jpeg|svg|jpg)$/i.test(mediaURL);
    
   if (isImg) {
    // L'URL est valide, on applique l'image en arrière-plan
    container.style.backgroundImage = `url(${mediaURL})`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.backgroundRepeat = 'no-repeat';
   } else {
    console.error(`L'URL "${mediaURL}" n'est pas une image valide.`);
   }
}

export function addMediaBackground(containerID, mediaURL) {
    // Sélectionne l'élément par son ID
    const container = document.getElementById(containerID);
    if (!container) {
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }
    
    // Assurez-vous que le conteneur a une position relative et des dimensions adaptées
    container.style.position = "relative";
    container.style.width = "100%";    // ou "100%" selon votre besoin
    container.style.height = "100%";   // ou une hauteur fixe adaptée au téléphone
    container.style.overflow = "hidden"; // Empêche le débordement

    // Détecte si l'URL est une vidéo ou une image
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaURL);
    
    const SoundBtn=document.getElementById("SoundBtn");

    if (isVideo) {
        // Création de l'élément vidéo
        const video = document.createElement("video");
        video.src = mediaURL;
        video.autoplay = true;
        video.loop = true;
        
        // if (SoundBtn) {
        //     video.muted = !SoundBtn.src.includes("unmute");
        // } else {
        //     video.muted = true;
        // }

        video.playsInline = true;

        // Styles pour un background vidéo
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        
        video.style.objectFit = "cover";
        video.style.objectPosition = "center left";
        // video.style.zIndex = "-1";

        // Ajout d'un data attribute pour identifier la vidéo
        video.setAttribute("data-media-url", mediaURL);

        // Ajout de la vidéo au conteneur
        container.appendChild(video);
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
    img.src = url;
    img.id = targetId;
    img.alt ="icon";

    container.appendChild(img);
}

