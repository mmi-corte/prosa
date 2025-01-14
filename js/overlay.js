import { addBtnImg } from './button.js';

export function addOverlay(audioId, audioSrc) {
    const iconUrls = [
        './assets/icons/journal.png', // URL de la première icône
        './assets/icons/journal.png', // URL de la deuxième icône
        './assets/icons/journal.png'  // URL de la troisième icône
    ];

    // Ajouter un bouton pour le son
    addBtnImg("container", './assets/icons/SonActif.png', 'btnSon');
    setupSoundButton(audioId, audioSrc);

    // Ajouter un bouton pour le journal
    addBtnImg('container', './assets/icons/journal.png', 'btnJ');
    const btnJ = document.getElementById('btnJ');

    if (btnJ) {
        btnJ.addEventListener("click", () => {
            createPopupJournal('Salut !');
        });
    } else {
        console.error('Le bouton "btnJ" n\'a pas été trouvé.');
    }

    // Créer un bouton avec plusieurs icônes
    createButtonWithIcons('container', iconUrls, 'btnObj');
    const btnObj = document.getElementById('btnObj');

    if (btnObj) {
        btnObj.addEventListener("click", () => {
            createPopupObj();
        });
    } else {
        console.error('Le bouton "btnObj" n\'a pas été trouvé.');
    }
}

export function setupSoundButton(audioId, audioSrc) {
    // Création de l'élément audio
    const audioElement = document.createElement("audio");
    audioElement.id = audioId;
    audioElement.src = audioSrc; // Chemin dynamique du fichier audio
    audioElement.autoplay = true; // Lecture automatique
    audioElement.loop = true; // Lecture en boucle
    audioElement.muted = false; // Par défaut, son activé
    document.body.appendChild(audioElement);

    // Récupération du bouton de gestion du son
    const toggleSoundBtn = document.getElementById("btnSon");

    if (!toggleSoundBtn) {
        console.error('Le bouton pour activer/désactiver le son ("btnSon") n\'existe pas.');
        return;
    }

    // Ajout de l'événement au clic pour activer/désactiver le son
    toggleSoundBtn.addEventListener("click", () => {
        if (audioElement.volume === 0) {
            audioElement.volume = 1; // Activer le son
            audioElement.muted = false; // Désactiver le mode muet
            toggleSoundBtn.src = "./assets/icons/SonActif.png"; // Icône son actif
            console.log("Son réactivé.");
        } else {
            audioElement.volume = 0; // Couper le son
            audioElement.muted = true; // Activer le mode muet
            toggleSoundBtn.src = "./assets/icons/sonCoupe.png"; // Icône son coupé
            console.log("Son coupé.");
        }
    });

    // Gestion des permissions utilisateur (pour certains navigateurs)
    document.addEventListener("click", () => {
        if (audioElement.paused) {
            audioElement.play().catch((error) => {
                console.error("Impossible de lire le son : ", error);
            });
        }
    });
}





function createPopupJournal(message) {
    const popupContainer = document.createElement('div');
    popupContainer.id = 'popup-container';

    const popupMessage = document.createElement('p');
    popupMessage.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.className ='btn';

    popupContainer.appendChild(popupMessage);
    popupContainer.appendChild(closeButton);

    document.body.appendChild(popupContainer);

    closeButton.addEventListener('click', function () {
        document.body.removeChild(popupContainer);
    });
}

function createButtonWithIcons(containerId, iconUrls, idBtn) {
    console.log("Création du bouton avec des icônes.");

    if (iconUrls.length !== 3) {
        console.error('Le tableau doit contenir exactement 3 URL d\'icônes.');
        return;
    }

    const button = document.createElement('button');
    button.classList.add('button-with-icons');
    button.id = idBtn;

    iconUrls.forEach(url => {
        const icon = document.createElement('img');
        icon.src = url;
        icon.alt = 'Icône';
        icon.onerror = () => console.error(`Échec de chargement de l'icône : ${url}`);
        button.appendChild(icon);
    });

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Le conteneur avec l'ID "${containerId}" n'existe pas.`);
        return;
    }

    container.appendChild(button);
}

function createPopupObj() {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-containerObj');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-contentObj');

    const popupTitle = document.createElement('h3');
    popupTitle.textContent = 'Collectible';
    popupContent.appendChild(popupTitle);

    const objContainer = document.createElement('div');
    objContainer.classList.add('obj-container');

    // Liste des objets avec les URLs des images
    const objects = [
        { name: 'Objet 1', imgUrl: './assets/icons/journal.png' },
        { name: 'Objet 2', imgUrl: './assets/icons/journal.png' },
        { name: 'Objet 3', imgUrl: './assets/icons/journal.png' }
    ];

    objects.forEach(obj => {
        const objItem = document.createElement('div');
        objItem.classList.add('obj-item');

        const objImg = document.createElement('img');
        objImg.src = obj.imgUrl;
        objImg.alt = obj.name;
        objImg.classList.add('obj-img'); // Ajout d'une classe pour styliser l'image
        objImg.onerror = () => console.error(`Échec du chargement de l'image : ${obj.imgUrl}`);

        objItem.appendChild(objImg);
        objContainer.appendChild(objItem);
    });

    popupContent.appendChild(objContainer);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.className ='btn';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupContainer);
    });
    popupContent.appendChild(closeButton);

    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);
}
