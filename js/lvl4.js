import { refreshPage } from "./refreshPage.js";
import { path_narration } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl4() {

    // Trace the entry in the console
    log("Enter in L4", "blue");  

    localStorage.setItem('level', '4');

    localStorage.setItem('vue_fulettu', true);
    localStorage.setItem('vue_orcu', false);

    const steps6 = [ 
        {character : "FulettuChara", Txt : "E4FulettuTrue", name : "E4FulettuTrue", sound: path_narration+'Fulettu-E4/Fulettu-E4-005.mp3'},
        {character : "FouletounChara", Txt : "E4FouletounTrue", name : "E4FouletounTrue" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-006.mp3'},
        {character : "FulettuChara", Txt : "E4FulettuTrue2", name : "E4FulettuTrue2", sound: path_narration+'Fulettu-E4/Fulettu-E4-006.mp3'},
        {character : "NarraChara", Txt : "E4NarrateurTrue" , sound: path_narration+'narrateur-E4/narrateurE4-005.mp3', 

            nextLvl: () => { nextScreen("5", "6"); window.location.reload(false); }}
    ];

    const steps5 = [
        {character : "FulettuChara", Txt: "E4FulettuFalse", name: "E4FulettuFalse", sound: path_narration+'Fulettu-E4/Fulettu-E4-007.mp3'},
        {character : "FouletounChara", Txt: "E4FouletounFalse", name: "E4FouletounFalse", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-007.mp3'},
        {character : "FulettuChara", Txt: "E4FulettuFalse2", name: "E4FulettuFalse2", sound: path_narration+'Fulettu-E4/Fulettu-E4-008.mp3'},
        {character : "FouletounChara", Txt: "E4FouletounFalse2", name: "E4FouletounFalse2", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-008.mp3'},
        {character : "FulettuChara", Txt: "E4FulettuFalse3", name: "E4FulettuFalse3", sound: path_narration+'Fulettu-E4/Fulettu-E4-009.mp3'},
        {character : "FouletounChara", Txt: "E4FouletounFalse3", name: "E4FouletounFalse3" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-009.mp3'},
        {character : "FulettuChara", Txt: "E4FulettuFalse4", name: "E4FulettuFalse4", sound: path_narration+'Fulettu-E4/Fulettu-E4-010.mp3',
            nextLvl: () => { nextScreen("5", "5"); window.location.reload(false); }}
    ];
    
    let steps = [
        {character : "NarraChara", Txt: "E4Narra" , sound: path_narration+'Narrateur-E4/narrateurE4-001.mp3'},
        {character : "BergerChara", Txt: "E4Berger", name: "E4Berger", sound: path_narration+'Berger-E4/Berger-E4-001.mp3'},
        {character : "NarraChara", Txt: "E4Narra2", sound: path_narration+'Narrateur-E4/narrateurE4-002.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu", name: "E4Fulettu", sound: path_narration+'Fulettu-E4/Fulettu-E4-001.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun", name: "E4Fouletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-001.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu2", name: "E4Fulettu2", sound: path_narration+'Fulettu-E4/Fulettu-E4-002.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun2", name: "E4Fouletoun2", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-002.mp3'},
        {character : "NarraChara", Txt: "E4Narra3", sound: path_narration+'Narrateur-E4/narrateurE4-003.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu3", name: "E4Fulettu3", sound: path_narration+'Fulettu-E4/Fulettu-E4-003.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun3", name: "E4Fouletoun3", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-003.mp3'},
        {character : "NarraChara", Txt: "E4Narra4", sound: path_narration+'Narrateur-E4/narrateurE4-004.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu4", name: "E4Fulettu4", sound: path_narration+'Fulettu-E4/Fulettu-E4-004.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun4", name: "E4Fouletoun4" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-004.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu5", name: "E4Fulettu5", sound: path_narration+'Fulettu-E4/Fulettu-E4-005.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun5", name: "E4Fouletoun5", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-005.mp3'},
        {character:  "FulettuChara", Txt:"E4FulettuEC", 
            choices: [
                { text: "E4EnigmeC1", answer: () => {return null;}},
                { text: "E4EnigmeC2", answer: () => {return null;}}
            ] 
        },
        {character: "FouletounChara", Txt:"E4FouletounET",
            choices: [
                { text: "E4EnigmeT1", answer: () => {
                    const selection = localStorage.getItem('answer_4_E15');
                    if (selection.includes('Fromage')) {
                        return steps6;
                    }
                    return steps5;
                }},
                { text: "E4EnigmeT2", answer: () => {
                    const selection = localStorage.getItem('answer_4_E15');
                    if (selection.includes('Tomme')) {
                        return steps5;
                    }
                    return steps6;
                }},
                { text: "E4EnigmeT3", answer: () => {
                    const selection = localStorage.getItem('answer_4_E15');
                    if (selection.includes('Fromage')) {
                        return steps6;
                    }
                    return steps5;
                }}
            ]
        }
    ];

    // Refresh
    refreshPage();

    // // Display the map button to allow the user to see the map during the AR mode
    // const MapBtn = document.getElementById("MapBtn");
    // if(MapBtn) {
    //     MapBtn.style.display = "block";
    // }

    // Play the steps
    playSteps(steps , 0 , true , 2);      
}