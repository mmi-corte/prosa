import { refreshPage } from './refreshPage.js';
import { playSteps } from "./functionMakeSteps.js";
import { path_narration } from "./paths.js";
import { log } from './trace.js';
import { nextScreen } from './navigation.js';

export function loadLvl2() {

    log("Enter in L2", "blue");

    // const mapData = {
    //     containerId: "container", // L'ID du conteneur où la carte sera affichée
    //     apiKey: "8b92289a637347489b3b13811907ebdd", // Remplace par ta vraie clé API Geoapify
    //     zoom: 12,
    //     maps: {
    //         toulon: {
    //             latitude: 43.1242,
    //             longitude: 5.928,
    //             markers: [
    //                 { latitude: 43.125, longitude: 5.93, color: "red" },
    //                 { latitude: 43.12, longitude: 5.925, color: "blue" }
    //             ]
    //         },
    //         corte: {
    //             latitude: 42.3064,
    //             longitude: 9.1501,
    //             markers: [
    //                 { latitude: 42.308, longitude: 9.152, color: "green" },
    //                 { latitude: 42.305, longitude: 9.148, color: "yellow" }
    //             ]
    //         }
    //     }
    // };

    // playSteps(mapData, 0, false, 2);

    const steps = [
        {character: "NaraChara", Txt: "E2Narra", sound: path_narration+'Narrateur-E2/narrateurE2-001.mp3'},
        {character: "BergerChara", Txt: "E2Berger", name: "E2Berger", sound: path_narration+'Berger-E2/Berger-E2-001.mp3'},
        {character: "NaraChara", Txt: "E2Narra2", sound: path_narration+'Narrateur-E2/narrateurE2-002.mp3'},
        {character: "FataChara", Txt: "E2Fata", name: "E2Fata", sound: path_narration+'Fata-E2/Fata-E2-001.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle", name: "E2Esterelle", sound: path_narration+'Esterelle-E2/Esterelle-E2-001.mp3'},
        {character: "NaraChara", Txt: "E2Narra3", sound: path_narration+'Narrateur-E2/narrateurE2-003.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle2", name: "E2Esterelle2", sound: path_narration+'Esterelle-E2/Esterelle-E2-002.mp3'},
        {character: "FataChara", Txt: "E2Fata2", name: "E2Fata2", sound: path_narration+'Fata-E2/Fata-E2-002.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle3", name: "E2Esterelle3", sound: path_narration+'Esterelle-E2/Esterelle-E2-003.mp3'},
        {character: "FataChara", Txt: "E2Fata3", name: "E2Fata3", sound: path_narration+'Fata-E2/Fata-E2-003.mp3'},
        {character: "NaraChara", Txt: "E2Narra4", sound: path_narration+'Narrateur-E2/narrateurE2-004.mp3'},
        {character: "FataChara", Txt: "E2Fata4", name: "E2Fata4", sound: path_narration+'Fata-E2/Fata-E2-004.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle4", name: "E2Esterelle4", sound: path_narration+'Esterelle-E2/Esterelle-E2-004.mp3'},
        {character: "FataChara", Txt: "E2Fata5", name: "E2Fata5", sound: path_narration+'Fata-E2/Fata-E2-005.mp3'},
        {character: "NarraChara", Txt: "E2Narra5", sound: path_narration+'Narrateur-E2/narrateurE2-005.mp3'},
        {character: "EsterelleChara", Txt: "E2Esterelle5", name: "E2Esterelle5", sound: path_narration+'Esterelle-E2/Esterelle-E2-005.mp3'},
        {character: "FataChara", Txt: "E2Fata6", name: "E2Fata6", sound: path_narration+'Fata-E2/Fata-E2-006.mp3'},
        {character: "NaraChara", Txt: "E2Narra6", sound: path_narration+'Narrateur-E2/narrateurE2-006.mp3'},
        {character: "BergerChara", Txt: "E2Berger2", name: "E2Berger2", sound: path_narration+'Berger-E2/Berger-E2-002.mp3'},
        {character: "NaraChara", Txt: "E2Narra", sound: path_narration+'Narrateur-E2/narrateurE2-006.mp3'}
        ];

    // besoin d'un refresh car AR ensuite
    refreshPage();

    // Lance les étapes AR
    playSteps(steps, 0, true, 2);

    localStorage.setItem("level", "2");
}
