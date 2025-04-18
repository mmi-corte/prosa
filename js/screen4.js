// fichier : screen4.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 4 du jeu.

// Importer les fonctions nécessaires depuis les fichiers source
import { addDiv} from "./texte.js";
import { ajouterBouton , addBtnImg} from "./button.js";
import { refreshPage } from "./refreshPage.js";
import { popup } from "./popup.js";
import { selectAvatar } from "./functionChangeStyle.js";
import { nextScreen } from "./navigation.js";
import {log} from "./trace.js"
import { addTxt } from "./texte.js";

// Fonction pour charger l'écran 4 du jeu
export function loadScreen4() {

  // refresh the page
  refreshPage();
  
  // begin trace
  log("Loading S4....","blue");

  // add content
  // Création des conteneurs pour les avatars
  addDiv("container", "containerAvatar", "divAvatar");
  // add content
  addTxt("containerAvatar", "Choisis un avatar", "txtFormName");
  addDiv("containerAvatar", "imgAvatarContainer", "imgAvatarContainer");

  // Liste des chemins des avatars
  const avatarPaths = [
    "./assets/avatar/AvatarT1.png",
    "./assets/avatar/AvatarT2.png",
    "./assets/avatar/AvatarT3.png",
    "./assets/avatar/AvatarT4.png",
  ];

  // Ajout des boutons d'avatars
  avatarPaths.forEach((path, index) =>{
    addBtnImg("imgAvatarContainer", path, `AvatarT${index + 1}`);
  });

  // Récupération des éléments des avatars pour gestion de la sélection
  const avatars = avatarPaths.map((_, index) =>
    document.getElementById(`AvatarT${index + 1}`)
  );

  selectAvatar(avatars); // Gère la sélection des avatars
  
  // Ajout du bouton "Confirmer"
  ajouterBouton("containerAvatar", "Confirmer", "btnConfirm", "btn");

  const btnConfirm = document.getElementById("btnConfirm");
  btnConfirm.addEventListener("click", function (event) {
    event.preventDefault();

    const avatarContainer = document.getElementById("imgAvatarContainer");
    const selectedAvatar = avatarContainer.getAttribute("data-selected-avatar");

    // Vérifie si un avatar a été sélectionné
    if (!selectedAvatar) {
      popup("Vous n'avez pas sélectionné d'avatar !");
      log("Aucun avatar sélectionné !","red");
    } else {
      log(`Avatar sélectionné : ${selectedAvatar}`, "green");
      localStorage.setItem("skin", selectedAvatar);
      
      // move to the next page
      nextScreen("5");
    }

  });
  
  log("S4 loaded!", "blue");
}
