import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { path_narration } from "./paths.js";

export function loadLvl5() {
  
    log("Enter in L5", "blue");

    const steps =[
        {character: "NarraChara", Txt: "E5Narra", sound: path_narration+'Narrateur-E5/naratteurE5-001.mp3'},
        {character: "BergerChara", Txt: "E5Berger", name: "E5Berger", sound: path_narration+'Berger-E5/Berger-E5-001.mp3'},
        {character: "NarraChara", Txt: "E5Narra2", sound: path_narration+'Narrateur-E5/naratteurE5-002.mp3'},
        {character: "MascoChara", Txt: "E5Masco", name: "E5Masco", sound: path_narration+'Masco-E5/mascoE5-001.mp3'},
        {character: "NarraChara", Txt: "E5Narra3", sound: path_narration+'Narrateur-E5/naratteurE5-003.mp3'},
        {character: "MascoChara", Txt: "E5Masco2", name: "E5Masco2", sound: path_narration+'Masco-E5/mascoE5-002.mp3'},
        {character: "NarraChara", Txt: "E5Narra4", name: "E5Narra4", sound: path_narration+'Narrateur-E5/naratteurE5-004.mp3'},
        {character: "MascoChara", Txt: "E5Masco3", name: "E5Masco3", sound: path_narration+'Masco-E5/mascoE5-003.mp3'},
        {character: "NarraChara", Txt: "E5Narra5", sound: path_narration+'Narrateur-E5/naratteurE5-005.mp3'},
        {character: "MascoChara", Txt: "E5Masco4", name: "E5Masco4", sound: path_narration+'Masco-E5/mascoE5-004.mp3'},
        {character: "NarraChara", Txt: "E5Narra6", sound: path_narration+'Narrateur-E5/naratteurE5-006.mp3'},
        {character: "BergerChara", Txt: "E5Berger4", name: "E5Berger4", sound: path_narration+'Berger-E5/Berger-E5-002.mp3'},
        {character: "NarraChara", Txt: "E5Narra7", sound: path_narration+'Narrateur-E5/naratteurE5-007.mp3'}
    ]
    
    playSteps(steps);

    localStorage.setItem("level", "5");
}