import { loadScreen0 } from "./screen0.js";
import { loadScreen1 } from "./screen1.js";
import { loadScreen2 } from "./screen2.js";
import { loadScreen5 } from "./screen5.js";
import { loadScreen4 } from "./screen4.js";
import { loadScreen3 } from "./screen3.js";
import { loadLvl1 } from "./lvl1.js";
import { loadLvl1bis } from "./lvl1bis.js";
import { loadLvl2 } from "./lvl2.js";
import { loadLvl3 } from "./lvl3.js";
import { loadLvl4 } from "./lvl4.js";
import { loadLvl5 } from "./lvl5.js";
import { loadLvl6 } from "./lvl6.js";
import { loadLvl6bis } from "./lvl6bis.js";
import { loadLvl7 } from "./lvl7.js";
import { loadLvl8 } from "./lvl8.js";
import { loadLvl9 } from "./lvl9.js";
import { loadLvl10 } from "./lvl10.js";
import { loadLvl11 } from "./lvl11.js";
import { loadLvl12 } from "./lvl12.js";
import { loadLvl14 } from "./lvl14.js";
import { loadLvl15 } from "./lvl15.js";
import { loadLvl16 } from "./lvl16.js";
import { loadLvlfin } from "./lvlfin.js";
import { refreshPage } from "./refreshPage.js";
import { log } from "./trace.js";

export function nextScreen(screenValue, levelValue="0", updateHistory=true) {
  
  log(`➡️ nextScreen appelé avec : ${ screenValue}, ${levelValue}, ${updateHistory}`);

  // Mise à jour de l'URL et historique
  let lastScreen = screenValue;
  let lastLevel = levelValue;

  if (screenValue <= 5 && levelValue == 0) {
    switch (screenValue) {
      case "1":        
        loadScreen1();
        break;
      case "2":
        loadScreen2();
        break;
      case "3":
        loadScreen3();
        break;
      case "4":
        loadScreen4();
        break;
      case "5":
        loadScreen5();
        break;
      default:
        loadScreen0();
    }
  } else {
      switch (levelValue) {
        case "1":
          loadLvl1();
          break;
        case "1bis":
          loadLvl1bis();
          break;
        case "2":
          loadLvl2();
          break;
        case "3":
          loadLvl3();
          break;
        case "4":
          loadLvl4();
          break;
        case "5":
          loadLvl5();
          break;
        case "6":
          loadLvl6();
          break;
        case "6bis":
          loadLvl6bis();
          break;
        case "7":
          loadLvl7();
          break;
        case "8":
          loadLvl8();
          break;
        case "9":
          loadLvl9();
          break;
        case "10":
          loadLvl10();
          break;
        case "11":
          loadLvl11();
          break;
        case "12":
          loadLvl12();
          break;
        case "13":
          loadLvl13();
          break;
        case "14":
          loadLvl14();
          break;
        case "15":
          loadLvl15();
          break;
        case "16":
          loadLvl16();
          break;
        case "fin":
          loadLvlfin();
          break;
        case "finAlt":
          loadLvlfinAlt();
          break;
        default:
          loadLvl1();
    }
  }

  // Mise à jour du dernier écran visité
  localStorage.setItem("screen", lastScreen);
  localStorage.setItem("level", lastLevel);

  log(`📌 lastScreen défini à :${lastScreen}`);
  log(`📌 lastLevel défini à :${lastLevel}`);

  // Mise à jour de l'historique
  if (updateHistory) {
    let newState = { screen: lastScreen, level: lastLevel };
    console.log("📝 pushState avec :", newState);
    history.pushState(newState, "", "");
  }

  // gestion de l'apparition du bouton qui permet de rejouer à partir du level 1 - etape 1
  const reloadBtn = document.getElementById("ReloadBtn");
  if(reloadBtn) {
    reloadBtn.style.display = lastLevel > 0 ? "block" : "none";
  }

}

  // Handle the browser's "Back" button
window.addEventListener("popstate", (event) => {
    if (event.state) {
      let { screen, level } = event.state;
  
      // Refresh the current view or data
      refreshPage();
        
      log(`🔙 popstate screen:${screen}, level:${level}`, "grey");

      // Navigate to the previous screen if needed
      nextScreen(screen, level, false);

    } else {
      log("❌ Aucun état dans event.state, retour à l'accueil.");
      nextScreen("0", "0", false);
    }
});