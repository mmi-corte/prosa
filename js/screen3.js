
import { addDiv, addH1, addTxt, addTxtWithBoldWord } from "./texte.js";

import { ajouterBouton } from './button.js';
import { setCookie, getCookie, setCityCookie } from './cookieHandler.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { refreshPage } from './refreshPage.js';
import { addSVG } from './svg.js';

import { loadSound, suspendSound,stopSound } from './Sound/sound.js';
import { addForm } from "./form.js";
import { loadScreen4 } from './screen4.js';


export function loadScreen3() {
    console.log('loadScreen3:je suis là');
    refreshPage();

    addTxt("container", "Écris ton nom de héro", "txtFormName");

    addForm("container")

    const input = document.getElementById("userInput");
    const btnSubmit = document.getElementById("btnSubmit");

    btnSubmit.addEventListener("click", function (event) {
        event.preventDefault();
        playerUserName = input.value;
        console.log("Nom du joueur : ", playerUserName);
        setCookie("playerName", playerUserName, 7, "/");
        loadScreen4();
    });
}