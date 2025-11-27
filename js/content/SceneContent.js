import * as THREE from 'three';

// On ajoute 'targetUrl' dans les paramètres reçus
export const loadSceneContent = (containerSelector, targetUrl, arSystem) => {
  
  // 1. Initialisation avec l'URL reçue depuis le main.js
  arSystem.init(containerSelector, targetUrl);

  // 2. Création de l'ancre
  const anchor = arSystem.addAnchor(0);

  // 3. Contenu 3D (Géométrie & Matériaux)
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.5 
  });
  const plane = new THREE.Mesh(geometry, material);
  
  // 4. Ajout à la scène
  anchor.group.add(plane);
};