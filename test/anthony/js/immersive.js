/**
 * Immersive AR World - Markerless AR with Tap-to-Place
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuration
const CONFIG = {
  models: {
    'character.glb': { scale: 0.2, rotationX: Math.PI / 2 },
    'conifer_tree.glb': { scale: 0.3, rotationX: 0 },
    'stone.glb': { scale: 0.15, rotationX: 0 },
    'key.glb': { scale: 0.05, rotationX: 0 }
  }
};

// Global state
let scene, camera, renderer;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;
let selectedModel = 'character.glb';
let placedObjects = [];
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Puzzle state
let puzzleSetup = false;
let keyObject = null;
let hasKey = false;
let placementModeEnabled = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// User configuration
let userHeight = 170; // cm
let playstyle = 'standing';
let groundOffset = -1.5; // Will be calculated based on user config

/**
 * Initialize the AR experience
 */
async function init() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  
  // Add audio listener to camera for spatial audio
  const listener = new THREE.AudioListener();
  camera.add(listener);
  camera.userData.audioListener = listener;

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.getElementById('container').appendChild(renderer.domElement);

  // Setup lighting
  setupLighting();

  // Create reticle (placement indicator)
  createReticle();

  // Setup UI
  setupUI();

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Handle clicks for key collection
  window.addEventListener('click', onScreenClick);

  updateStatus('Tap "Start AR Experience" to begin');
}

/**
 * Setup scene lighting
 */
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 5, 2);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-2, 1, -2);
  scene.add(fillLight);
}

/**
 * Create placement reticle
 */
function createReticle() {
  const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x667eea });
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}

/**
 * Setup UI interactions
 */
function setupUI() {
  // Start AR button
  document.getElementById('start-ar-btn').addEventListener('click', startAR);

  // Asset selection buttons
  document.querySelectorAll('.asset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.asset-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedModel = btn.dataset.model;
      updateStatus(`Selected: ${btn.textContent.trim()}`);
    });
  });

  // Toggle menu
  document.getElementById('toggle-menu').addEventListener('click', () => {
    document.getElementById('asset-menu').classList.toggle('collapsed');
  });

  // Clear all objects
  document.getElementById('clear-all-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllObjects();
  });

  // Exit AR button
  document.getElementById('exit-ar-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    exitAR();
  });
  
  // Placement mode toggle
  document.getElementById('placement-mode').addEventListener('change', (e) => {
    placementModeEnabled = e.target.checked;
    if (placementModeEnabled) {
      updateStatus('Placement mode enabled - Tap to place objects');
    } else {
      updateStatus('Placement mode disabled - Click objects to interact');
    }
  });

  // Prevent UI taps from triggering AR select (will be set up after AR starts)
  // This needs to be added to the session select event listener

  // Select first asset by default
  document.querySelector('.asset-btn').classList.add('selected');
}

/**
 * Clear all placed objects from the scene
 */
function clearAllObjects() {
  placedObjects.forEach(obj => {
    scene.remove(obj);
  });
  placedObjects = [];
  updateStatus('All objects cleared', 'success');
  setTimeout(() => updateStatus('Tap to place more objects'), 2000);
}

/**
 * Start AR session
 */
async function startAR() {
  try {
    // Get user configuration
    userHeight = parseInt(document.getElementById('user-height').value) || 170;
    playstyle = document.getElementById('playstyle').value;
    
    // Calculate ground offset based on height and playstyle
    // Eye level is typically 90-95% of height when standing, 60-70% when sitting
    const eyeLevelRatio = playstyle === 'standing' ? 0.93 : 0.65;
    const eyeLevel = (userHeight / 100) * eyeLevelRatio; // Convert cm to meters
    groundOffset = -eyeLevel; // Negative because ground is below eye level
    
    console.log(`User config: ${userHeight}cm, ${playstyle}, ground offset: ${groundOffset.toFixed(2)}m`);
    
    // Check if WebXR is supported
    if (!navigator.xr) {
      updateStatus('WebXR not supported on this device', 'error');
      return;
    }

    // Check if AR is supported
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
      updateStatus('AR not supported on this device', 'error');
      return;
    }

    // Hide instructions
    document.getElementById('instructions').classList.add('hidden');

    // Request AR session with fallback options
    let session;
    try {
      // Try with hit-test first
      session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: [],
        optionalFeatures: ['hit-test', 'dom-overlay', 'local-floor'],
        domOverlay: { root: document.body }
      });
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      updateStatus('AR mode not available on this device', 'error');
      document.getElementById('instructions').classList.remove('hidden');
      return;
    }

    await onSessionStarted(session);
    updateStatus('AR Session Started - Tap to place objects', 'success');

  } catch (error) {
    console.error('AR Error:', error);
    updateStatus('Failed to start AR: ' + error.message, 'error');
    document.getElementById('instructions').classList.remove('hidden');
  }
}

