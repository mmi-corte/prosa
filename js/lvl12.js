import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { path_narration } from "./paths.js";

export function loadLvl12() {

    // Trace the entry into the function
    log("Enter in L12", "blue");

    // Set the level in local storage
    localStorage.setItem( "level", "12" );

    // Steps to play
    const steps = [
        { character: "NarraChara", Txt: "E12Narra", sound: path_narration+'Narrateur-E12/narrateurE12-001.mp3' },
        { character: "MartoChara", Txt: "E12Marto", name: "E12Marto", sound: path_narration+'StMarto-E12/StMarto-E12-001.mp3' },
        { character: "NarraChara", Txt: "E12Narra2", sound: path_narration+'Narrateur-E12/narrateurE12-002.mp3'},
        { character: "MartoChara", Txt: "E12Marto2", name: "E12Marto", sound: path_narration+'StMarto-E12/StMarto-E12-002.mp3' },
        { character: "NarraChara", Txt: "E12Narra3", sound: path_narration+'Narrateur-E12/narrateurE12-003.mp3' },
        { character: "MartoChara", Txt: "E12Marto3", name: "E12Marto3", sound: path_narration+'StMarto-E12/StMarto-E12-003.mp3' },
        { character: "NarraChara", Txt: "E12Narra4", sound: path_narration+'Narrateur-E12/narrateurE12-004.mp3' },
        { character: "MartoChara", Txt: "E12Marto4", name: "E12Marto4", sound: path_narration+'StMarto-E12/StMarto-E12-004.mp3' },
        { character: "MartoChara", Txt: "E12Marto4", name: "E12Marto4", popup: "E12Mess" },
        { character: "MartoChara", Txt: "E12Marto5", name: "E12Marto5" },
        { character: "NarraChara", Txt: "E12Narra5", sound: path_narration+'Narrateur-E12/narrateurE12-005.mp3' },
        { character: "MartoChara", Txt: "E12Marto6", name: "E12Marto6", sound: path_narration+'StMarto-E12/StMarto-E12-005.mp3' },
        { character: "MartoChara", Txt: "E12Marto6", name: "E12Marto6", popup: "E12Mess2", nextLvl: () => { nextScreen("5","13");} },       
    ];

    // Refresh the page
    refreshPage();

    // Play the steps
    playSteps(steps, 0 , true , 2);

    if (leaf){
        const steps = [
            { character : "BergerChara", Txt : "E12BergerPaperST" },     
        ];
        playSteps(steps, 1 , true , 2);
    }
    
    const steps2 = [
        { character: "MartoChara", Txt: "E12Marto7", name: "E12Marto7", sound: path_narration+'StMarto-E12/StMarto-E12-006.mp3' },
        { character: "NarraChara", Txt: "E12Narra6", sound: path_narration+'Narrateur-E12/narrateurE12-006.mp3' },
        { character: "MartoChara", Txt: "E12Marto8", name: "E12Marto8", sound: path_narration+'StMarto-E12/StMarto-E12-006.mp3'},
        { character: "NarraChara", Txt: "E12Narra7", sound: path_narration+'Narrateur-E12/narrateurE12-007.mp3' },
        { character: "NarraChara", Txt: "E12Narra7", nextLvl: () => { nextScreen("13");} },
        
    ];

    playSteps(steps2, 0 , true , 2);

}