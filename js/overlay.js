import { addBtnImg, ajouterBouton } from './button.js';
import { addDiv } from './texte.js';

export function addOverlay(audioId, audioSrc) {
    const iconUrls = [
        './assets/icons/journal.png', // URL de la première icône
        './assets/icons/journal.png', // URL de la deuxième icône
        './assets/icons/journal.png'  // URL de la troisième icône
    ];

    // Ajouter un bouton pour le son
    addBtnImg("container", './assets/icons/SonActif.png', 'btnSon');
    setupSoundButton(audioId, audioSrc);


    // Ajouter un bouton pour l'inventaire
    addBtnImg('container', './assets/icons/inventaire.png', 'btnI', 'circle-button circle-button-right');
    const btnI = document.getElementById('btnI');

    if (btnI) {
        btnI.addEventListener("click", () => {
            createPopupJournal('Salut !');
        });
    } else {
        console.error('Le bouton "btnI" n\'a pas été trouvé.');
    }

    
    // Ajouter un bouton pour le journal
    addBtnImg('container', './assets/icons/livre.png', 'btnJ', "circle-button circle-button.left");
    const btnJ = document.getElementById('btnJ');

    if (btnJ) {
        btnJ.addEventListener("click", () => {
            createPopupJournal('Salut !');
        });
    } else {
        console.error('Le bouton "btnJ" n\'a pas été trouvé.');
    }

    addDiv('container', 'overlaySquare')
    addDiv('container', 'journal')
    
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

    // Titre de la première page
    const popupTextArea = document.createElement('div');
    popupTextArea.id = 'popup-titre';
    popupTextArea.textContent = "Observation";

    // Contenu de la première page
    const page1 = document.createElement('div');
    page1.id = 'popup-page-1';
    page1.textContent = message;

    // Titre de la deuxième page
    const page2Title = document.createElement('div');
    page2Title.id = 'popup-titre';
    page2Title.textContent = "Lore";
    page2Title.style.display = 'none';

    // Contenu de la deuxième page
    const page2 = document.createElement('div');
    page2.id = 'popup-page-2';
    page2.textContent = "Contenu de la deuxième page";
    page2.style.display = 'none';

    // Titre de la troisième page
    const page3Title = document.createElement('div');
    page3Title.id = 'popup-titre';
    page3Title.textContent = "Recette";
    page3Title.style.display = 'none';

    // Contenu de la troisième page
    const page3 = document.createElement('div');
    page3.id = 'popup-page-3';
    page3.textContent = "Contenu de la troisième page";
    page3.style.display = 'none';

    // Flèche pour naviguer entre les pages
    const nextArrow = document.createElement('img');
    nextArrow.src = './assets/icons/arrow.png'; // Chemin vers l'image de la flèche
    nextArrow.alt = 'Suivant';
    nextArrow.className = 'btn-next';
    nextArrow.style.cursor = 'pointer';

    // Création de l'image pour fermer
    const closeButton = document.createElement('img');
    closeButton.src = './assets/icons/croix.png';
    closeButton.alt = 'Fermer';
    closeButton.className = 'btnFjournal';
    closeButton.style.cursor = 'pointer';

    // Ajout des éléments à la popup
    popupContainer.appendChild(popupTextArea); // Titre de la première page
    popupContainer.appendChild(page2Title); // Titre de la deuxième page
    popupContainer.appendChild(page3Title); // Titre de la troisième page
    popupContainer.appendChild(page1); // Contenu de la première page
    popupContainer.appendChild(page2); // Contenu de la deuxième page
    popupContainer.appendChild(page3); // Contenu de la troisième page
    popupContainer.appendChild(nextArrow); // Flèche
    popupContainer.appendChild(closeButton); // Bouton de fermeture

    // Ajout de la popup au body
    document.body.appendChild(popupContainer);

    // Gestion des pages
    let currentPage = 1;
    nextArrow.addEventListener('click', function () {
        if (currentPage === 1) {
            // Passer à la page 2
            page1.style.display = 'none';
            popupTextArea.style.display = 'none';
            page2.style.display = 'block';
            page2Title.style.display = 'block';
            currentPage = 2;
        } else if (currentPage === 2) {
            // Passer à la page 3
            page2.style.display = 'none';
            page2Title.style.display = 'none';
            page3.style.display = 'block';
            page3Title.style.display = 'block';
            currentPage = 3;
        } else if (currentPage === 3) {
            // Revenir à la page 1
            page3.style.display = 'none';
            page3Title.style.display = 'none';
            page1.style.display = 'block';
            popupTextArea.style.display = 'block';
            currentPage = 1;
        }
    });

    // Ajout d'un événement de clic pour fermer
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
