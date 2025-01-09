import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './texte.js';
import { refreshPage } from './refreshPage.js';
import { addOverlay } from './overlay.js';
import { ajouterBouton } from './button.js';

//var container
const container = 'container';
const btnNext = 'btnInvNext';
const btnChoix1 = 'btnChoix1';
const btnChoix2 = 'btnChoix2';
const txtNarr = 'narrationText';
const name = 'PersoTxt';

export function step2() {
    refreshPage();

    addImgBackground(container, 'assets/bg/bg.png');
    addDiv('container', "diagBox", 'diagBox');
    addNameCharacter('E2Narra', 'diagBox', 'nameCharacter');
    addTxtNarration("E2Narra", 'diagBox', 'dialogBox');
    addOverlay('audioPlayer');

    ajouterBouton('diagBox', '', btnNext, 'btnInv');

    document.getElementById(btnNext).addEventListener("click", function () {
        refreshPage();

        addImgBackground(container, 'assets/bg/bg.png');
        addImg(container, 'assets/personnages/berger V1 premier plan.png', 'imgPerso');
        addDiv('container', "diagBox", 'diagBox');
        addNameCharacter('E2Berger', 'diagBox', 'nameCharacter');
        addTxtNarration("E2Berger", 'diagBox', 'dialogBox');
        addOverlay('audioPlayer');

        ajouterBouton('diagBox', '', btnNext, 'btnInv');

        document.getElementById(btnNext).addEventListener("click", function () {
            refreshPage();

            addImgBackground(container, 'assets/bg/bg.png');

            
            addDiv('container', "diagBox", 'diagBox');
            addNameCharacter('E2Narra2', 'diagBox', 'nameCharacter');
            addTxtNarration("E2Narra2", 'diagBox', 'dialogBox');
            addOverlay('audioPlayer');

            ajouterBouton('diagBox', '', btnNext, 'btnInv');

            document.getElementById(btnNext).addEventListener("click", function () {
                refreshPage();
                addImgBackground(container, 'assets/bg/bg.png');
                addDiv('container', "diagBox", 'diagBox');
                addNameCharacter('E2Fata', 'diagBox', 'nameCharacter');
                addTxtNarration("E2Fata", 'diagBox', 'dialogBox');
                addOverlay('audioPlayer');

                ajouterBouton('diagBox', '', btnNext, 'btnInv');

                document.getElementById(btnNext).addEventListener("click", function () {
                    refreshPage();
                    addImgBackground(container, 'assets/bg/bg.png');
                    addDiv('container', "diagBox", 'diagBox');
                    addNameCharacter('E2Esterelle', 'diagBox', 'nameCharacter');
                    addTxtNarration("E2Esterelle", 'diagBox', 'dialogBox');
                    addOverlay('audioPlayer');

                    ajouterBouton('diagBox', '', btnNext, 'btnInv');
                });
            });
        });
    });
}