import { ARSystem } from './systems/ARSystem.js';
import { loadSceneContent } from './content/SceneContent.js';
import { initUI } from './ui/UIManager.js';

const main = async () => {
  
  // --- CONFIGURATION ---
  const containerId = "#container";
  const targetUrl = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind";
  // ---------------------

    // 3. Contenu 3D (Géométrie & Matériaux)
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.5 
  });
  const plane = new THREE.Mesh(geometry, material);

  // 2. Charger la scène en passant l'URL
  // Ordre des paramètres : (Selecteur, URL, Système)
  loadSceneContent(targetUrl, plane, containerId);

  // 3. UI
  initUI({
    onStart: () => arSystem.start(),
    onStop: () => arSystem.stop()
  });
};

document.addEventListener("DOMContentLoaded", main);