/**
 * Handle AR session start
 */
async function onSessionStarted(session) {
  // Store session reference for exit functionality
  renderer.xr.session = session;
  
  session.addEventListener('end', onSessionEnded);
  session.addEventListener('select', onSelect);
  
  // Show exit button
  document.getElementById('exit-ar-btn').classList.remove('hidden');

  try {
    await renderer.xr.setSession(session);

    // Request hit test source with fallback
    try {
      const referenceSpace = await session.requestReferenceSpace('viewer');
      const source = await session.requestHitTestSource({ space: referenceSpace });
      hitTestSource = source;
      updateStatus('Hit test ready - Move device to find surfaces', 'success');
    } catch (hitTestError) {
      console.warn('Hit test not available:', hitTestError);
      updateStatus('Hit test unavailable - Manual placement mode', 'warning');
      // Continue without hit test - objects will be placed at fixed distance
    }

    session.requestAnimationFrame(onXRFrame);
    
    // Setup puzzle scene after a short delay
    setTimeout(() => {
      if (!puzzleSetup) {
        setupPuzzleScene();
        puzzleSetup = true;
      }
    }, 1000);
  } catch (error) {
    console.error('Session setup error:', error);
    updateStatus('Failed to initialize AR session: ' + error.message, 'error');
    throw error;
  }
}

/**
 * Setup the puzzle scene with background, road, rock, and key
 */
function setupPuzzleScene() {
  // Get camera position as reference
  const cameraPos = camera.position.clone();
  
  // Create cylindrical background around player
  const bgGeometry = new THREE.CylinderGeometry(5, 5, 4, 32, 1, true);
  const bgTexture = textureLoader.load('./assets/img/ciel.png');
  bgTexture.wrapS = THREE.RepeatWrapping;
  bgTexture.repeat.x = 4;
  const bgMaterial = new THREE.MeshBasicMaterial({ 
    map: bgTexture, 
    side: THREE.BackSide 
  });
  const background = new THREE.Mesh(bgGeometry, bgMaterial);
  background.position.set(cameraPos.x, cameraPos.y + groundOffset + 2, cameraPos.z);
  scene.add(background);
  
  // Create large ground texture
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundTexture = textureLoader.load('./assets/img/ground.jpg');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(1, 1);
  const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(cameraPos.x, cameraPos.y + groundOffset, cameraPos.z);
  scene.add(ground);
  
  // Place multiple rocks around the player
  const rockPositions = [
    { x: 1.5, z: -2.0 },
    { x: -1.8, z: -1.5 },
    { x: 2.2, z: 0.5 },
    { x: -0.8, z: 2.0 },
    { x: 0.5, z: -2.5 },
    { x: -2.5, z: 0.8 },
    { x: 1.2, z: 1.8 }
  ];
  
  rockPositions.forEach((pos, index) => {
    gltfLoader.load('./assets/3D/stone.glb', (gltf) => {
      const rock = gltf.scene.clone();
      const scale = 0.3 + Math.random() * 0.2; // Random scale variation (doubled)
      rock.scale.setScalar(scale);
      rock.position.set(
        cameraPos.x + pos.x, 
        cameraPos.y + groundOffset, 
        cameraPos.z + pos.z
      );
      // Add random Y rotation for variety, no X rotation needed
      rock.rotation.y = Math.random() * Math.PI * 2;
      scene.add(rock);
    });
  });
  
  // Place trees scattered around
  const treePositions = [
    { x: -2.0, z: -2.5 },
    { x: 2.8, z: -1.2 },
    { x: -1.2, z: 2.5 },
    { x: 1.8, z: 2.2 },
    { x: -3.0, z: 0.0 }
  ];
  
  treePositions.forEach((pos) => {
    gltfLoader.load('./assets/3D/conifer_tree.glb', (gltf) => {
      const tree = gltf.scene.clone();
      const scale = 1.5 + Math.random() * 0.6; // Random scale variation (3x larger)
      tree.scale.setScalar(scale);
      tree.position.set(
        cameraPos.x + pos.x,
        cameraPos.y + groundOffset,
        cameraPos.z + pos.z
      );
      // Random Y rotation for variety
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);
    });
  });
  
  // Place key next to one of the farther rocks
  const keyRockPos = { x: 2.2, z: 0.5 }; // Far rock position
  gltfLoader.load('./assets/3D/key.glb', (gltf) => {
    keyObject = gltf.scene;
    keyObject.scale.setScalar(0.1);
    keyObject.position.set(
      cameraPos.x + keyRockPos.x + 0.8, 
      cameraPos.y + groundOffset + 0.3, 
      cameraPos.z + keyRockPos.z + 0.6
    );
    keyObject.traverse((child) => {
      if (child.isMesh) {
        child.rotation.x = Math.PI / 2;
        child.userData.isKey = true; // Mark for click detection
      }
    });
    scene.add(keyObject);
    
    // Add spatial audio to key
    const audioLoader = new THREE.AudioLoader();
    const keySound = new THREE.PositionalAudio(camera.userData.audioListener);
    audioLoader.load('./assets/sound/SON1.mp3', (buffer) => {
      keySound.setBuffer(buffer);
      keySound.setRefDistance(0.5); // Distance where volume is normal
      keySound.setRolloffFactor(2); // How quickly sound fades
      keySound.setVolume(0.05); // Very low volume for searching
      keySound.setLoop(true);
      keySound.play();
    });
    keyObject.add(keySound);
    keyObject.userData.sound = keySound;
    
    // Add floating animation
    const animate = () => {
      if (keyObject && !hasKey) {
        keyObject.position.y = cameraPos.y + groundOffset + 0.3 + Math.sin(Date.now() * 0.003) * 0.05;
        keyObject.rotation.z += 0.01;
      }
      requestAnimationFrame(animate);
    };
    animate();
  });
  
  updateStatus('Puzzle scene loaded! Find the key hidden near the rocks', 'success');
}

