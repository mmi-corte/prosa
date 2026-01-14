/**
 * Card Scanner - MindAR Character Card Recognition
 * 
 * Scans physical character cards and displays AR content
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

// Global state
let mindarThree = null;
let scene, camera, renderer;
let gltfLoader;
let textureLoader;

// Track loaded content per character
const characterAnchors = {};
const characterContent = {};
const activeCharacters = {};
const playedIntros = {};

// Audio state
let isMuted = false;
const activeAudioElements = [];

// Current character for modal
let currentCharacter = null;

// DOM Elements
let loadingScreen;
let loadingText;
let scanPrompt;
let characterInfo;
let statusText;

/**
 * Initialize the card scanner
 */
function initCardScanner() {
  console.log('Initializing Card Scanner...');
  
  // Get DOM elements
  loadingScreen = document.getElementById('loading-screen');
  loadingText = document.getElementById('loading-text');
  scanPrompt = document.getElementById('scan-prompt');
  characterInfo = document.getElementById('character-info');
  statusText = document.getElementById('status-text');
  
  // Initialize loaders
  gltfLoader = new GLTFLoader();
  textureLoader = new THREE.TextureLoader();
  
  // Start MindAR
  startMindAR();
}

/**
 * Start MindAR with the marker configuration
 */
async function startMindAR() {
  updateStatus('Loading AR system...');
  
  // Determine which marker file to use
  let markerFile;
  if (window.USE_INDIVIDUAL_MARKERS && window.CHARACTERS.length > 0 && window.CHARACTERS[0].markerFile) {
    markerFile = window.CHARACTERS[0].markerFile;
    console.log('Using individual marker file:', markerFile);
  } else {
    markerFile = window.MARKER_CONFIG.markerFile;
    console.log('Using combined marker file:', markerFile);
  }
  
  // Create MindAR instance with quality options (from ARSystem.js)
  mindarThree = new MindARThree({
    container: document.getElementById('ar-container'),
    imageTargetSrc: markerFile,
    maxTrack: window.MARKER_CONFIG.maxTrack || 1,
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
    // Quality improvements
    filterMinCF: 0.0001,        // Smooth tracking
    filterBeta: 0.001,          // Reduce jitter
    warmupTolerance: 5,         // Faster initial detection
    missTolerance: 5            // Keep tracking longer when marker lost
  });
  
  // Set pixel ratio for better rendering
  mindarThree.renderer.setPixelRatio(window.devicePixelRatio);
  
  // Get Three.js components
  renderer = mindarThree.renderer;
  scene = mindarThree.scene;
  camera = mindarThree.camera;
  
  // Setup lighting
  setupLighting();
  
  // Setup anchors for each character (await for images to load)
  await setupCharacterAnchors();
  
  // Start AR
  updateStatus('Starting camera...');
  
  try {
    await mindarThree.start();
    console.log('MindAR started successfully');
    hideLoading();
    updateStatus('Scan a character card');
    showScanPrompt();
  } catch (err) {
    console.error('MindAR start error:', err);
    updateStatus('Error: ' + err.message);
  }
}

/**
 * Setup scene lighting
 */
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);
}

/**
 * Create anchors for each character in the config
 */
async function setupCharacterAnchors() {
  // When using individual marker files, only set up the character 
  // whose marker file is currently loaded
  if (window.USE_INDIVIDUAL_MARKERS) {
    // Find the character whose marker file we loaded
    const loadedMarkerFile = window.CHARACTERS[0].markerFile;
    const characterToSetup = window.CHARACTERS.find(c => c.markerFile === loadedMarkerFile);
    
    if (characterToSetup) {
      updateStatus('Setting up ' + characterToSetup.name + '...');
      await setupSingleCharacter(characterToSetup);
    } else {
      console.error('No character found for loaded marker file');
    }
  } else {
    // Combined marker file - set up all characters with their marker indices
    updateStatus('Setting up ' + window.CHARACTERS.length + ' character(s)...');
    
    for (let i = 0; i < window.CHARACTERS.length; i++) {
      const character = window.CHARACTERS[i];
      await setupSingleCharacter(character);
    }
  }
}

/**
 * Setup anchor and content for a single character
 */
