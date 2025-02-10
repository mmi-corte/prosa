import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { enemies } from "./fight.js";
import { skin } from "./functionChangeStyle.js";
import { lunchFight } from "./fight.js";

export function loadLvl11() {

  //Trace the entry in the function
  log("Enter in L11", "blue");

  //Set the level in the local storage
  localStorage.setItem("level", "11");

  
  const weapons = [
    {
      name: "Epée",
      damage: 30,
    },
];

  //test fight
  async function luncher() {
    refreshPage();
    const fightResult = await lunchFight(skin, weapons, enemies[1]);
    
    console.log(fightResult);
    
    const steps = [
      { character: "SylvainChara", Txt: "E11Sylvain4", name: "E11Sylvain4" },
      { character: "NarraChara", Txt: "E11Narra5" },
      { character: "BergerChara", Txt: "E11Berger3", name: "E11Berger3"},
      { character: "SylvainChara", Txt: "E11Sylvain5", name: "E11Sylvain5" },
      { character: "NarraChara", Txt: "E11Narra6", nextLvl: () => { nextScreen("5", "16");}}
    ];

    refreshPage();

    playSteps(steps, 0 , true , 2);
  }

  const steps = [
      { character: "NarraChara", Txt: "E11Narra" },
      { character: "SylvainChara", Txt: "E11Sylvain", name: "E11Sylvain" },
      { character: "BergerChara", Txt: "E11Berger", name: "E11Berger" },
      { character: "NarraChara", Txt: "E11Narra2" },
      { character: "SylvainChara", Txt: "E11Sylvain2", name: "E11Sylvain2" },
      { character: "NarraChara", Txt: "E11Narra3" },
      { character: "BergerChara", Txt: "E11Berger2", name: "E11Berger2" },
      { character: "SylvainChara", Txt: "E11Sylvain3", name: "E11Sylvain3" },
      { character: "NarraChara", Txt: "E11Narra4", choices: [
        { text: "Fight", action: () => {luncher();} }
    ] },
  ];

  refreshPage();
  
  playSteps(steps, 0 , true , 2);

  localStorage.setItem("vue_orcu", true);
    
    
}