/**
 * Handle AR session end
 */
function onSessionEnded() {
  hitTestSource = null;
  hitTestSourceRequested = false;
  document.getElementById('instructions').classList.remove('hidden');
  document.getElementById('exit-ar-btn').classList.add('hidden');
  updateStatus('AR Session Ended');
}

/**
 * Exit AR session
 */
function exitAR() {
  const session = renderer.xr.getSession();
  if (session) {
    session.end();
    updateStatus('Exiting AR...', 'warning');
  }
}

/**
 * Handle tap/select event to place objects
 */
function onSelect(event) {
  // Only place objects if placement mode is enabled
  if (!placementModeEnabled) {
    return;
  }
  
  console.log('onSelect triggered, reticle visible:', reticle.visible);
  
  if (reticle.visible) {
    placeObject(reticle.matrix);
  } else {
    // Fallback: place object in front of camera if hit test unavailable
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(0, 0, -1.5); // 1.5m in front of camera
    matrix.premultiply(camera.matrixWorld);
    placeObject(matrix);
  }
}

/**
 * Place a 3D object at the reticle position
 */
function placeObject(matrix) {
  const modelPath = `./assets/3D/${selectedModel}`;
  const config = CONFIG.models[selectedModel];

  gltfLoader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      
      // Clone the matrix to avoid reference issues
      const placementMatrix = matrix.clone();
      
      // Extract position and rotation from matrix
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const matrixScale = new THREE.Vector3();
      placementMatrix.decompose(position, quaternion, matrixScale);
      
      // Set position first
      model.position.copy(position);
      
      // Apply scale
      model.scale.setScalar(config.scale);
      
      // Traverse the model and apply rotation to each mesh
      model.traverse((child) => {
        if (child.isMesh) {
          child.rotation.x = config.rotationX;
        }
      });
      
      console.log('Model rotation applied - X:', config.rotationX);
      
      // Add to scene
      scene.add(model);
      placedObjects.push(model);
      
      console.log('Placed object at:', position, 'Camera at:', camera.position);
      
      updateStatus(`Placed ${selectedModel.replace('.glb', '')} (#${placedObjects.length})`, 'success');
      setTimeout(() => updateStatus('Tap to place more objects'), 2000);
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      updateStatus('Failed to load model', 'error');
    }
  );
}

/**
 * XR Frame update loop
 */
function onXRFrame(time, frame) {
  const session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  if (hitTestSource) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const hitTestResults = frame.getHitTestResults(hitTestSource);

    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(referenceSpace);

      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);
    } else {
      reticle.visible = false;
    }
  }

  renderer.render(scene, camera);
}

/**
 * Handle window resize
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Update status message
 */
function updateStatus(message, type = '') {
  const statusBar = document.getElementById('status-bar');
  const statusText = document.getElementById('status-text');
  
  statusText.textContent = message;
  statusBar.className = 'status-bar ' + type;
}

/**
 * Handle screen clicks for key collection
 */
function onScreenClick(event) {
  if (!keyObject || hasKey) return;
  
  // Calculate mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Check for intersections with key
  const intersects = raycaster.intersectObject(keyObject, true);
  
  if (intersects.length > 0) {
    // Collect the key
    hasKey = true;
    
    // Stop the audio
    if (keyObject.userData.sound) {
      keyObject.userData.sound.stop();
    }
    
    scene.remove(keyObject);
    keyObject = null;
    
    updateStatus('🔑 Key collected! Puzzle solved!', 'success');
    
    // Show celebration message
    setTimeout(() => {
      updateStatus('Great job! You found the hidden key!');
    }, 2000);
  }
}

// Initialize on load
init();
