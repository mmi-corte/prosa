import { ARSystem } from './systems/ARSystem.js';
import { loadSceneContent } from './content/SceneContent.js';
import { initUI } from './ui/UIManager.js';

const main = async () => {
  
  // 1.creation du système (vide pour l'instant)
  const arSystem = new ARSystem();

  // 2. Chargement de la scène 
  // On passe le container et le système. C'est SceneContent qui va configurer l'URL.
  loadSceneContent("#container", arSystem);

  // 3. UI
  initUI({
    onStart: () => {
      arSystem.start();
    },
    onStop: () => {
      arSystem.stop();
    }
  });
};

document.addEventListener("DOMContentLoaded", main);