
import { setCookie } from './cookieHandler.js';
import {popup} from './popup.js';
import { refreshPage } from './refreshPage.js';
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl3 } from './lvl3.js';

export function loadLvl2() {

    const steps =[
        {character : "NaraChara", Txt : "E2Narra", name : "Narrateur"},
        {character : "BergerChara", Txt : "E2Berger", name : "Berger"},
        {character : "NaraChara", Txt : "E2Narra2", name : "Narrateur"},
        {character : "FataChara", Txt : "E2Fata", name : "A Fata"},
        {character : "EsterelleChara", Txt : "E2Esterelle",name : "Esterelle"},
        {character : "NaraChara", Txt : "E2Narra3", name : "Narrateur"},
        {character : "EsterelleChara", Txt : "E2Esterelle2", name : "Esterelle"},
        {character : "FataChara", Txt : "E2Fata2", name : "A Fata"},
        {character : "EsterelleChara", Txt : "E2Esterelle3", name : "Esterelle"},
        {character : "FataChara", Txt : "E2Fata3", name : "A Fata"},
        {character : "NaraChara", Txt : "E2Narra4",name : "Narrateur"},
        {character : "FataChara", Txt : "E2Fata4", name : "A Fata"},
        {character : "EsterelleChara", Txt : "E2Esterelle4", name : "Esterelle"},
        {character : "FataChara", Txt : "E2Fata5", name : "A Fata"},
        {character : "FataChara", Txt : "E2Narra5",name : "Narrateur"},
        {character : "EsterelleChara", Txt : "E2Esterelle5", name : "Esterelle"},
        {character : "FataChara", Txt : "E2Fata6",name : "A Fata"},
        {character : "NaraChara", Txt : "E2Narra6", name : "Narrateur"},
        {character : "BergerChara", Txt : "E2Berger2", name : "Berger", nextLvl: loadLvl3}
    ]

    refreshPage();
    // Lance les étapes
    playSteps(steps, 0, true, 4);

    // update screen cookie
    setCookie("level", "2", 7, "/");
}
