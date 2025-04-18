import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { enemies } from "./fight.js";
import { lunchFight } from "./fight.js";

export function loadLvl11() {

  //Trace the entry in the function
  log("Enter in L11", "blue");

  //Set the level in the local storage
  localStorage.setItem("level", "11");

  localStorage.setItem("vue_orcu", true);

  const weapons = [
    {
      name: "Epée",
      damage: 30,
    },
];

  //test fight
  async function luncher() {
    refreshPage();
    const fightResult = await lunchFight(weapons, enemies[1]);
    
    log(fightResult, "green");
    
    const steps = [
      { character: "SylvainChara", Txt: "E11Sylvain4", name: "E11Sylvain4" },
      { character: "NarraChara", Txt: "E11Narra5" },
      { character: "BergerChara", Txt: "E11Berger3", name: "E11Berger3"},
      { character: "SylvainChara", Txt: "E11Sylvain5", name: "E11Sylvain5" },
      { character: "NarraChara", Txt: "E11Narra6", nextLvl: () => { nextScreen("5", "6");}}
    ];

    refreshPage();

    playSteps(steps, 0, true, 2);
  }

  const steps = [
      { character: "NarraChara", Txt: "E11Narra" },
      { character: "SylvainChara", Txt: "E11sylvain", name: "E11sylvain" },
      { character: "BergerChara", Txt: "E11Berger", name: "E11Berger" },
      { character: "NarraChara", Txt: "E11Narra2" },
      { character: "SylvainChara", Txt: "E11Sylvain2", name: "E11Sylvain2" },
      { character: "NarraChara", Txt: "E11Narra3" },
      { character: "BergerChara", Txt: "E11Berger2", name: "E11Berger2" },
      { character: "SylvainChara", Txt: "E11Sylvain3", name: "E11Sylvain3" },  
      { character: "NarraChara", Txt: "E11Narra4", 
        choices: [
          { text: "E11Fight", action: () => {luncher();} }
        ] }
  ];

  refreshPage();
  
  playSteps(steps ,0 ,true, 2);
    
}