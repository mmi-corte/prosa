import { log} from "./trace.js";
import { nextScreen } from "./navigation.js";
import { path_narration } from "./paths.js";

export function loadLvl8() {

     const steps =[
         {character : "NarraChara", Txt : "E6Narra", name : "Narrateur", sound: path_narration+'Narrateur-E8/NarrateurE8-001.mp3'},
     ]

    // Trace the entry in the console
    log("Enter in L8", "blue");

    // Set the level in local storage
    localStorage.setItem("level", "8");

    if (Ruse) { 
        const steps = [
            { character: "NarraChara", Txt: "E8NarraRuseT", sound: path_narration+'Narrateur-E8/NarrateurE8-002-001.mp3'},
            { character: "MessChara", popup: "E8Mess" },
            { character: "NarraChara", Txt: "E8NarraRuseT2", sound: path_narration+'Narrateur-E8/NarrateurE8-002-002.mp3'},
            { character: "BergerChara", Txt: "E8BergerRuseT", name: "E8BergerRuseT" },
            { character: "NarraChara", Txt: "E8NarraRuseT3", sound: path_narration+'Narrateur-E8/NarrateurE8-003.mp3'},
            { character: "BergerChara", Txt: "E8BergerRuseT2", name: "E8BergerRuseT2" },
            { character: "NarraChara", Txt: "E8NarraRuseT4",sound: path_narration+'Narrateur-E8/NarrateurE8-004.mp3'},
            { character: "BergerChara", Txt: "E8BergerRuseT3", name: "E8BergerRuseT3" },
            { character: "NarraChara", Txt: "E8NarraRuseT5",sound: path_narration+'Narrateur-E8/NarrateurE8-005.mp3'},
            
        ];
        //Play the steps
        playSteps(steps , 0 , true , 2);
    }
    
    if (lion) { 
        const steps = [
            { character : "NarraChara", Txt : "E8NarraLeoT", sound: path_narration+'Narrateur-E8/NarrateurE8-005.mp3'},
            { character : "StregaChara", Txt : "E8StregaLeoT", name : "E8StregaLeoT" },
            { character : "NarraChara", Txt : "E8NarraLeoT2",sound: path_narration+'Narrateur-E8/NarrateurE8-006.mp3' },
            { character : "StregaChara", Txt : "E8StregaT2", name : "E8StregaT2" },
            { character : "NarraChara", Txt : "E8NarraLeoT3", sound: path_narration+'Narrateur-E8/NarrateurE8-007-001.mp3'},
            { character : "MessChara", popup : "E8MessLeoT" },
            { character : "NarraChara", Txt : "E8NarraLeoT4", sound: path_narration+'Narrateur-E8/NarrateurE8-007-002.mp3'},
            { character : "StregaChara", Txt : "E8StregaLeoT3", name : "E8StregaLeoT3" },
            { character : "NarraChara", Txt : "E8NarraLeoT5", sound: path_narration+'Narrateur-E8/NarrateurE8-008.mp3'},
            { character : "BergerChara", Txt : "E8BergerLeoT", name : "E8BergerLeoT" },
            { character : "NarraChara", Txt : "E8NarraLeoT6", sound: path_narration+'Narrateur-E8/NarrateurE8-009.mp3', nextLvl: () => { nextScreen("5","12");}},
        ];
        
        // Play the steps
        playSteps(steps, 0 , true , 2); 
    }  
    
}