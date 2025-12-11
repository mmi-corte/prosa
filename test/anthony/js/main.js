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
let audioListener;
let spatialSound;
let normalSound; // Non-spatial audio for when marker is lost
let audioBuffer; // Store the audio buffer
let currentPlaybackTime = 0; // Track playback position
let isFirstScan = true; // Track first marker detection
let anchorFixed = false; // Track if anchor should stay fixed
let staticBackground = null; // Store reference to static background objects

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

  // Setup audio listener
  audioListener = new THREE.AudioListener();
  arSystem.camera.add(audioListener);

  // Setup spatial audio
  spatialSound = new THREE.PositionalAudio(audioListener);
  normalSound = new THREE.Audio(audioListener); // Non-spatial audio
  
  const audioLoader = new THREE.AudioLoader();
  console.log('Loading audio from: ./assets/sound/SON1.mp3');
  audioLoader.load('./assets/sound/SON1.mp3', (buffer) => {
    console.log('Audio buffer received:', buffer);
    console.log('Duration:', buffer.duration, 'seconds');
    console.log('Sample rate:', buffer.sampleRate);
    
    audioBuffer = buffer; // Store buffer for switching between spatial/normal
    
    // Configure spatial audio
    spatialSound.setBuffer(buffer);
    spatialSound.setRefDistance(10); // Moderate reference distance
    spatialSound.setLoop(true);
    spatialSound.setVolume(1.5); // Clear but not distorted
    spatialSound.setRolloffFactor(1);
    spatialSound.setDistanceModel('linear');
    
    // Configure normal audio
    normalSound.setBuffer(buffer);
    normalSound.setLoop(true);
    normalSound.setVolume(1.5);
    
    console.log('✅ Spatial and normal audio configured');
    console.log('Volume:', spatialSound.getVolume());
    console.log('Loop:', spatialSound.getLoop());
    console.log('RefDistance:', spatialSound.getRefDistance());
    
    // Add audio test button handler
    document.getElementById('audioTestBtn').addEventListener('click', () => {
      console.log('🔘 Test button clicked');
      console.log('AudioContext state:', audioListener.context.state);
      console.log('Audio isPlaying:', spatialSound.isPlaying);
      
      if (audioListener.context.state === 'suspended') {
        console.log('Resuming suspended AudioContext...');
        audioListener.context.resume().then(() => {
          console.log('🔊 AudioContext resumed, state:', audioListener.context.state);
          if (!spatialSound.isPlaying) {
            console.log('Calling spatialSound.play()...');
            spatialSound.play();
            console.log('🎵 Play command sent');
          } else {
            console.log('Calling spatialSound.stop()...');
            spatialSound.stop();
            console.log('⏹️ Stop command sent');
          }
        }).catch(err => {
          console.error('Failed to resume AudioContext:', err);
        });
      } else {
        if (!spatialSound.isPlaying) {
          console.log('Calling spatialSound.play()...');
          spatialSound.play();
          console.log('🎵 Play command sent');
          setTimeout(() => {
            console.log('After 1 second - isPlaying:', spatialSound.isPlaying);
          }, 1000);
        } else {
          console.log('Calling spatialSound.stop()...');
          spatialSound.stop();
          console.log('⏹️ Stop command sent');
        }
      }
    });
  }, 
  (progress) => {
    console.log('Loading audio...', Math.round((progress.loaded / progress.total) * 100) + '%');
  },
  (error) => {
    console.error('❌ Failed to load audio:', error);
  });
  // Marker found/lost events for audio control
  anchor.onTargetFound = () => {
    console.log('🎯 Marker found!');
    
    // First scan only logic
    if (isFirstScan) {
      console.log('🎉 FIRST SCAN DETECTED!');
      isFirstScan = false;
      anchorFixed = true; // Fix the anchor after first detection
      
      // Keep anchor visible permanently
      anchor.group.visible = true;
    }
    
    // Switch from normal to spatial audio
    if (normalSound && normalSound.isPlaying) {
      currentPlaybackTime = normalSound.context.currentTime - normalSound.startedAt + normalSound.offset;
      normalSound.stop();
      console.log('⏸️ Normal audio stopped, switching to spatial');
    }
    
    if (spatialSound && spatialSound.buffer) {
      // Ensure AudioContext is running before playing
      if (audioListener.context.state === 'suspended') {
        audioListener.context.resume().then(() => {
          console.log('🔊 AudioContext resumed on marker detection');
          spatialSound.play();
          if (currentPlaybackTime > 0) {
            spatialSound.offset = currentPlaybackTime % spatialSound.buffer.duration;
          }
          console.log('✅ Spatial audio playing');
          updateStatus('Marker detected - Spatial audio');
        });
      } else {
        spatialSound.play();
        if (currentPlaybackTime > 0) {
          spatialSound.offset = currentPlaybackTime % spatialSound.buffer.duration;
        }
        console.log('✅ Spatial audio playing');
        updateStatus('Marker detected - Spatial audio');
      }
    }
  };

  anchor.onTargetLost = () => {
    console.log('❌ Marker lost');
    
    if (anchorFixed) {
      // Keep anchor visible and freeze at current position
      anchor.group.visible = true;
      console.log('🔒 Object stays visible at locked position');
      updateStatus('Marker lost - Object locked, normal audio');
    }
    
    // Switch from spatial to normal audio
    if (spatialSound && spatialSound.isPlaying) {
      currentPlaybackTime = spatialSound.context.currentTime - spatialSound.startedAt + spatialSound.offset;
      spatialSound.stop();
      console.log('⏸️ Spatial audio stopped, switching to normal');
      
      // Play normal audio from same position
      if (normalSound && normalSound.buffer) {
        normalSound.play();
        normalSound.offset = currentPlaybackTime % normalSound.buffer.duration;
        console.log('✅ Normal audio playing');
      }
    }
  };

  // Setup lighting
  setupLighting(arSystem.scene);

  // Load character
  updateStatus('Loading character model...');
  characterController = new CharacterController(CONFIG.modelPath, anchor.group);
  
  try {
    await characterController.load();
    updateStatus('Character loaded successfully!');

    // Attach spatial audio to character model
    if (characterController.model && spatialSound) {
      characterController.model.add(spatialSound);
      console.log('✅ Spatial audio attached to character');
    }

    // Add background images (pass both scene and anchor group)
    await setupBackgroundImages(anchor.group, arSystem.scene);

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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(2, 3, 2);
  directionalLight.castShadow = true;
  
  // Shadow quality settings
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 10;
  
  scene.add(directionalLight);

  // Additional fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-2, 1, -2);
  scene.add(fillLight);
  
  // Rim light for definition
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, 1, -3);
  scene.add(rimLight);
}

