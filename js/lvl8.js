import { refreshPage } from "./refreshPage.js";
import { log} from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl8() {

    // const steps =[
    //     {character : "NarraChara", Txt : "E6Narra", name : "Narrateur"},
    // ]

    log("Enter in L8", "blue");

    if (Ruse) { 
        const steps = [
            { character : "NarraChara", Txt : "E8NarraRuseT"},
            { character : "MessChara", popup : "E8Mess" },
            { character : "NarraChara", Txt : "E8NarraRuseT2"},
            { character : "BergerChara", Txt : "E8BergerRuseT", name : "E8BergerRuseT" },
            { character : "NarraChara", Txt : "E8NarraRuseT3"},
            { character : "BergerChara", Txt : "E8BergerRuseT2", name : "E8BergerRuseT2" },
            { character : "NarraChara", Txt : "E8NarraRuseT4"},
            { character : "BergerChara", Txt : "E8BergerRuseT3", name : "E8BergerRuseT3" },
            { character : "NarraChara", Txt : "E8NarraRuseT5"},
            
        ];
        playSteps(steps); // Démarrage des étapes
    }
    
    if (lion) { 
        const steps = [
            { character : "NarraChara", Txt : "E8NarraLeoT"},
            { character : "StregaChara", Txt : "E8StregaLeoT", name : "E8StregaLeoT" },
            { character : "NarraChara", Txt : "E8NarraLeoT2" },
            { character : "StregaChara", Txt : "E8StregaT2", name : "E8StregaT2" },
            { character : "NarraChara", Txt : "E8NarraLeoT3"},
            { character : "MessChara", popup : "E8MessLeoT" },
            { character : "NarraChara", Txt : "E8NarraLeoT4"},
            { character : "StregaChara", Txt : "E8StregaLeoT3", name : "E8StregaLeoT3" },
            { character : "NarraChara", Txt : "E8NarraLeoT5"},
            { character : "BergerChara", Txt : "E8BergerLeoT", name : "E8BergerLeoT" },
            { character : "NarraChara", Txt : "E8NarraLeoT6", nextLvl: nextScreen("5","12")},
        ];
        playSteps(steps); // Démarrage des étapes

        //mettre code pour étape suivante 
    }  

    refreshPage();

    localStorage.setItem("level", "8");
    
}