import { ARSystem } from './systems/ARSystem.js';
import { loadSceneContent } from './content/SceneContent.js';
import { initUI } from './ui/UIManager.js';

const main = async () => {
  
  // initialisation AR systeme
  const arSystem = new ARSystem(
    "#container", 
    "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind"
  );

  // 2. charge le contenu 3D
  loadSceneContent(arSystem);

  // 3. Initialise l'IU 
  initUI({
    onStart: () => {
      console.log("AR Started");
      arSystem.start();
    },
    onStop: () => {
      console.log("AR Stopped");
      arSystem.stop();
    }
  });
};

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", main);