async function setupSingleCharacter(character) {
  // When using individual marker files, always use index 0
  // When using combined file, use the character's markerIndex
  const markerIndex = window.USE_INDIVIDUAL_MARKERS ? 0 : character.markerIndex;
  
  console.log('Setting up character:', character.id, 'at marker index:', markerIndex);
  
  // Create anchor for this character's marker
  const anchor = mindarThree.addAnchor(markerIndex);
  characterAnchors[character.id] = anchor;
  
  // Add content directly to anchor.group (like main.js does)
  const contentGroup = anchor.group;
  characterContent[character.id] = contentGroup;
  
  // Load 3D model if specified
  if (character.model3D && character.model3D.path && character.model3D.path !== 'null') {
    load3DModel(character, contentGroup);
  }
  
  // Load 2D images if specified (await for proper loading)
  if (character.images2D && character.images2D.length > 0) {
    await load2DImages(character, contentGroup);
    console.log('✅ All 2D images loaded for', character.id);
    console.log('📦 Anchor group children:', contentGroup.children.length);
    contentGroup.children.forEach((child, i) => {
      console.log(`   Child ${i}:`, child.type, child.visible, 'pos:', child.position);
    });
  }
  
  // Debug: Log anchor group info
  console.log('🎯 Anchor group:', anchor.group);
  console.log('🎯 Anchor group visible:', anchor.group.visible);
  
  // Setup target found/lost events
  anchor.onTargetFound = () => {
    onCharacterFound(character);
  };
  
  anchor.onTargetLost = () => {
    onCharacterLost(character);
  };
}

/**
 * Load 3D model for a character
 */
function load3DModel(character, contentGroup) {
  const modelConfig = character.model3D;
  
  gltfLoader.load(
    modelConfig.path,
    (gltf) => {
      const model = gltf.scene;
      
      // Apply scale
      const scale = modelConfig.scale || 0.1;
      model.scale.setScalar(scale);
      
      // Apply position
      if (modelConfig.position) {
        model.position.set(
          modelConfig.position.x || 0,
          modelConfig.position.y || 0,
          modelConfig.position.z || 0
        );
      }
      
      // Apply rotation
      if (modelConfig.rotation) {
        model.rotation.set(
          modelConfig.rotation.x || 0,
          modelConfig.rotation.y || 0,
          modelConfig.rotation.z || 0
        );
      }
      
      // Play animations if available and enabled
      if (modelConfig.animation && gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
        
        // Store mixer for updating
        model.userData.mixer = mixer;
        model.userData.clock = new THREE.Clock();
      }
      
      contentGroup.add(model);
      console.log('3D model loaded for:', character.id);
    },
    undefined,
    (error) => {
      console.error('Error loading 3D model for', character.id, ':', error);
    }
  );
}

/**
 * Load 2D images for a character
 */
async function load2DImages(character, contentGroup) {
  for (let i = 0; i < character.images2D.length; i++) {
    const imageConfig = character.images2D[i];
    await loadSingle2DImage(imageConfig, contentGroup, character.id);
  }
}

/**
 * Load a single 2D image (using async like main.js)
 */
async function loadSingle2DImage(imageConfig, contentGroup, characterId) {
  console.log('Loading 2D image:', imageConfig.path, 'for', characterId);
  
  try {
    const texture = await textureLoader.loadAsync(imageConfig.path);
    console.log('Texture loaded successfully:', imageConfig.path);
    
    // Get aspect ratio from texture
    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;
    const aspectRatio = imageWidth / imageHeight;
    
    console.log('Image dimensions:', imageWidth, 'x', imageHeight, 'aspect:', aspectRatio);
    
    // Create plane geometry with correct aspect ratio
    const baseScale = imageConfig.scale || 1;
    const scale = baseScale * 2; // Double the size
    const planeWidth = scale * aspectRatio;
    const planeHeight = scale;
    
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: imageConfig.opacity !== undefined ? imageConfig.opacity : 1,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    
    const plane = new THREE.Mesh(geometry, material);
    
    // Position the plane - lift it up from marker surface to prevent z-fighting
    // In MindAR: X=right, Y=up (away from marker), Z=towards camera
    const pos = imageConfig.position || { x: 0, y: 0, z: 0 };
    // Offset Y slightly above marker, and shift up by half height so bottom edge is at marker level
    const yOffset = (pos.y || 0) + (planeHeight / 2) + 0.01;
    plane.position.set(pos.x || 0, yOffset, pos.z || 0);
    
    // Make perpendicular to marker (stand up from marker surface)
    // In MindAR coordinate system, the plane needs to rotate around X to stand upright
    plane.rotation.x = Math.PI / 2;
    
    // Apply additional rotation if specified
    if (imageConfig.rotation) {
      plane.rotation.x += imageConfig.rotation.x || 0;
      plane.rotation.y += imageConfig.rotation.y || 0;
      plane.rotation.z += imageConfig.rotation.z || 0;
    }
    
    contentGroup.add(plane);
    console.log('✅ 2D plane added for:', characterId, '- Children:', contentGroup.children.length);
    
  } catch (error) {
    console.error('Error loading 2D image for', characterId, ':', error);
  }
}

/**
 * Called when a character card is detected
 */
