import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl5() {
  
    const steps =[
        {character : "NarraChara", Txt : "E5Narra"},
        {character : "BergerChara", Txt : "E5Berger", name : "E5Berger"},
        {character : "NarraChara", Txt : "E5Narra2"},
        {character : "MascoChara", Txt : "E5Masco", name : "E5Masco"},
        {character : "NarraChara", Txt : "E5Narra3"},
        {character : "MascoChara", Txt : "E5Masco2", name : "E5Masco2"},
        {character : "NarraChara", Txt : "E5Narra4", name : "E5Narra4"},
        {character : "MascoChara", Txt : "E5Masco3", name : "E5Masco3"},
        {character : "NarraChara", Txt : "E5Narra5"},
        {character : "MascoChara", Txt : "E5Masco4", name : "E5Masco4"},
        {character : "NarraChara", Txt : "E5Narra6"},
        {character : "BergerChara", Txt : "E5Berger4", name : "E5Berger4"},
        {character : "NarraChara", Txt : "E5Narra7"},
        
    ]

    refreshPage();
    
    console.log("loadLvl5 :  je suis là");
    
    playSteps(steps);

    localStorage.setItem("level", "5");
}