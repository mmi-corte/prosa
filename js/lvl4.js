import { refreshPage } from "./refreshPage.js";
import { path_narration } from "./paths.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";

export function loadLvl4() {

// Trace the entry in the console
log("Enter in L4", "blue");  

localStorage.setItem('level', '4');

localStorage.setItem('fulettu', 'true');

const steps1 = [
        {character : "FulettuChara", Txt : "E4FulettuTrue", name : "E4FulettuTrue"},
        {character : "FouletounChara", Txt : "E4FouletounTrue", name : "E4FouletounTrue" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-006.mp3'},
        {character : "FulettuChara", Txt : "E4FouletounTrue2", name : "E4FouletounTrue2"},
        {character : "NarraChara", Txt : "E4NarrateurTrue" , sound: path_narration+'narrateur-E4/narrateurE4-005.mp3'},
        {nextLvl: () => { nextScreen("5", "6"); window.location.reload(false); }}
];

const steps2 = [
        {character : "FulettuChara", Txt : "E4FulettuFalse", name : "E4FulettuFalse"},
        {character : "FouletounChara", Txt : "E4FouletounFalse", name : "E4FouletounFalse" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-007.mp3'},
        {character : "FulettuChara", Txt : "E4FulettuFalse2", name : "E4FulettuFalse2"},
        {character : "FouletounChara", Txt : "E4FouletounFalse2", name : "E4FouletounFalse2", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-008.mp3'},
        {character : "FulettuChara", Txt : "E4FulettuFalse3", name : "E4FulettuFalse3"},
        {character : "FouletounChara", Txt : "E4FouletounFalse3", name : "E4FouletounFalse3" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-009.mp3'},
        {character : "FulettuChara", Txt : "E4FulettuFalse4", name : "E4FulettuFalse4"},
        {nextLvl: () => { nextScreen("5", "5"); window.location.reload(false); }}
    ];
    
let steps = [
        {character : "NarraChara", Txt: "E4Narra", name : "Narrateur" , sound: path_narration+'Narrateur-E4/narrateurE4-001.mp3'},
        {character : "BergerChara", Txt: "E4Berger", name : "Berger" , sound: path_narration+'Berger-E4/Berger-E4-001.mp3'},
        {character : "NarraChara", Txt: "E4Narra2", name : "Narrateur" , sound: path_narration+'Narrateur-E4/narrateurE4-002.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu", name : "Fulettu" , sound: path_narration+'Fulettu-E4/Fulettu-E4-001.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun",name : "Fouletoun" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-001.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu2", name : "Fuletu" , sound: path_narration+'Fulettu-E4/Fulettu-E4-002.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun2",name : "Fouletoun" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-002.mp3'},
        {character : "NarraChara", Txt: "E4Narra3",name : "Narrateur" , sound: path_narration+'Narrateur-E4/narrateurE4-003.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu3", name : "Fuletu" , sound: path_narration+'Fulettu-E4/Fulettu-E4-003.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun3",name : "Fouletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-003.mp3'},
        {character : "NarraChara", Txt: "E4Narra4",name : "Narrateur" , sound: path_narration+'Narrateur-E4/narrateurE4-004.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu4", name : "Fuletu" , sound: path_narration+'Fulettu-E4/Fulettu-E4-004.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun4",name : "Fouletoun" , sound: path_narration+'Fouletoun-E4/Fouletoun-E4-004.mp3'},
        {character : "FulettuChara", Txt: "E4Fulettu5", name : "Fuletu" , sound: path_narration+'Fulettu-E4/Fulettu-E4-005.mp3'},
        {character : "FouletounChara", Txt: "E4Fouletoun5",name : "Fouletoun", sound: path_narration+'Fouletoun-E4/Fouletoun-E4-005.mp3'},
        {character:  "FulettuChara", Txt:"E4FulettuEC", name : "Fulettu", 
            choices: [
                { text: "E4EnigmeC1", answer: () => {return null;}},
                { text: "E4EnigmeC2", answer: () => {return null;}}
            ] 
        },
        {character: "FulettuChara", Txt:"E4FulettuEC", name: "Fulettu", sound: path_narration+'Fulettu-E4/Fulettu-E4-007.mp3',
            choices: [
                { text: "E4EnigmeT1", answer: () => {return steps2;} },
                { text: "E4EnigmeT2", answer: () => {return steps1;} },
                { text: "E4EnigmeT3", answer: () => {return steps2;} }
            ]

        }
    ];

    // Refresh
    refreshPage();

    // Play the steps
    playSteps(steps , 0 , true , 2);
    
}