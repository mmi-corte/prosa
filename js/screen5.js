import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton } from "./button.js";
import { setCookie, getCookie, setCityCookie } from "./cookieHandler.js";
import { addImgBackground, addImg } from "./fonctionImg.js";
import { refreshPage } from "./refreshPage.js";
import { addSVG } from "./svg.js";

import { loadSound, suspendSound, stopSound } from "./Sound/sound.js";
import { loadScreen0 } from "./screen0.js";

export function loadScreen5() {
  console.log("loadScreen5: je suis là");

  refreshPage();
  addAutoPlayVideo(
    "container",
    "./assets/video/IntroTourneeV1.mp4",
    "introVideo"
  );

  ajouterBouton("container", "", "btnInv2", "btnInv");
  const boutonInv2 = document.getElementById("btnInv2");
  boutonInv2.addEventListener("click", function (){
   
  });

  setCookie("screen", "5", 7, "/");
}
