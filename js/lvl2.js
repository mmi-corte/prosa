import {popup} from './popup.js';
import { refreshPage } from './refreshPage.js';
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl3 } from './lvl3.js';

export function loadLvl2() {
    console.log("lvl2");
    const mapData = {
        containerId: "container", // L'ID du conteneur où la carte sera affichée
        apiKey: "8b92289a637347489b3b13811907ebdd", // Remplace par ta vraie clé API Geoapify
        zoom: 12,
        maps: {
            toulon: {
                latitude: 43.1242,
                longitude: 5.928,
                markers: [
                    { latitude: 43.125, longitude: 5.93, color: "red" },
                    { latitude: 43.12, longitude: 5.925, color: "blue" }
                ]
            },
            corte: {
                latitude: 42.3064,
                longitude: 9.1501,
                markers: [
                    { latitude: 42.308, longitude: 9.152, color: "green" },
                    { latitude: 42.305, longitude: 9.148, color: "yellow" }
                ]
            }
        }
    };

    playSteps(mapData, 0, false, 2);
    const steps =[
        {character : "NaraChara", Txt : "E2Narra"},
        {character : "BergerChara", Txt : "E2Berger", name : "E2Berger"},
        {character : "NaraChara", Txt : "E2Narra2"},
        {character : "FataChara", Txt : "E2Fata", name : "E2Fata"},
        {character : "EsterelleChara", Txt : "E2Esterelle",name : "E2Esterelle"},
        {character : "NaraChara", Txt : "E2Narra3"},
        {character : "EsterelleChara", Txt : "E2Esterelle2", name : "E2Esterelle2"},
        {character : "FataChara", Txt : "E2Fata2", name : "E2Fata2"},
        {character : "EsterelleChara", Txt : "E2Esterelle3", name : "E2Esterelle3"},
        {character : "FataChara", Txt : "E2Fata3", name : "E2Fata3"},
        {character : "NaraChara", Txt : "E2Narra4"},
        {character : "FataChara", Txt : "E2Fata4", name : "E2Fata4"},
        {character : "EsterelleChara", Txt : "E2Esterelle4", name : "E2Esterelle4"},
        {character : "FataChara", Txt : "E2Fata5", name : "E2Fata5"},
        {character : "FataChara", Txt : "E2Narra5"},
        {character : "EsterelleChara", Txt : "E2Esterelle5", name : "E2Esterelle5"},
        {character : "FataChara", Txt : "E2Fata6",name : "E2Fata6"},
        {character : "NaraChara", Txt : "E2Narra6"},
        {character : "BergerChara", Txt : "E2Berger2", name : "E2Berger2", nextLvl: loadLvl3}
    ]

    refreshPage();

    // Lance les étapes
    playSteps(steps, 0, true, 2);

    localStorage.setItem("level", "2");
}
