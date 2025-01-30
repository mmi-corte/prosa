// buttonModule.js
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

    // Détecte si l'URL est une vidéo ou une image
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaURL);
    
    if (isVideo) {
        // Création de l'élément vidéo
        const video = document.createElement("video");
        video.src = mediaURL;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        // Styles pour un background vidéo
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        // video.style.zIndex = "-1";

        // Ajout de la vidéo au conteneur
        container.appendChild(video);
    } else {
        // Appliquer une image en background
        console.error(`L'URL "${mediaURL}" n'est pas une video valide.`);
    }
}

export function addImg(containerID,url,style,targetId) {
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

    container.appendChild(img);
}

