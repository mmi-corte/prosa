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

export function nextScreen(screenValue="0", levelValue="0") {
  
    // Mise à jour de l'URL et historique
    let lastScreen = screenValue;
    let lastLevel = levelValue;
  
    if (screenValue <= 5 && levelValue == 0) {
      switch (screenValue) {
        case "1":
          lastScreen = "0"; 
          loadScreen1();
          localStorage.setItem("screen", "1");
          break;
        case "2":
          lastScreen = "1";
          loadScreen2();
          localStorage.setItem("screen", "2");
          break;
        case "3":
          lastScreen = "2";
          loadScreen3();
          localStorage.setItem("screen", "3");
          break;
        case "4":
          lastScreen = "3";
          loadScreen4();
          localStorage.setItem("screen", "4");
          break;
        case "5":
          lastScreen = "4";
          loadScreen5();
          localStorage.setItem("screen", "5");
          break;
        default:
          lastScreen = "0";
          loadScreen0();
          localStorage.setItem("screen", "0");
      }
    } else {
        switch (levelValue) {
          case "1":
            lastLevel = "0";
            loadLvl1();
            localStorage.setItem("level", "1");
            break;
          case "1bis":
            lastLevel = "1";
            loadLvl1bis();
            localStorage.setItem("level", "1bis");
            break;
          case "2":
            lastLevel = "1";
            loadLvl2();
            localStorage.setItem("level", "2");
            break;
          case "3":
            lastLevel = "2";
            loadLvl3();
            localStorage.setItem("level", "3");
            break;
          case "4":
            lastLevel = "3";
            loadLvl4();
            localStorage.setItem("level", "4");
            break;
          case "5":
            lastLevel = "4";
            loadLvl5();
            localStorage.setItem("level", "5");
            break;
          case "6":
            lastLevel = "5";
            loadLvl6();
            localStorage.setItem("level", "6");
            break;
          case "6bis":
            lastLevel = "5";
            loadLvl6bis();
            localStorage.setItem("level", "6bis");
            break;
          case "7":
            lastLevel = "6";
            loadLvl7();
            localStorage.setItem("level", "7");
            break;
          case "8":
            lastLevel = "7";
            loadLvl8();
            localStorage.setItem("level", "8");
            break;
          case "9":
            lastLevel = "8";
            loadLvl9();
            localStorage.setItem("level", "9");
            break;
          case "10":
            lastLevel = "9";
            loadLvl10();
            localStorage.setItem("level", "10");
            break;
          case "11":
            lastLevel = "10";
            loadLvl11();
            localStorage.setItem("level", "11");
            break;
          case "12":
            lastLevel = "11";
            loadLvl12();
            localStorage.setItem("level", "12");
            break;
          case "13":
            lastLevel = "12";
            loadLvl13();
            localStorage.setItem("level", "13");
            break;
          case "14":
            lastLevel = "13";
            loadLvl14();
            localStorage.setItem("level", "14");
            break;
          case "15":
            lastLevel = "14";
            loadLvl15();
            localStorage.setItem("level", "15");
            break;
          case "16":
            lastLevel = "15";
            loadLvl16();
            localStorage.setItem("level", "16");
            break;
          case "fin":
            lastLevel = "16";
            loadLvlfin();
            localStorage.setItem("level", "fin");
            break;
          case "finAlt":
            lastLevel = "16";
            loadLvlfinAlt();
            localStorage.setItem("level", "finAlt");
            break;
          default:
            lastLevel = "0";
            loadLvl1();
            localStorage.setItem("level", "0");
      }
    }
  
    let newState = { screen: lastScreen, level: lastLevel }
    history.pushState(newState, "", "");
  }

  // Handle the browser's "Back" button
window.addEventListener("popstate", (event) => {
    if (event.state) {
      let { screen, level } = history.state;
  
      // Refresh the current view or data
      refreshPage();
  
      localStorage.setItem("screen", screen);
      localStorage.setItem("level", level);
  
      // Navigate to the previous screen if needed
      nextScreen(screen, level);
    }
});