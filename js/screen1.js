// fichier : screen1.js
// auteurs : MMI IUT de Corse
// date : 01/2025
// description : Ce fichier contient le code pour charger l'écran 1 du jeu.

// import des fonctions nécessaires
import { addTxt, addTxtWithBoldWord } from "./texte.js";
import { ajouterBouton } from './button.js';
import { addImg } from './fonctionImg.js';
import { nextScreen } from './navigation.js';
import { refreshPage } from './refreshPage.js';
import { log } from './trace.js';

// fonction pour charger l'écran 1
export function loadScreen1(){

  // clear page
  refreshPage();

  // begin trace
  log('Loading S1...', "blue");

  // container div
  const container = document.getElementById("container");

  // add content
  container.style.background = "rgb(242, 216, 136)";
  addImg('container','assets/icons/headset.svg','icon_style', '')
  addTxt('container',`Il est préférable de porter des \nécouteurs pour une meilleure\nexpérience en jeu mais restez attentif\nà votre environnement.`,'txt', 'screen1style')
  addImg('container','assets/icons/battery.svg','icon_style', '')
  addTxt('container',`Afin de vivre une bonne expérience, utilisez un smartphone avec suffisamment de batterie pour pouvoir scanner les qr codes pour une immersion maximale.`,'txt', 'screen1style')
  addImg('container','assets/icons/click.svg','icon_style', '')
  addTxt('container',`Lors des séquences de narration, touchez avec votre doigt sur la partie inférieure droite de l’écran pour passer à l’étape suivante.`,'txt', 'screen1style')
  addImg('container','assets/icons/warning.svg','blinking', '')  
  addTxtWithBoldWord('container', 'Pour votre sécurité, restez\nattentif à votre\nenvironnement et évitez\nles zones à risques.', 'sécurité');
    
  // add button
  const btn1 = ajouterBouton("container", "", "btn1", "btnInv");

  // binding
  btn1.addEventListener("click", () =>{
    // move to the next page
    nextScreen("2");
  });
  
  // end trace
  log('S1 loaded!', "blue");

}