function onCharacterFound(character) {
  console.log('Character found:', character.name);
  
  // Debug: Check anchor group state
  const contentGroup = characterContent[character.id];
  console.log('🔍 On found - Children count:', contentGroup ? contentGroup.children.length : 'no group');
  console.log('🔍 On found - Group visible:', contentGroup ? contentGroup.visible : 'no group');
  if (contentGroup) {
    contentGroup.children.forEach((child, i) => {
      console.log(`   Found child ${i}:`, child.type, 'visible:', child.visible);
    });
  }
  
  activeCharacters[character.id] = true;
  hideScanPrompt();
  updateStatus('Detected: ' + character.name);
  
  // Store current character for modal
  currentCharacter = character;
  
  // Play intro sound (only first time)
  if (!playedIntros[character.id]) {
    playSound(character, 'intro');
    playedIntros[character.id] = true;
  }
  
  // Start ambient sound
  playSound(character, 'ambient');
  
  // Update debug panel
  updateDebugPanel();
}

/**
 * Called when a character card is lost
 */
function onCharacterLost(character) {
  console.log('Character lost:', character.name);
  
  activeCharacters[character.id] = false;
  
  // Stop ambient sound
  stopSound(character, 'ambient');
  
  // Check if any characters still active
  let anyActive = false;
  for (const id in activeCharacters) {
    if (activeCharacters[id]) {
      anyActive = true;
      break;
    }
  }
  
  if (!anyActive) {
    showScanPrompt();
    currentCharacter = null;
    updateStatus('Scan a character card');
  }
  
  updateDebugPanel();
}

/**
 * Play a sound for a character
 */
function playSound(character, soundType) {
  if (!character.sounds || !character.sounds[soundType]) return;
  
  const soundConfig = character.sounds[soundType];
  const soundId = character.id + '_' + soundType;
  
  // Check if audio element already exists
  let audioEl = document.getElementById(soundId);
  
  if (!audioEl) {
    // Create audio element
    audioEl = document.createElement('audio');
    audioEl.id = soundId;
    audioEl.src = soundConfig.path;
    audioEl.volume = soundConfig.volume || 0.5;
    audioEl.loop = soundConfig.loop || false;
    audioEl.muted = isMuted; // Apply current mute state
    document.getElementById('audio-container').appendChild(audioEl);
    
    // Track audio element
    activeAudioElements.push(audioEl);
  }
  
  // Apply current mute state
  audioEl.muted = isMuted;
  
  // Play
  audioEl.currentTime = 0;
  audioEl.play().catch((e) => {
    console.log('Audio play blocked:', e.message);
  });
}

/**
 * Stop a sound for a character
 */
function stopSound(character, soundType) {
  const soundId = character.id + '_' + soundType;
  const audioEl = document.getElementById(soundId);
  
  if (audioEl) {
    audioEl.pause();
    audioEl.currentTime = 0;
  }
}

/**
 * Show character info panel
 */
function showCharacterInfo(character) {
  // Store current character for modal
  currentCharacter = character;
  
  const nameEl = document.getElementById('character-name');
  const descEl = document.getElementById('character-description');
  const statsEl = document.getElementById('character-stats');
  const portraitEl = document.getElementById('character-portrait');
  
  nameEl.textContent = character.name;
  descEl.textContent = character.description;
  
  // Build stats display
  let statsHtml = '';
  if (character.stats) {
    for (const stat in character.stats) {
      const value = character.stats[stat];
      statsHtml += '<div class="stat-row">';
      statsHtml += '<span class="stat-name">' + stat.toUpperCase() + '</span>';
      statsHtml += '<div class="stat-bar"><div class="stat-fill" style="width: ' + value + '%; background: ' + character.themeColor + ';"></div></div>';
      statsHtml += '<span class="stat-value">' + value + '</span>';
      statsHtml += '</div>';
    }
  }
  statsEl.innerHTML = statsHtml;
  
  // Set portrait
  if (character.portrait) {
    portraitEl.style.backgroundImage = 'url(' + character.portrait + ')';
    portraitEl.style.display = 'block';
  } else {
    portraitEl.style.display = 'none';
  }
  
  // Apply theme color
  characterInfo.style.borderColor = character.themeColor;
  nameEl.style.color = character.themeColor;
  
  characterInfo.classList.remove('hidden');
}

/**
 * Hide character info panel
 */
function hideCharacterInfo() {
  characterInfo.classList.add('hidden');
}

/**
 * Show scan prompt
 */
function showScanPrompt() {
  scanPrompt.classList.remove('hidden');
}

/**
 * Hide scan prompt
 */
function hideScanPrompt() {
  scanPrompt.classList.add('hidden');
}

/**
 * Hide loading screen
 */
function hideLoading() {
  loadingScreen.style.opacity = '0';
  setTimeout(function() {
    loadingScreen.style.display = 'none';
  }, 500);
}

/**
 * Update status text
 */
