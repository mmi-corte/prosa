import { refreshPage } from "./refreshPage.js";
import { setCookie } from "./cookieHandler.js";
import { playSteps } from "./functionMakeSteps.js";
import { loadLvl16 } from "./lvl16.js";



export function loadLvl11() {

    refreshPage();
    console.log("loadLvl11 :  je suis là");

    
    const steps = [
        { character : "NarraChara", Txt : "E11Narra" },
        { character : "SylvainChara", Txt : "E11Sylvain", name : "E11Sylvain" },
        { character : "BergerChara", Txt : "E11Berger", name : "E11Berger" },
        { character : "NarraChara", Txt : "E11Narra2" },
        { character : "SylvainChara", Txt : "E11Sylvain2", name : "E11Sylvain2" },
        { character : "NarraChara", Txt : "E11Narra3" },
        { character : "BergerChara", Txt : "E11Berger2", name : "E11Berger2" },
        { character : "SylvainChara", Txt : "E11Sylvain3", name : "E11Sylvain3" },
        { character : "NarraChara", Txt : "E11Narra4" },
    ];
    playSteps(steps, 0 , true , 4);

    let weapons = [
        {
          name: "Epée",
          damage: 10,
        },
      ];

      //test fight
      async function luncher() {
        const fightResult = await lunchFight(skin, weapons, enemies[2]);
        console.log(fightResult);
      }
      luncher();

      const steps2 = [
        { character : "SylvainChara", Txt : "E11Sylvain4", name : "E11Sylvain4" },
        { character : "NarraChara", Txt : "E11Narra5" },
        { character : "BergerChara", Txt : "E11Berger3", name : "E11Berger3"},
        { character : "SylvainChara", Txt : "E11Sylvain5", name : "E11Sylvain5" },
        { character : "NarraChara", Txt : "E11Narra6", nextLvl : loadLvl16}
    ];
    playSteps(steps2, 0 , true , 4);

    let orcu = true;
    localStorage.setItem("level", "11");
    return orcu;
    
    
}