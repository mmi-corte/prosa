import { log} from "./trace.js";
import { nextScreen } from "./navigation.js";
import { path_narration } from "./paths.js";
import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";

export function loadLvl8() {

     var steps = [
         {character : "NarraChara", Txt : "E8Narra", sound: path_narration+'Narrateur-E8/NarrateurE8-001.mp3'}
     ]

    // Trace the entry in the console
    log("Enter in L8", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "8");

    const ruse = localStorage.getItem('ruse') == 'true' || true;

    if (ruse) { 
        steps = steps.concat([
            { character: "NarraChara", Txt: "E8NarraRuseT", sound: path_narration+'Narrateur-E8/NarrateurE8-002-001.mp3'},
            { character: null, narration: () => {
                            popup("Vous avez récupéré la graine corse et une feuille ?"); // pas de graine+feuille.png
            }},
            { character: "NarraChara", Txt: "E8NarraRuseT2", sound: path_narration+'Narrateur-E8/NarrateurE8-002-002.mp3'},
            { character: "BergerChara", Txt: "E8BergerRuseT", name: "E8BergerRuseT", sound: path_narration+'Berger-E8/bergerE8-001.mp3' },
            { character: "NarraChara", Txt: "E8NarraRuseT3", sound: path_narration+'Narrateur-E8/NarrateurE8-003.mp3'},
            { character: "BergerChara", Txt: "E8BergerRuseT2", name: "E8BergerRuseT2", sound: path_narration+'Berger-E8/bergerE8-002.mp3' },
            { character: "NarraChara", Txt: "E8NarraRuseT4",sound: path_narration+'Narrateur-E8/NarrateurE8-004.mp3'},
            { character: "BergerChara", Txt: "E8BergerRuseT3", name: "E8BergerRuseT3", sound: path_narration+'Berger-E8/bergerE8-003.mp3' },
            { character: "NarraChara", Txt: "E8NarraRuseT5",sound: path_narration+'Narrateur-E8/NarrateurE8-009.mp3', nextLvl: () => { nextScreen("5","12")}}
        ]);

        localStorage.setItem('leaf', true);

    } else {
    
        const lion = localStorage.getItem('lion_vict') == 'true';

        if (lion) { 
            steps = steps.concat([
                { character : "NarraChara", Txt : "E8NarraLeoT", sound: path_narration+'Narrateur-E8/NarrateurE8-005.mp3'},
                { character : "StregaChara", Txt : "E8StregaLeoT", name: "E8StregaLeoT" },
                { character : "NarraChara", Txt : "E8NarraLeoT2",sound: path_narration+'Narrateur-E8/NarrateurE8-006.mp3' },
                { character : "StregaChara", Txt : "E8StregaT2", name: "E8StregaT2" },
                { character : "NarraChara", Txt : "E8NarraLeoT3", sound: path_narration+'Narrateur-E8/NarrateurE8-007-001.mp3'},
                { character : "MessChara", popup : "E8MessLeoT" },
                { character : "NarraChara", Txt : "E8NarraLeoT4", sound: path_narration+'Narrateur-E8/NarrateurE8-007-002.mp3'},
                { character : "StregaChara", Txt : "E8StregaLeoT3", name: "E8StregaLeoT3" },
                { character : "NarraChara", Txt : "E8NarraLeoT5", sound: path_narration+'Narrateur-E8/NarrateurE8-008.mp3'},
                { character : "BergerChara", Txt : "E8BergerLeoT", name: "E8BergerLeoT", sound: path_narration+'Berger-E8/bergerE8-004.mp3' },
                { character : "NarraChara", Txt : "E8NarraLeoT6", sound: path_narration+'Narrateur-E8/NarrateurE8-009.mp3', nextLvl: () => { nextScreen("5","12");}}
            ]);
            localStorage.setItem('incantation', true)
        }  
    }
    
    refreshPage();
        
    //Play the steps
    playSteps(steps , 0 , true , 2);

}