function updateStatus(message) {
  console.log('Status:', message);
  if (statusText) {
    statusText.textContent = message;
  }
  if (loadingText) {
    loadingText.textContent = message;
  }
}

/**
 * Update debug panel
 */
function updateDebugPanel() {
  const list = document.getElementById('detected-list');
  if (!list) return;
  
  let html = '';
  for (const id in activeCharacters) {
    if (activeCharacters[id]) {
      const char = window.CHARACTERS.find((c) => c.id === id);
      if (char) {
        html += '<li style="color: ' + char.themeColor + ';">' + char.name + '</li>';
      }
    }
  }
  
  list.innerHTML = html || '<li>None</li>';
}

/**
 * Toggle debug panel
 */
function toggleDebugPanel() {
  const panel = document.getElementById('debug-panel');
  panel.classList.toggle('hidden');
}

/**
 * Toggle mute state for all audio
 */
function toggleMute() {
  isMuted = !isMuted;
  
  // Update all active audio elements
  activeAudioElements.forEach(audio => {
    audio.muted = isMuted;
  });
  
  // Also mute any audio in the audio container
  const audioContainer = document.getElementById('audio-container');
  if (audioContainer) {
    const audioElements = audioContainer.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = isMuted;
    });
  }
  
  // Update button appearance
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    if (isMuted) {
      muteBtn.classList.add('muted');
      muteBtn.innerHTML = '🔇';
      muteBtn.title = 'Unmute';
    } else {
      muteBtn.classList.remove('muted');
      muteBtn.innerHTML = '🔊';
      muteBtn.title = 'Mute';
    }
  }
  
  console.log('Audio muted:', isMuted);
}

/**
 * Open the info modal with expanded character details
 */
function openInfoModal() {
  if (!currentCharacter) {
    console.log('No character to show in modal');
    return;
  }
  
  const modal = document.getElementById('info-modal');
  const modalPortrait = document.getElementById('modal-portrait');
  const modalName = document.getElementById('modal-character-name');
  const modalDesc = document.getElementById('modal-description');
  const modalStats = document.getElementById('modal-stats');
  
  if (!modal || !modalName || !modalDesc) {
    console.log('Modal elements not found');
    return;
  }
  
  // Set portrait image
  if (modalPortrait && currentCharacter.portrait) {
    modalPortrait.style.backgroundImage = 'url(' + currentCharacter.portrait + ')';
    modalPortrait.style.display = 'block';
  } else if (modalPortrait) {
    modalPortrait.style.display = 'none';
  }
  
  // Populate modal content
  modalName.textContent = currentCharacter.name;
  modalName.style.color = currentCharacter.themeColor;
  modalDesc.textContent = currentCharacter.description;
  
  // Build expanded stats display
  if (modalStats && currentCharacter.stats) {
    let statsHtml = '';
    for (const stat in currentCharacter.stats) {
      const value = currentCharacter.stats[stat];
      statsHtml += '<div class="modal-stat-row">';
      statsHtml += '<span class="stat-name">' + stat.toUpperCase() + '</span>';
      statsHtml += '<div class="stat-bar"><div class="stat-fill" style="width: ' + value + '%; background: ' + currentCharacter.themeColor + ';"></div></div>';
      statsHtml += '<span class="stat-value">' + value + '</span>';
      statsHtml += '</div>';
    }
    modalStats.innerHTML = statsHtml;
  }
  
  // Show modal
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  
  console.log('Opened info modal for:', currentCharacter.name);
}

/**
 * Close the info modal
 */
function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') {
    toggleDebugPanel();
  }
  // Press M to toggle mute
  if (e.key === 'm' || e.key === 'M') {
    toggleMute();
  }
  // Press Escape to close modal
  if (e.key === 'Escape') {
    closeInfoModal();
  }
});

// UI button event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Close info button
  const closeBtn = document.getElementById('close-info-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideCharacterInfo();
    });
  }
  
  // Mute button
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      toggleMute();
    });
  }
  
  // Zoom/expand button
  const zoomBtn = document.getElementById('zoom-btn');
  if (zoomBtn) {
    zoomBtn.addEventListener('click', () => {
      openInfoModal();
    });
  }
  
  // Close modal button
  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      closeInfoModal();
    });
  }
  
  // Close modal when clicking outside content
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeInfoModal();
      }
    });
  }
});

// Animation loop for updating mixers AND rendering
function animate() {
  requestAnimationFrame(animate);
  
  // Update animation mixers
  for (const id in characterContent) {
    const group = characterContent[id];
    if (group) {
      group.traverse((child) => {
        if (child.userData && child.userData.mixer) {
          const delta = child.userData.clock.getDelta();
          child.userData.mixer.update(delta);
        }
      });
    }
  }
  
  // Explicitly render the scene (MindAR should do this but let's make sure)
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Start animation loop
animate();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardScanner);
} else {
  initCardScanner();
}
