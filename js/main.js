import * as THREE from 'three';
import { ARSystem } from './systems/ARSystem.js';
import { loadSceneContent } from './content/SceneContent.js';


function createMesh() {
  // 3. Contenu 3D (Géométrie & Matériaux)
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const obj = new THREE.Mesh(geometry, material);

  return obj
}

function create2Dobject(src) {
  const fullPath = `./assets/img/${src}`

  // create placeholder mesh (same size as your createMesh)
  const baseWidth = 1;
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);

  // load texture asynchronously and apply when ready
  const loader = new THREE.TextureLoader();
  loader.load(
    fullPath,
    (texture) => {
      texture.minFilter = THREE.LinearFilter;
      material.map = texture;
      material.needsUpdate = true;

      // preserve aspect ratio: adjust plane height to match image aspect
      if (texture.image && texture.image.width && texture.image.height) {
        const aspect = texture.image.width / texture.image.height;
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(baseWidth, baseWidth / aspect);
      }
    },
    undefined,
    (err) => {
      console.error('Failed to load texture:', err);
    }
  );

  return mesh;
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
  loadSceneContent(targetUrl, create2Dobject("00.png"), containerId);


};

document.addEventListener("DOMContentLoaded", main);