import * as THREE from 'three';
import { ARSystem } from './systems/ARSystem.js';
import { loadSceneContent } from './content/SceneContent.js';


function createMesh() {
  // 3. Contenu 3D (Géométrie & Matériaux)
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.5 
  });
  const obj = new THREE.Mesh(geometry, material);

  return obj
}

function create2Dobject(src) {
  // code to load the 2D image with a THREE Obj
}

function create3Dobject(src) {
  // code to load the 3D obj with a THREE Obj
}

const main = async () => {
  
  // --- CONFIGURATION ---
  const containerId = "#container";
  // const targetUrl = "./assets/markers/00.mind";
  const targetUrl = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind";
  // ---------------------

  

  // 2. Charger la scène en passant l'URL
  // Ordre des paramètres : (Selecteur, URL, Système)
  // 
  loadSceneContent(targetUrl, create2Dobject("./assets/img/00.png"), containerId);

  
};

document.addEventListener("DOMContentLoaded", main);