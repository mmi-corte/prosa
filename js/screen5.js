import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton } from "./button.js";
import { setCookie } from "./cookieHandler.js";
import { refreshPage } from "./refreshPage.js";
import { addAutoPlayVideo } from "./video.js";
import { loadLvl1 } from "./lvl1.js";

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
    loadLvl1();
  });

  // update screen cookie
  setCookie("screen", "5", 7, "/");

}
