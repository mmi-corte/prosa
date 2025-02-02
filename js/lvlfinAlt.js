import { loadLvl1 } from "./lvl1";

export function loadLvlfinAlt() {

    refreshPage();
    console.log("loadLvlfin :  je suis là");

    const steps = [
        { character: "NaraChara", Txt: "End2Narra" },
        {character : "BergerChara", Txt : "End2Berger",name : "End2Berger"},
        { character: "NaraChara", Txt: "End2Narra2" },
        {character : "EsterelleChara", Txt : "End2Esterelle",name : "End2Esterelle"},
        {character : "FataChara", Txt : "End2Fata",name : "End2Fata"},
        { character: "NaraChara", Txt: "End2Narra3" },
        {character : "FataChara", Txt : "End2Fata2",name : "End2Fata2"},
        { character: "NaraChara", Txt: "End2Narra4" , nextLvl : loadLvl1},
    ];
    playSteps(steps , 0, true ,4);
    localStorage.setItem("level", "finAlt");
}