import { addBtnImg } from './button.js';

export function addOverlay(audioId) {
    const iconUrls = [
        './assets/journal.png', // Remplacez par l'URL de la première icône
        './assets/journal.png', // Remplacez par l'URL de la deuxième icône
        './assets/journal.png'  // Remplacez par l'URL de la troisième icône
    ];
    addBtnImg("container", 'js/img/SonActif.png', 'btnSon');
    setupSoundButton(audioId);
    addBtnImg('container','./assets/journal.png','btnJ');
    const btnJ = document.getElementById('btnJ');

    btnJ.addEventListener("click", ()=>{
        createPopupJournal('salut');
    });

    createButtonWithIcons('container', iconUrls, 'btnObj');

    // Correction ici : Utilisation de getElementById pour récupérer l'élément DOM
    const btnObj = document.getElementById('btnObj');
    
    // Vérification si le bouton existe avant d'ajouter un écouteur d'événement
    if (btnObj) {
        btnObj.addEventListener("click", ()=>{
            createPopupObj();
        });
    } else {
        console.error('Le bouton "btnObj" n\'a pas été trouvé.');
    }
}

function setupSoundButton(audioId) {
    const audioElement = document.getElementById(audioId);
    const toggleSoundBtn = document.getElementById("btnSon");

    if (!audioElement) {
        console.error('L\'élément audio avec l\'ID "audioPlayer" est introuvable.');
        return;
    }

    if (!toggleSoundBtn) {
        console.error('Le bouton avec l\'ID "toggleSoundBtn" est introuvable.');
        return;
    }

    // Ajouter un gestionnaire d'événements pour le bouton
    toggleSoundBtn.addEventListener("click", () => {
        if (audioElement.volume === 0) {
            // Si le volume est à 0, on le remet à 1 (son activé)
            audioElement.volume = 1;
            toggleSoundBtn.src = "js/img/SonActif.png"; // Changer l'icône en "son activé"
            console.log("Son réactivé.");
        } else {
            // Sinon, on coupe le son (volume à 0)
            audioElement.volume = 0;
            toggleSoundBtn.src = "js/img/sonCoupé.png"; // Changer l'icône en "son coupé"
            console.log("Son coupé.");
        }
    });
}

function createPopupJournal(message) {
    // Créer le conteneur de la popup
    const popupContainer = document.createElement('div');
    popupContainer.id = 'popup-container';

    // Création du contenu 
    const popupMessage = document.createElement('p');
    popupMessage.textContent = message;

    // Créer le bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';

    // Ajouter le message et le bouton à la popup
    popupContainer.appendChild(popupMessage);
    popupContainer.appendChild(closeButton);

    // Ajouter la popup au body du document
    document.body.appendChild(popupContainer);

    // Ajouter un gestionnaire d'événements pour fermer la popup
    closeButton.addEventListener('click', function() {
        document.body.removeChild(popupContainer);
    });
}

function createButtonWithIcons(containerId, iconUrls, idBtn) {
    console.log("teste obj");

    // Vérifie que le tableau d'icônes contient exactement 3 icônes
    if (iconUrls.length !== 3) {
        console.error('Le tableau doit contenir exactement 3 URL d\'icônes.');
        return;
    }

    // Créer le bouton
    const button = document.createElement('button');
    button.classList.add('button-with-icons'); // Appliquer le style CSS
    button.id = idBtn;
    
    // Ajouter les icônes dans le bouton
    iconUrls.forEach(url => {
        const icon = document.createElement('img');
        icon.src = url;
        icon.alt = 'Icon';
        button.appendChild(icon); // Ajouter chaque icône au bouton
    });

    // Ajouter le bouton au conteneur spécifié
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Le conteneur avec l'ID ${containerId} n'existe pas.`);
        return;
    }
    container.appendChild(button); // Ajouter le bouton à la page
}

// Fonction pour créer la popup d'objets
function createPopupObj() {
    // Créer le conteneur de la popup
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-containerObj');

    // Créer le contenu de la popup
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-contentObj');

    // Ajouter un titre
    const popupTitle = document.createElement('h3');
    popupTitle.textContent = 'Sélectionnez un objet';
    popupContent.appendChild(popupTitle);

    // Créer un conteneur pour les objets
    const objContainer = document.createElement('div');
    objContainer.classList.add('obj-container');

    // Tableau des objets
    const objects = [
        { name: 'Objet 1' },
        { name: 'Objet 2' },
        { name: 'Objet 3' }
    ];

    // Ajouter chaque objet à la popup
    objects.forEach(obj => {
        const objItem = document.createElement('div');
        objItem.classList.add('obj-item');

        // Ajouter un bouton avec l'icône des trois points
        const objBtn = document.createElement('button');
        objBtn.classList.add('icon-btn');
        objBtn.innerHTML = `...`; // Afficher les 3 points sous forme de texte

        objItem.appendChild(objBtn); // Ajouter le bouton avec les trois points à l'objet
        objContainer.appendChild(objItem); // Ajouter l'objet au conteneur
    });

    // Ajouter les objets à la popup
    popupContent.appendChild(objContainer);

    // Créer le bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupContainer); // Fermer la popup
    });
    popupContent.appendChild(closeButton);

    // Ajouter la popup au body
    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);
}
