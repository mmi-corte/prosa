
// Importing functions from various modules
import { addImg, addImgBackground } from './fonctionImg.js';
import { ajouterBouton } from './button.js';
import { loadScreen1 } from './screen1.js';
import { setCookie } from './cookieHandler.js';

export function loadScreen0() {
  console.log("loadScreen0: je suis là");
    
  // add logo
  addImg('container','assets/logo.png','logoimg', 'logoImgP1');
  addImgBackground('container',"assets/bg/Accueil.png");

  // add button
  const btn1 = ajouterBouton(
    "container",
    "JOUER MAINTENANT",
    "btn1",
    "btnclass"
  );

  // binding
  btn1.addEventListener("click", function () {
    loadScreen1();
  });

  setCookie("screen", "0", 7, "/");
}



