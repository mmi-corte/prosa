
import { ajouterBouton } from './button.js';
import { setCookie } from './cookieHandler.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { refreshPage } from './refreshPage.js';
import { addSVG } from './svg.js';
import { addTxt , addTxtWithBoldWord} from './texte.js';

const container = document.getElementById('container');

export function loadScreen0(){

    
    console.log('loadScreen0: je suis là');

    // add background
    //document.body.style.background = "linear-gradient(149deg, rgba(230, 181, 122, 1) 0%, rgba(232, 188, 134, 1) 42%, rgba(245, 225, 202, 1) 100%)";

    // add logo
    addImg('container','../assets/logo.png','logoimg', 'logoImgP1');
    addImgBackground('container',"assets/bg/Accueil.png")

    // add button
    const btn1 = ajouterBouton('container', 'JOUER MAINTENANT', 'btn1', 'btnclass');

    // binding
    btn1.addEventListener('click', function (){
        loadScreen1();
    });

    setCookie('screen', '0', 7, '/');



}

// export function loadScreen1(){
//     console.log('loadScreen1:je suis là');

//     // claer page
//     refreshPage();

//     // add background
//     addImgBackground('container', "../assets/bg/bg.png");

//     // add button
//     const btn1 = ajouterBouton('container', '', 'btn1', 'btnInv');

//     // binding
//     btn1.addEventListener('click', function (){
//         loadScreen2();
//     });

//     // update level dans cookie
//     document.cookie = "screen=1; level=0; path=/;";
// }

export function loadScreen1(){
    console.log('loadScreen1:je suis là');

    // clear page
    refreshPage();
    
    container.style.background = "rgb(242, 216, 136)";
    addImg('container','../assets/icons/headset.png','screen1style', '')
    addTxt('container',`Il est préférable de porter des \nécouteurs pour une meilleure\nexpérience en jeu mais restez attentif\nà votre environnement.`,'txt', 'screen1style')
    addImg('container','../assets/icons/camera.png','screen1style', '')
    addTxt('container',`Afin de vivre une bonne expérience, utilisez un smartphone avec suffisamment de batterie pour pouvoir scanner les qr codes pour une immersion maximale.`,'txt', 'screen1style')
    addImg('container','../assets/icons/clic.png','screen1style', '')
    addTxt('container',`Lors des séquences de narration, touchez avec votre doigt sur la partie inférieure droite de l’écran pour passer à l’étape suivante.`,'txt', 'screen1style')
    addSVG('container',`<svg width="50px" height="50px" viewBox="0 0 512 512"><path d="M85.57,446.25H426.43a32,32,0,0,0,28.17-47.17L284.18,82.58c-12.09-22.44-44.27-22.44-56.36,0L57.4,399.08A32,32,0,0,0,85.57,446.25Z" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M250.26,195.39l5.74,122,5.73-121.95a5.74,5.74,0,0,0-5.79-6h0A5.74,5.74,0,0,0,250.26,195.39Z" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M256,397.25a20,20,0,1,1,20-20A20,20,0,0,1,256,397.25Z"/></svg>`,'screen1style')
    addTxtWithBoldWord('container', 'Pour votre sécurité, restez\nattentif à votre\nenvironnement et évitez\nles zones à risques.', 'sécurité');
    // update level dans cookie
    setCookie('screen', '1', 7, '/');
}
