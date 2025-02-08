import { refreshPage } from "./refreshPage.js";
import { path_narration } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";

export function loadLvl4() {

    log("Enter in L4", "blue");

    let steps = [
        {character: "NarraChara", Txt: "E4Narra", name: "Narrateur", sound: path_narration+'Narrateur-E4/narrateurE4-001.mp3'},
        {character: "BergerChara", Txt: "E4Berger", name: "Berger", sound: path_narration+'Berger-E4/Berger-E4-001.mp3'},
        {character: "NarraChara", Txt: "E4Narra2", name: "Narrateur", sound: path_narration+'Narrateur-E4/narrateurE4-002.mp3'},
        {character: "FulettuChara", Txt: "E4Fulettu", name: "Fulettu", sound: path_narration+'Fulettu-E4/Fulettu-E4-001.mp3'},
        {character: "FuletounChara", Txt: "E4Fuletoun", name: "Fuletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-001.mp3'},
        {character: "FulettuChara", Txt: "E4Fulettu2",  name: "Fuletu", sound: path_narration+'Fulettu-E4/Fulettu-E4-002.mp3'},
        {character: "FuletounChara", Txt: "E4Fuletoun2", name : "Fuletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-002.mp3'},
        {character: "NarraChara", Txt: "E4Narra3", name: "Narrateur", sound: path_narration+'Narrateur-E4/narrateurE4-003.mp3'},
        {character: "FulettuChara", Txt: "E4Fulettu3", name: "Fuletu", sound: path_narration+'Fulettu-E4/Fulettu-E4-003.mp3'},
        {character: "FuletounChara", Txt: "E4Fuletoun3",name: "Fuletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-003.mp3'},
        {character: "NarraChara", Txt: "E4Narra4", name: "Narrateur", sound: path_narration+'Narrateur-E4/narrateurE4-004.mp3'},
        {character: "FulettuChara", Txt: "E4Fulettu4", name: "Fuletu", sound: path_narration+'Fulettu-E4/Fulettu-E4-004.mp3'},
        {character: "FuletounChara", Txt: "E4Fuletoun4", name: "Fuletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-004.mp3'},
        {character: "FulettuChara", Txt: "E4Fulettu5", name: "Fuletu", sound: path_narration+'Fulettu-E4/Fulettu-E4-005.mp3'},
        {character: "FuletounChara", Txt: "E4Fuletoun5", name: "Fuletoun", nextlvl: '6', sound: path_narration+'Fouletoun-E4/Fouletoun-E4-005.mp3'},
        {character: "FulettuChara", Txt:"E4FulettuEC", name: "Fulettu", sound: path_narration+'Fulettu-E4/Fulettu-E4-006.mp3',
            choices: [
                { text: "E4EnigmeC1", },
                { text: "E4EnigmeC2", }
            ]
        },
        {character: "FulettuChara", Txt:"E4FulettuEC", name: "Fulettu", sound: path_narration+'Fulettu-E4/Fulettu-E4-007.mp3',
            choices: [
                { text: "E4EnigmeT1" },
                { text: "E4EnigmeT2" },
                { text: "E4EnigmeT3" }
            ]

        }
    ]

    refreshPage();

    playSteps(steps);

    if(steps.choices.answear1 || steps.choices.answear2){
        steps = [
            {character: "FulettuChara", Txt: "E4FulettuTrue", name: "E4FulettuTrue", sound: path_narration+'Fulettu-E4/Fulettu-E4-008.mp3'},
            {character: "FuletounChara", Txt: "E4FouletounTrue", name: "E4FouletounTrue", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-006.mp3'},
            {character: "FulettuChara", Txt: "E4FouletounTrue2", name: "E4FouletounTrue2", sound: path_narration+'Fulettu-E4/Fulettu-E4-009.mp3'},
            {character: "NarraChara", Txt: "E4NarrateurTrue"}
        ];

        
        
    }else{
        steps = [
            {character: "FulettuChara", Txt: "E4FulettuFalse", name: "E4FulettuFalse", sound: path_narration+'Fulettu-E4/Fulettu-E4-008.mp3'},
            {character: "FuletounChara", Txt: "E4FouletounFalse", name: "E4FouletounFalse", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-006.mp3'},
            {character: "FulettuChara", Txt: "E4FulettuFalse2", name: "E4FulettuFalse2", sound: path_narration+'Fulettu-E4/Fulettu-E4-009.mp3'},
            {character: "FuletounChara", Txt: "E4FouletounFalse2", name: "E4FouletounFalse2", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-007.mp3'},
            {character: "FulettuChara", Txt: "E4FulettuFalse3", name: "E4FulettuFalse3", sound: path_narration+'Fulettu-E4/Fulettu-E4-010.mp3'},
            {character: "FuletounChara", Txt: "E4FouletounFalse3", name: "E4FouletounFalse3", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-008.mp3'},
            {character: "FulettuChara", Txt: "E4FulettuFalse4", name: "E4FulettuFalse4", sound: path_narration+'Fulettu-E4/Fulettu-E4-010.mp3'}
        ];
        
    }
    
    refreshPage();
    
    playSteps(steps);

    localStorage.setItem("level", "4"); 
}