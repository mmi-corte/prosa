import { refreshPage } from "./refreshPage.js";

import { playSteps } from "./functionMakeSteps.js";

export function loadLvl4() {

    const steps1 =[
        {character : "NarraChara", Txt : "E4Narra", name : "Narrateur"},
        {character : "BergerChara", Txt : "E4Berger", name : "Berger"},
        {character : "NarraChara", Txt : "E4Narra2", name : "Narrateur"},
        {character : "FulettuChara", Txt : "E4Fulettu", name : "Fulettu"},
        {character : "FuletounChara", Txt : "E4Fuletoun",name : "Fuletoun"},
        {character : "FulettuChara", Txt : "E4Fulettu2", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun2",name : "Fuletoun"},
        {character : "NarraChara", Txt : "E4Narra3",name : "Narrateur"},
        {character : "FulettuChara", Txt : "E4Fulettu3", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun3",name : "Fuletoun"},
        {character : "NarraChara", Txt : "E4Narra4",name : "Narrateur"},
        {character : "FulettuChara", Txt : "E4Fulettu4", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun4",name : "Fuletoun"},
        {character : "FulettuChara", Txt : "E4Fulettu5", name : "Fuletu"},
        {character : "FuletounChara", Txt : "E4Fuletoun5",name : "Fuletoun", nextlvl : '6'},
        {character:  "FulettuChara", Txt:"E4FulettuEC", name : "Fulettu",
            choices: [
                { text: "E4EnigmeC1", },
                { text: "E4EnigmeC2", },
            ]
        },
            {character:  "FulettuChara", Txt:"E4FulettuEC", name : "Fulettu",
                choices: [
                    { text: "E4EnigmeT1" },
                    { text: "E4EnigmeT2" },
                    { text: "E4EnigmeT3" },
                ]

        }
    ]

        //playSteps();

    if(steps1.choices.answear1||steps1.choices.answear2){
        const steps2 =[
            {character : "FulettuChara", Txt : "E4FulettuTrue", name : "E4FulettuTrue"},
            {character : "FuletounChara", Txt : "E4FouletounTrue", name : "E4FouletounTrue"},
            {character : "FulettuChara", Txt : "E4FouletounTrue2", name : "E4FouletounTrue2"},
            {character : "NarraChara", Txt : "E4NarrateurTrue"},
        ]
        playSteps();
        
    }else{
        const steps3 =[
            {character : "FulettuChara", Txt : "E4FulettuFalse", name : "E4FulettuFalse"},
            {character : "FuletounChara", Txt : "E4FouletounFalse", name : "E4FouletounFalse"},
            {character : "FulettuChara", Txt : "E4FulettuFalse2", name : "E4FulettuFalse2"},
            {character : "FuletounChara", Txt : "E4FouletounFalse2", name : "E4FouletounFalse2"},
            {character : "FulettuChara", Txt : "E4FulettuFalse3", name : "E4FulettuFalse3"},
            {character : "FuletounChara", Txt : "E4FouletounFalse3", name : "E4FouletounFalse3"},
            {character : "FulettuChara", Txt : "E4FulettuFalse4", name : "E4FulettuFalse4"},
        ]
        
    }
    
    

    refreshPage();
    
    console.log("loadLvl4 :  je suis là");
    
    localStorage.setItem("level", "4"); 
}