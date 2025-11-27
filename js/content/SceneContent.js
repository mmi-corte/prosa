import * as THREE from 'three';
import { ARSystem } from './systems/ARSystem.js';
import { initUI } from './ui/UIManager.js';

// On ajoute 'targetUrl' dans les paramètres reçus
export const loadSceneContent = (targetUrl, plane, containerId) => {
  
   // 1. Instancier le système
   const arSystem = new ARSystem();
   arSystem.init(containerId, targetUrl);
 
   // 2. Création de l'ancre
   const anchor = arSystem.addAnchor(0);
  // 4. Ajout à la scène
  anchor.group.add(plane);

  // 3. UI
  initUI({
    onStart: () => arSystem.start(),
    onStop: () => arSystem.stop()
  });
};