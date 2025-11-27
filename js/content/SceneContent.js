import * as THREE from 'three';

// L'URL est cachée ici, elle ne pollue plus le main.js
const TARGET_URL = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind";

// La fonction prend 2 paramètres comme demandé
export const loadSceneContent = (containerSelector, arSystem) => {
  
  // 1. On initialise le système AR avec l'URL définie ici
  arSystem.init(containerSelector, TARGET_URL);

  // 2. On ajoute le contenu 3D (comme avant)
  const anchor = arSystem.addAnchor(0);

  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.5 
  });
  const plane = new THREE.Mesh(geometry, material);
  
  anchor.group.add(plane);
};