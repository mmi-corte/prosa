import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton , addBtnImg} from "./button.js";
import { setCookie, getCookie, setCityCookie } from "./cookieHandler.js";
import { addImgBackground, addImg } from "./fonctionImg.js";
import { refreshPage } from "./refreshPage.js";
import { addSVG } from "./svg.js";
import { selectAvatar } from "./functionChangeStyle.js";

import { loadSound, suspendSound, stopSound } from "./Sound/sound.js";
import { loadScreen1 } from "./screen1.js";
import { loadScreen5 } from "./screen5.js";

export function loadScreen4() {
  console.log("loadScreen4 : je suis là.");

  refreshPage(); // Rafraîchit la page

  // Création des conteneurs pour les avatars
  addDiv("container", "containerAvatar", "divAvatar");
  addDiv("containerAvatar", "imgAvatarContainer", "imgAvatarContainer");

  // Liste des chemins des avatars
  const avatarPaths = [
    "./assets/avatar/AvatarT1.png",
    "./assets/avatar/AvatarT2.png",
    "./assets/avatar/AvatarT3.png",
    "./assets/avatar/AvatarT4.png",
  ];

  // Ajout des boutons d'avatars
  avatarPaths.forEach((path, index) => {
    addBtnImg("imgAvatarContainer", path, `a${index + 1}`);
  });

  // Récupération des éléments des avatars pour gestion de la sélection
  const avatars = avatarPaths.map((_, index) =>
    document.getElementById(`a${index + 1}`)
  );
  selectAvatar(avatars); // Gère la sélection des avatars

  // Ajout du bouton "Confirmer"
  ajouterBouton("containerAvatar", "Confirmer", "btnConfirm", "btn");

  const btnConfirm = document.getElementById("btnConfirm");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", function () {
      console.log("Avatar confirmé.");

      loadScreen5();
      // Ajoutez ici votre logique supplémentaire pour la confirmation
    });
  }


  setCookie("screen", "4", 7, "/");
}
