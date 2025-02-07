import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl13 } from "./lvl13.js";

export function loadLvl12() {

    refreshPage();
    console.log("loadLvl12 :  je suis là");
 
    
    const steps = [
        { character : "NarraChara", Txt : "E12Narra" },
        { character : "MartoChara", Txt : "E12Marto", name : "E12Marto" },
        { character : "NarraChara", Txt : "E12Narra2" },
        { character : "MartoChara", Txt : "E12Marto2", name : "E12Marto" },
        { character : "NarraChara", Txt : "E12Narra3" },
        { character : "MartoChara", Txt : "E12Marto3", name : "E12Marto3" },
        { character : "NarraChara", Txt : "E12Narra4" },
        { character : "MartoChara", Txt : "E12Marto4", name : "E12Marto4" },
        { character : "MartoChara", Txt : "E12Marto4", name : "E12Marto4" , popup: "E12Mess" },
        { character : "MartoChara", Txt : "E12Marto5", name : "E12Marto5" },
        { character : "NarraChara", Txt : "E12Narra5" },
        { character : "MartoChara", Txt : "E12Marto6", name : "E12Marto6" },
        { character : "MartoChara", Txt : "E12Marto6", name : "E12Marto6" , popup: "E12Mess2", nextLvl: loadLvl13 },       
    ];
    playSteps(steps, 0 , true , 4);

    if (leaf){
        const steps = [
            { character : "BergerChara", Txt : "E12BergerPaperST" },     
        ];
        playSteps(steps, 1 , true , 4);
    }
    const steps2 = [
        { character : "MartoChara", Txt : "E12Marto7", name : "E12Marto7" },
        { character : "NarraChara", Txt : "E12Narra6" },
        { character : "MartoChara", Txt : "E12Marto8", name : "E12Marto8" },
        { character : "NarraChara", Txt : "E12Narra7" },
        { character : "NarraChara", Txt : "E12Narra7", nextLvl: loadLvl13 },
        
    ];
    playSteps(steps2, 0 , true , 4);
    localStorage.setItem( "level", "12" );
}