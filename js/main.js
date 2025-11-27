import { ARSystem } from './systems/ARSystem.js';
import { loadSceneContent } from './content/SceneContent.js';
import { initUI } from './ui/UIManager.js';

const main = async () => {
  
  // --- CONFIGURATION ---
  const containerId = "#container";
  const targetUrl = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind";
  // ---------------------

  // 1. Instancier le système
  const arSystem = new ARSystem();

  // 2. Charger la scène en passant l'URL
  // Ordre des paramètres : (Selecteur, URL, Système)
  loadSceneContent(containerId, targetUrl, arSystem);

  // 3. UI
  initUI({
    onStart: () => arSystem.start(),
    onStop: () => arSystem.stop()
  });
};

document.addEventListener("DOMContentLoaded", main);