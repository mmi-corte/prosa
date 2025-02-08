import { refreshPage } from "./refreshPage.js";
import { playSteps } from "./functionMakeSteps.js";
import { log } from "./trace.js";
import { nextScreen } from "./navigation.js";
import { enemies } from "./fight.js";
import { skin } from "./functionChangeStyle.js";

export function loadLvl11() {

  //Trace the entry in the function
  log("Enter in L11", "blue");

  //Set the level in the local storage
  localStorage.setItem("level", "11");

  const steps = [
      { character: "NarraChara", Txt: "E11Narra" },
      { character: "SylvainChara", Txt: "E11Sylvain", name: "E11Sylvain" },
      { character: "BergerChara", Txt: "E11Berger", name: "E11Berger" },
      { character: "NarraChara", Txt: "E11Narra2" },
      { character: "SylvainChara", Txt: "E11Sylvain2", name: "E11Sylvain2" },
      { character: "NarraChara", Txt: "E11Narra3" },
      { character: "BergerChara", Txt: "E11Berger2", name: "E11Berger2" },
      { character: "SylvainChara", Txt: "E11Sylvain3", name: "E11Sylvain3" },
      { character: "NarraChara", Txt: "E11Narra4" },
  ];

  // Refresh the page
  refreshPage();

  //Play the steps of the level 11
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
      { character: "SylvainChara", Txt: "E11Sylvain4", name: "E11Sylvain4" },
      { character: "NarraChara", Txt: "E11Narra5" },
      { character: "BergerChara", Txt: "E11Berger3", name: "E11Berger3"},
      { character: "SylvainChara", Txt: "E11Sylvain5", name: "E11Sylvain5" },
      { character: "NarraChara", Txt: "E11Narra6", nextLvl: () => { nextScreen("5", "16");}}
  ];

  playSteps(steps2, 0 , true , 4);

  let orcu = true;

  return orcu;
    
    
}