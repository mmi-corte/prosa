
import { ajouterBouton } from './button.js';
import { addImgBackground, addImg } from './fonctionImg.js';
import { refreshPage } from './refreshPage.js';

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


}

export function loadScreen1(){
    console.log('loadScreen1:je suis là');

    // claer page
    refreshPage();

    // add background
    addImgBackground('container', "../assets/bg/bg.png");

    // add button
    const btn1 = ajouterBouton('container', '', 'btn1', 'btnInv');

    // binding
    btn1.addEventListener('click', function (){
        loadScreen2();
    });

    // update level dans cookie
    document.cookie = "screen=1; level=0; path=/;";
}

export function loadScreen2(){
    console.log('loadScreen2:je suis là');

    // clear page
    refreshPage();
    

    // update level dans cookie
    document.cookie = "screen=2; level=0; path=/;";
}