/**
 * Setup background images and 3D decorations with animation
 */
async function setupBackgroundImages(anchorGroup, scene) {
  const textureLoader = new THREE.TextureLoader();
  const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js');
  const gltfLoader = new GLTFLoader();
  
  // Load textures
  const textures = {
    route: await textureLoader.loadAsync('./assets/img/route.png'),
    ciel: await textureLoader.loadAsync('./assets/img/ciel.png')
  };

  const objectsToAnimate = [];

  // Route (road) - stays attached to anchor (moves with marker)
  const routeGeometry = new THREE.PlaneGeometry(4, 4);
  const routeMaterial = new THREE.MeshBasicMaterial({ 
    map: textures.route, 
    transparent: true,
    side: THREE.DoubleSide
  });
  const route = new THREE.Mesh(routeGeometry, routeMaterial);
  route.rotation.x = Math.PI / 4.5; // Rotate up (40 degrees)
  route.position.set(-1.3, -0.5, -1);
  route.scale.set(1, 1, 1);
  anchorGroup.add(route);

  // Ciel (sky) - stays attached to anchor (moves with marker)
  const cielGeometry = new THREE.CylinderGeometry(12, 12, 8, 32, 1, true, 0, Math.PI / 2);
  const cielMaterial = new THREE.MeshBasicMaterial({ 
    map: textures.ciel, 
    transparent: true,
    side: THREE.DoubleSide
  });
  const ciel = new THREE.Mesh(cielGeometry, cielMaterial);
  ciel.rotation.x = Math.PI / 2; // Lay horizontal
  ciel.rotation.y = Math.PI / 6 + Math.PI / 2; // Rotated 90 degrees to the right
  ciel.position.set(3, 3, -2); // Moved lower and to the right
  ciel.scale.set(1, 1, 1);
  anchorGroup.add(ciel);
  
  // No static background anymore
  staticBackground = null;

  // Load and place 3D decorations (trees and stones) - pulled closer to character
  const decorations = [
    // Trees - closer to character
    { model: 'conifer_tree.glb', position: [1.0, 1.0, -0.8], scale: 0.6, rotation: 0 },
    // Stones - closer to character
    { model: 'stone.glb', position: [-1.2, 1.0, -0.4], scale: 0.25, rotation: 0 },
  ];

  // Load all 3D models
  for (const deco of decorations) {
    try {
      const gltf = await gltfLoader.loadAsync(`./assets/3D/${deco.model}`);
      const model = gltf.scene;
      
      model.position.set(deco.position[0], deco.position[1], deco.position[2]);
      model.scale.set(0, 0, 0); // Start from zero for animation
      model.userData.targetScale = deco.scale; // Store target scale
      model.rotation.x = Math.PI / 2; // Rotate to stand upright like character
      model.rotation.z = deco.rotation;
      
      anchorGroup.add(model);
      objectsToAnimate.push(model);
      
    } catch (error) {
      console.error(`Failed to load ${deco.model}:`, error);
    }
  }

  // Animate all objects appearing
  const animationDuration = 1000; // 1 second
  const startTime = Date.now();

  function animateImages() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    objectsToAnimate.forEach(obj => {
      if (obj.userData.targetScale) {
        // For 3D models with custom scale
        const targetScale = obj.userData.targetScale * eased;
        obj.scale.set(targetScale, targetScale, targetScale);
      } else {
        // For 2D images
        obj.scale.set(eased, eased, eased);
      }
    });
    
    if (progress < 1) {
      requestAnimationFrame(animateImages);
    } else {
      console.log('✅ Background images and 3D decorations loaded and animated');
    }
  }
  
  animateImages();
}

/**
 * Setup the animation loop
 */
function setupAnimationLoop() {
  console.log('Setting up animation loop...');
  
  // Cap delta time to prevent huge jumps
  let lastTime = 0;
  
  arSystem.renderer.setAnimationLoop((time) => {
    // Calculate delta time with capping
    const deltaTime = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
    lastTime = time;
    
    // After first scan, keep anchor visible and freeze its matrix
    if (anchorFixed) {
      const anchors = arSystem.mindarThree.anchors;
      if (anchors && anchors[0]) {
        const anchor = anchors[0];
        
        // Freeze matrix updates after first detection
        if (anchor.group.matrix && !anchor.group.matrixAutoUpdate) {
          // Matrix is already frozen, keep it that way
        } else if (anchor.group.visible && anchor.group.matrix) {
          // First time freezing - disable auto updates
          anchor.group.matrixAutoUpdate = false;
          console.log('📍 Matrix frozen at current position');
        }
        
        // Force visibility
        anchor.group.visible = true;
      }
    }
    
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
  ui: () => uiController,
  audio: () => spatialSound
};
