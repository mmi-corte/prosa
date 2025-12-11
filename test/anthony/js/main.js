/**
 * AR Character Experience - Main Entry Point
 */

import * as THREE from 'three';
import { ARSystem } from './ARSystem.js';
import { CharacterController } from './CharacterController.js';
import { UIController } from './UIController.js';

// Configuration
const CONFIG = {
  container: '#container',
  markerPath: './assets/markers/marker.mind',
  modelPath: './assets/3D/character.glb'
};

// Global instances
let arSystem;
let characterController;
let uiController;
let clock;

/**
 * Initialize the AR experience
 */
async function init() {
  updateStatus('Initializing AR system...');

  // Create AR system
  arSystem = new ARSystem();
  arSystem.init(CONFIG.container, CONFIG.markerPath);

  // Create anchor for the character
  const anchor = arSystem.addAnchor(0);

  // Setup lighting
  setupLighting(arSystem.scene);

  // Load character
  updateStatus('Loading character model...');
  characterController = new CharacterController(CONFIG.modelPath, anchor.group);
  
  try {
    await characterController.load();
    updateStatus('Character loaded successfully!');

    // Initialize UI controller
    uiController = new UIController(characterController, arSystem);
    uiController.init();

    // Setup animation loop
    clock = new THREE.Clock();
    setupAnimationLoop();

    updateStatus('Ready - Click Start AR');
  } catch (error) {
    console.error('Failed to load character:', error);
    updateStatus('Error loading character');
  }
}

/**
 * Setup scene lighting
 */
function setupLighting(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 2, 1);
  scene.add(directionalLight);

  // Additional fill light
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-1, 0.5, -1);
  scene.add(fillLight);
}

/**
 * Setup the animation loop
 */
function setupAnimationLoop() {
  console.log('Setting up animation loop...');
  
  arSystem.renderer.setAnimationLoop(() => {
    const deltaTime = clock.getDelta();
    
    if (characterController) {
      characterController.update(deltaTime);
    }

    arSystem.renderer.render(arSystem.scene, arSystem.camera);
  });
}

/**
 * Update status text
 */
function updateStatus(message) {
  const statusText = document.getElementById('statusText');
  if (statusText) {
    statusText.textContent = message;
  }
  console.log('[Status]', message);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
window.arDebug = {
  arSystem: () => arSystem,
  character: () => characterController,
  ui: () => uiController
};
