import { addImgBackground, addImg } from './fonctionImg.js';
import { addTxt, addTxtWithBoldWord, addTxtNarration, addNameCharacter, addDiv, handleFormSubmit, addTxtNarrationAR, addNamePersoAR } from './texte.js';
import { refreshPage } from './refreshPage.js';
import { addOverlay } from './overlay.js';
import { ajouterBouton } from './button.js';
import { ARAfata, ARBerger, AREsterelle, ARNarra } from './ARFunction.js';
import { lunchFight } from './fight.js';

//var container
const container = 'container';
const btnNext = 'btnInvNext';
const btnChoix1 = 'btnChoix1';
const btnChoix2 = 'btnChoix2';
const txtNarr = 'narrationText';
const name = 'PersoTxt';

export function step2() {
    refreshPage();

    ARBerger(container);

    addTxtNarrationAR("E2Narra", txtNarr, "txt");
    addNamePersoAR("E2Narra", name, "txtName");

    ajouterBouton(container, '', btnNext, 'btnInv');

    document.getElementById(btnNext).addEventListener("click", function () {
        refreshPage();
        ARBerger(container);
        addTxtNarrationAR("E2Berger", txtNarr, "txt");
        addNamePersoAR("E2Berger", name, "txtName");

        ajouterBouton(container, '', btnNext, 'btnInv');

        document.getElementById(btnNext).addEventListener("click", function () {
            refreshPage();

            ARBerger(container);

            addTxtNarrationAR("E2Narra2", txtNarr, "txt");
            addNamePersoAR("E2Narra2", name, "txtName");

            ajouterBouton(container, '', btnNext, 'btnInv');

            document.getElementById(btnNext).addEventListener("click", function () {
                refreshPage();

                ARAfata(container);
                addTxtNarrationAR("E2Fata", txtNarr, "txt");
                addNamePersoAR("E2Fata", name, "txtName");

                ajouterBouton(container, '', btnNext, 'btnInv');

                document.getElementById(btnNext).addEventListener("click", function () {
                    refreshPage();

                    AREsterelle(container);
                    addTxtNarrationAR("E2Esterelle", txtNarr, "txt");
                    addNamePersoAR("E2Esterelle", name, "txtName");

                    ajouterBouton(container, '', btnNext, 'btnInv');

                    document.getElementById(btnNext).addEventListener("click", function () {
                        refreshPage();

                        ARNarra(container);
                        addTxtNarrationAR("E2Narra3", txtNarr, "txt");

                        ajouterBouton(container, '', btnNext, 'btnInv');

                        document.getElementById(btnNext).addEventListener('click', function () {
                            refreshPage();

                            AREsterelle(container);
                            addTxtNarrationAR("E2Esterelle2", txtNarr, "txt");
                            addNamePersoAR("E2Esterelle2", name, "txtName");

                            ajouterBouton(container, '', btnNext, 'btnInv');

                            document.getElementById(btnNext).addEventListener("click", function () {
                                refreshPage();

                                ARAfata(container);
                                addTxtNarrationAR("E2Fata2", txtNarr, "txt");
                                addNamePersoAR("E2Fata2", name, "txtName");

                                ajouterBouton(container, '', btnNext, 'btnInv');

                                document.getElementById(btnNext).addEventListener("click", function () {
                                    refreshPage();

                                    AREsterelle(container);
                                    addTxtNarrationAR("E2Esterelle3", txtNarr, "txt");
                                    addNamePersoAR("E2Esterelle3", name, "txtName");

                                    ajouterBouton(container, '', btnNext, 'btnInv');

                                    document.getElementById(btnNext).addEventListener("click", function () {
                                        refreshPage();

                                        ARAfata(container);
                                        addTxtNarrationAR("E2Fata3", txtNarr, "txt");
                                        addNamePersoAR("E2Fata3", name, "txtName");

                                        ajouterBouton(container, '', btnNext, 'btnInv');

                                        document.getElementById(btnNext).addEventListener("click", function () {
                                            refreshPage();

                                            ARNarra
                                        
                                        (container);
                                            addTxtNarrationAR("E2Narra4", txtNarr, "txt");

                                            ajouterBouton(container, '', btnNext, 'btnInv');

                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                refreshPage();

                                                AR(container);
                                                addTxtNarrationAR("E2Fata4", txtNarr, "txt");
                                                addNamePersoAR("E2Fata4", name, "txtName");

                                                ajouterBouton(container, '', btnNext, 'btnInv');

                                                document.getElementById(btnNext).addEventListener('click', function () {
                                                    refreshPage();

                                                    AREsterelle(container);
                                                    addTxtNarrationAR("E2Esterelle4", txtNarr, "txt");
                                                    addNamePersoAR("E2Esterelle4", name, "txtName");

                                                    ajouterBouton(container, '', btnNext, 'btnInv');

                                                    document.getElementById(btnNext).addEventListener("click", function () {
                                                        refreshPage();

                                                        ARAfata(container);
                                                        addTxtNarrationAR("E2Fata5", txtNarr, "txt");
                                                        addNamePersoAR("E2Fata5", name, "txtName");

                                                        ajouterBouton(container, '', btnNext, 'btnInv');

                                                        document.getElementById(btnNext).addEventListener("click", function () {
                                                            refreshPage();

                                                            ARNarra(container);
                                                            addTxtNarrationAR("E2Narra5", txtNarr, "txt");
                                                            addNamePersoAR("E2Narra5", name, "txtName");

                                                            ajouterBouton(container, '', btnNext, 'btnInv');

                                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                                refreshPage();

                                                                AREsterelle(container);
                                                                addTxtNarrationAR("E2Esterelle5", txtNarr, "txt");
                                                                addNamePersoAR("E2Esterelle5", name, "txtName");

                                                                ajouterBouton(container, '', btnNext, 'btnInv');

                                                                document.getElementById(btnNext).addEventListener("click", function () {
                                                                    refreshPage();

                                                                    ARAfata(container);
                                                                    addTxtNarrationAR("E2Fata6", txtNarr, "txt");
                                                                    addNamePersoAR("E2Fata6", name, "txtName");

                                                                    ajouterBouton(container, '', btnNext, 'btnInv');

                                                                    document.getElementById(btnNext).addEventListener("click", function () {
                                                                        refreshPage();

                                                                        ARNarra(container);
                                                                        addTxtNarrationAR("E2Narra6", txtNarr, "txt");

                                                                        ajouterBouton(container, '', btnNext, 'btnInv');

                                                                        document.getElementById(btnNext).addEventListener("click", function () {
                                                                            refreshPage();

                                                                            ARBerger(container);
                                                                            addTxtNarrationAR("E2Berger2", txtNarr, "txt");
                                                                            addNamePersoAR("E2Berger2", name, "txtName");

                                                                            ajouterBouton(container, '', btnNext, 'btnInv');

                                                                            document.getElementById(btnNext).addEventListener("click", function () {
                                                                                refreshPage();

                                                                                ARNarra(container);
                                                                                addTxtNarrationAR("E2Narra7", txtNarr, "txt");


                                                                            })
                                                                        });
                                                                    });
                                                                });

                                                            });

                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

export function step6() {
    refreshPage();
    addImgBackground(container, 'assets/bg/bg.png');
    addImg(container, 'assets/personnages/Berger/berger.png', 'imgPerso');
    addDiv('container', "diagBox", 'diagBox');
    addNameCharacter('E6BergerOrcuT', 'diagBox', 'nameCharacter');
    addTxtNarration("E6BergerOrcuT", 'diagBox', 'dialogBox');
    addOverlay('audioPlayer');

    ajouterBouton('diagBox', '', btnNext, 'btnInv');

    document.getElementById(btnNext).addEventListener("click", function(){
        refreshPage();
        addImgBackground(container, 'assets/bg/bg.png');
        addImg(container, 'assets/personnages/Berger/berger.png', 'imgPerso');
        addDiv('container', "diagBox", 'diagBox');
        addTxtNarration("E6NarraOrcuT", 'diagBox', 'dialogBoxN');
        addOverlay('audioPlayer');
    
        ajouterBouton('diagBox', '', btnNext, 'btnInv');
        
        document.getElementById(btnNext).addEventListener("click",function(){
            lunchFight();
        });
    });

}