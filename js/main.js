import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

const setupAR = async () => {
  const container = document.querySelector("#container");
  const startButton = document.querySelector("#startButton");
  const stopButton = document.querySelector("#stopButton");

  // Initialisation de MindAR
  const mindarThree = new MindARThree({
    container: container,
    // Pour utiliser un fichier local dans ton dossier assets :
    // imageTargetSrc: "./assets/targets.mind" 
    
    // Pour l'exemple, je laisse le lien CDN, mais tu peux le changer :
    imageTargetSrc: "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind"
  });

  const { renderer, scene, camera } = mindarThree;

  // Création de l'ancre (Anchor)
  const anchor = mindarThree.addAnchor(0);

  // Création du contenu 3D (Plane)
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.5 
  });
  const plane = new THREE.Mesh(geometry, material);
  
  // Ajout du plan à l'ancre AR
  anchor.group.add(plane);

  // Fonction de démarrage
  const start = async () => {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  // Gestionnaires d'événements (Event Listeners)
  startButton.addEventListener("click", () => {
    start();
  });

  stopButton.addEventListener("click", () => {
    mindarThree.stop();
    mindarThree.renderer.setAnimationLoop(null);
  });
};

// Lancer le script une fois le DOM chargé (sécurité supplémentaire)
document.addEventListener("DOMContentLoaded", () => {
  setupAR();
});