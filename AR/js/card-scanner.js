/**
 * Card Scanner - MindAR Character Card Recognition
 * 
 * Scans physical character cards and displays AR content.
 * Loads character configuration from JSON file.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

// ==============================================
// CONFIGURATION
// ==============================================
const CONFIG_PATH = 'data/characters.json';

// ==============================================
// GLOBAL STATE
// ==============================================
let config = null;           // Loaded JSON config
let characters = [];         // Array of character objects
let settings = {};           // Global settings from JSON

let mindarThree = null;
let scene, camera, renderer;
let gltfLoader;
let textureLoader;

// Track loaded content per character
const characterAnchors = {};

const BlurShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float blurAmount;
    uniform float edgeSmoothing;
    uniform float useChroma;
    uniform vec3 keyColor;
    uniform float similarity;
    uniform float smoothness;
    uniform float spill;
    uniform vec2 texSize;
    uniform float opacity;
    varying vec2 vUv;

    vec2 RGBtoUV(vec3 rgb) {
      return vec2(
        rgb.r * -0.169 + rgb.g * -0.331 + rgb.b * 0.5 + 0.5,
        rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
      );
    }

    void main() {
      vec4 texColor;
      if (blurAmount <= 0.001) {
        texColor = texture2D(tDiffuse, vUv);
      } else {
        vec2 d = blurAmount / texSize;
        vec4 sum = vec4(0.0);
        float total = 0.0;
        for (int x = -2; x <= 2; x++) {
          for (int y = -2; y <= 2; y++) {
            float fx = float(x);
            float fy = float(y);
            float w = exp(-(fx*fx + fy*fy) * 0.4);
            sum += texture2D(tDiffuse, vUv + vec2(fx*d.x, fy*d.y)) * w;
            total += w;
          }
        }
        texColor = sum / total;
      }

      float chromaAlpha = 1.0;
      if (useChroma > 0.5) {
        float chromaDist = distance(RGBtoUV(texColor.rgb), RGBtoUV(keyColor));
        chromaAlpha = smoothstep(similarity, similarity + smoothness, chromaDist);
        float convergence = abs(texColor.g - mix(texColor.r, texColor.b, 0.5));
        float spillMask = smoothstep(0.0, spill, convergence);
        texColor.g = mix(texColor.g, mix(texColor.r, texColor.b, 0.5), (1.0 - spillMask) * 0.5);
      }

      float finalAlpha = texColor.a * chromaAlpha;

      if (edgeSmoothing > 0.001) {
        vec2 e = edgeSmoothing / texSize;
        float alphaSum = 0.0;
        float aTotal = 0.0;
        for (int x = -2; x <= 2; x++) {
          for (int y = -2; y <= 2; y++) {
            float fx = float(x);
            float fy = float(y);
            float w = exp(-(fx*fx + fy*fy) * 0.4);
            float a;
            if (useChroma > 0.5) {
              vec3 c = texture2D(tDiffuse, vUv + vec2(fx*e.x, fy*e.y)).rgb;
              float dist = distance(RGBtoUV(c), RGBtoUV(keyColor));
              a = smoothstep(similarity, similarity + smoothness, dist);
            } else {
              a = texture2D(tDiffuse, vUv + vec2(fx*e.x, fy*e.y)).a;
            }
            alphaSum += a * w;
            aTotal += w;
          }
        }
        float softAlpha = alphaSum / aTotal;
        finalAlpha = min(finalAlpha, smoothstep(0.0, 0.6, softAlpha));
      }

      gl_FragColor = vec4(texColor.rgb, finalAlpha * opacity);
    }
  `
};

function makeBlurMaterial(texture, config, texW, texH) {
  const hasChroma = !!config.chromaKey;
  const keyColor = hasChroma ? new THREE.Color(config.chromaKey) : new THREE.Color(0x00ff00);
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: texture },
      blurAmount: { value: config.blur || 0 },
      edgeSmoothing: { value: config.edgeSmoothing || 0 },
      useChroma: { value: hasChroma ? 1.0 : 0.0 },
      keyColor: { value: keyColor },
      similarity: { value: config.tolerance ?? 0.4 },
      smoothness: { value: config.smoothness ?? 0.08 },
      spill: { value: config.spill ?? 0.5 },
      texSize: { value: new THREE.Vector2(texW || 1024, texH || 1024) },
      opacity: { value: config.opacity ?? 1 }
    },
    vertexShader: BlurShader.vertexShader,
    fragmentShader: BlurShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false
  });
}

function needsFxShader(config) {
  // Always use the FX shader for consistency with editor preview & immersive engine.
  // Shader fast-paths to a single texture sample when both effects are 0.
  return true;
}

function normalizePath(p) {
  return typeof p === 'string' ? p.replace(/\\/g, '/') : p;
}
const characterContent = {};
const activeCharacters = {};
const playedIntros = {};

// Audio state
let isMuted = false;
const activeAudioElements = [];

// Current character for modal
let currentCharacter = null;

// Language state (false = French, true = Corsican)
let isCorsican = false;

// DOM Elements
let loadingScreen;
let loadingText;
let scanPrompt;
let statusText;

// ==============================================
// INITIALIZATION
// ==============================================

/**
 * Load character configuration from JSON
 */
async function loadConfig() {
  try {
    updateStatus('Chargement des données...');
    const response = await fetch(CONFIG_PATH);
    if (!response.ok) {
      throw new Error('Failed to load config: ' + response.status);
    }
    config = await response.json();
    
    // Extract settings and characters
    settings = config.settings || {};
    characters = config.characters || [];
    
    console.log('Config loaded:', config.version);
    console.log('Settings:', settings);
    console.log('Characters:', characters.length);
    
    return true;
  } catch (error) {
    console.error('Error loading config:', error);
    updateStatus('Erreur de chargement');
    return false;
  }
}

/**
 * Check if an asset is visible in a given mode
 * @param {Object} asset - The asset object with optional visibleIn property
 * @param {string} mode - The mode to check ('scan' or 'immersive')
 * @returns {boolean} true if the asset should be visible
 */
function isVisibleInMode(asset, mode) {
  // If no visibleIn specified, use default from settings (or show in all modes)
  const defaultVisibility = settings.defaultVisibility || ['scan', 'immersive'];
  const visibility = asset.visibleIn || defaultVisibility;
  
  // Handle both array and string formats
  if (Array.isArray(visibility)) {
    return visibility.includes(mode);
  }
  return visibility === mode;
}

/**
 * Convert JSON character format to internal format
 */
function normalizeCharacter(char) {
  return {
    id: char.id,
    name: char.name,
    description: char.description,
    descriptionCorsican: char.descriptionCorsican || '',
    themeColor: char.themeColor || settings.defaultThemeColor || '#6366F1',
    portrait: char.portrait,
    
    // Marker config
    markerFile: char.marker?.file,
    markerIndex: char.marker?.targetIndex || 0,
    
    // Stats
    stats: char.stats || {},
    
    // Assets - convert from JSON format, filtering for 'scan' mode
    images2D: (char.assets?.['2d'] || [])
      .filter(img => isVisibleInMode(img, 'scan'))
      .map(img => ({
        id: img.id || null,
        path: img.path,
        scale: img.scale || 1,
        position: img.position || { x: 0, y: 0, z: 0 },
        rotation: img.rotation || { x: 0, y: 0, z: 0 },
        opacity: img.opacity !== undefined ? img.opacity : 1,
        visibleIn: img.visibleIn || settings.defaultVisibility || ['scan', 'immersive']
      })),
    
    model3D: (char.assets?.['3d']?.[0] && isVisibleInMode(char.assets['3d'][0], 'scan')) ? {
      path: char.assets['3d'][0].path,
      scale: char.assets['3d'][0].scale || { x: 0.1, y: 0.1, z: 0.1 },
      position: char.assets['3d'][0].position || { x: 0, y: 0, z: 0 },
      rotation: char.assets['3d'][0].rotation || { x: 0, y: 0, z: 0 },
      animation: char.assets['3d'][0].animation,
      visibleIn: char.assets['3d'][0].visibleIn || settings.defaultVisibility || ['scan', 'immersive']
    } : null,
    
    // Sounds - filter for 'scan' mode
    sounds: Object.fromEntries(
      Object.entries(char.sounds || {}).filter(([key, sound]) => isVisibleInMode(sound, 'scan'))
    )
  };
}

/**
 * Initialize the card scanner
 */
async function initCardScanner() {
  console.log('Initializing Card Scanner...');
  
  // Get DOM elements
  loadingScreen = document.getElementById('loading-screen');
  loadingText = document.getElementById('loading-text');
  scanPrompt = document.getElementById('scan-prompt');
  statusText = document.getElementById('status-text');
  
  // Initialize loaders
  gltfLoader = new GLTFLoader();
  textureLoader = new THREE.TextureLoader();
  
  // Load configuration from JSON
  const configLoaded = await loadConfig();
  if (!configLoaded) {
    return;
  }
  
  // Normalize all characters
  characters = characters.map(normalizeCharacter);
  
  // Start MindAR
  await startMindAR();
}

// ==============================================
// MINDAR SETUP
// ==============================================

/**
 * Start MindAR with the marker configuration
 */
async function startMindAR() {
  updateStatus('Chargement AR...');
  
  // Find characters that have markers
  const charactersWithMarkers = characters.filter(c => c.markerFile);
  
  if (charactersWithMarkers.length === 0) {
    updateStatus('Aucun marqueur disponible', 'error');
    console.error('No characters with markers found');
    return;
  }
  
  // Store for later reference
  window.charactersWithMarkers = charactersWithMarkers;
  
  // MindAR can only load one .mind file at a time
  // Use the first available marker file
  const markerFile = charactersWithMarkers[0].markerFile;
  console.log('Loading marker file:', markerFile);
  
  // Create MindAR instance with quality options
  mindarThree = new MindARThree({
    container: document.getElementById('ar-container'),
    imageTargetSrc: markerFile,
    maxTrack: settings.maxTrack || 1,
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
    // Quality improvements
    filterMinCF: 0.0001,
    filterBeta: 0.001,
    warmupTolerance: 5,
    missTolerance: 5
  });
  
  // Set pixel ratio for better rendering
  mindarThree.renderer.setPixelRatio(window.devicePixelRatio);
  
  // Get Three.js components
  renderer = mindarThree.renderer;
  scene = mindarThree.scene;
  camera = mindarThree.camera;
  
  // Setup lighting
  setupLighting();
  
  // Setup anchors for each character
  await setupCharacterAnchors();
  
  // Start AR
  updateStatus('Démarrage caméra...');
  
  try {
    await mindarThree.start();
    console.log('MindAR started successfully');
    hideLoading();
    updateStatus('Scannez une carte personnage');
    showScanPrompt();
  } catch (err) {
    console.error('MindAR start error:', err);
    updateStatus('Erreur: ' + err.message);
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
  // Find characters that have markers
  const charactersWithMarkers = characters.filter(c => c.markerFile);
  
  if (settings.useIndividualMarkers) {
    // Only setup the character whose marker file was loaded (first one)
    const characterToSetup = charactersWithMarkers[0];
    
    if (characterToSetup) {
      updateStatus('Configuration de ' + characterToSetup.name + '...');
      await setupSingleCharacter(characterToSetup, 0);
    } else {
      console.error('No character found for loaded marker file');
    }
  } else {
    // Combined marker file - set up all characters
    updateStatus('Configuration de ' + characters.length + ' personnage(s)...');
    
    for (const character of characters) {
      await setupSingleCharacter(character, 0);
    }
  }
}

/**
 * Setup anchor and content for a single character
 */
async function setupSingleCharacter(character, fileIndex = 0) {
  const markerIndex = character.markerIndex || 0;
  
  console.log('Setting up character:', character.id, 'at marker index:', markerIndex, 'file index:', fileIndex);
  
  // Create anchor for this character's marker
  // When using multiple marker files, pass both target index and file index
  const anchor = mindarThree.addAnchor(markerIndex, fileIndex);
  characterAnchors[character.id] = anchor;
  
  // Add content directly to anchor.group
  const contentGroup = anchor.group;
  characterContent[character.id] = contentGroup;
  
  // Load 3D model if specified
  if (character.model3D && character.model3D.path) {
    load3DModel(character, contentGroup);
  }
  
  // Load 2D images if specified
  if (character.images2D && character.images2D.length > 0) {
    await load2DImages(character, contentGroup);
    console.log('✅ All 2D images loaded for', character.id);
  }
  
  // Setup target found/lost events
  anchor.onTargetFound = () => {
    onCharacterFound(character);
  };
  
  anchor.onTargetLost = () => {
    onCharacterLost(character);
  };
}

// ==============================================
// ASSET LOADING
// ==============================================

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
      if (typeof modelConfig.scale === 'number') {
        model.scale.setScalar(modelConfig.scale);
      } else {
        model.scale.set(
          modelConfig.scale.x || 0.1,
          modelConfig.scale.y || 0.1,
          modelConfig.scale.z || 0.1
        );
      }
      
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
      
      // Log available animations
      if (gltf.animations && gltf.animations.length > 0) {
        console.log('📽️ Available animations for', character.id + ':', gltf.animations.map(a => `"${a.name}" (${a.duration.toFixed(2)}s)`).join(', '));
      } else {
        console.log('📽️ No animations found in', character.id);
      }
      
      // Play animations if available
      if (modelConfig.animation && gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const clipName = modelConfig.animation.clipName;
        let clip = gltf.animations[0];
        
        if (clipName) {
          const namedClip = gltf.animations.find(a => a.name === clipName);
          if (namedClip) clip = namedClip;
        }
        
        const action = mixer.clipAction(clip);
        if (modelConfig.animation.loop !== false) {
          action.setLoop(THREE.LoopRepeat);
        }
        action.play();
        
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
  for (const imageConfig of character.images2D) {
    await loadSingle2DImage(imageConfig, contentGroup, character.id);
  }
}

/**
 * Load a single 2D image
 */
async function loadSingle2DImage(imageConfig, contentGroup, characterId) {
  console.log('Loading 2D image:', imageConfig.path, 'for', characterId);
  
  try {
    const texture = await textureLoader.loadAsync(normalizePath(imageConfig.path));
    console.log('Texture loaded successfully:', imageConfig.path);
    
    // Get aspect ratio from texture
    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;
    const aspectRatio = imageWidth / imageHeight;
    
    console.log('Image dimensions:', imageWidth, 'x', imageHeight, 'aspect:', aspectRatio);
    
    // Create plane geometry with correct aspect ratio
    const baseScale = imageConfig.scale || 1;
    const globalScale = settings.defaultAssetScale || 1;
    const scale = baseScale * globalScale;
    const planeWidth = scale * aspectRatio;
    const planeHeight = scale;
    
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const useBlur = needsFxShader(imageConfig);
    const material = useBlur
      ? makeBlurMaterial(texture, imageConfig, imageWidth, imageHeight)
      : new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: imageConfig.opacity !== undefined ? imageConfig.opacity : 1,
          side: THREE.DoubleSide,
          depthWrite: true
        });

    const plane = new THREE.Mesh(geometry, material);
    
    // Position the plane - lift it up from marker surface
    const pos = imageConfig.position || { x: 0, y: 0, z: 0 };
    const yOffset = (pos.y || 0) + (planeHeight / 2) + 0.01;
    plane.position.set(pos.x || 0, yOffset, pos.z || 0);
    
    // Make perpendicular to marker (stand up from marker surface)
    plane.rotation.x = Math.PI / 2;
    
    // Apply additional rotation if specified
    if (imageConfig.rotation) {
      plane.rotation.x += imageConfig.rotation.x || 0;
      plane.rotation.y += imageConfig.rotation.y || 0;
      plane.rotation.z += imageConfig.rotation.z || 0;
    }
    
    contentGroup.add(plane);
    console.log('✅ 2D plane added for:', characterId);
    
  } catch (error) {
    console.error('Error loading 2D image for', characterId, ':', error);
  }
}

// ==============================================
// CHARACTER EVENTS
// ==============================================

/**
 * Called when a character card is detected
 */
function onCharacterFound(character) {
  console.log('Character found:', character.name);
  
  activeCharacters[character.id] = true;
  
  hideScanPrompt();
  hideScanAnimation();
  showZoomHint();
  updateStatus('Détecté: ' + character.name);
  
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
    showScanAnimation();
    hideZoomHint();
    currentCharacter = null;
    updateStatus('Scannez une carte personnage');
  }
  
  updateDebugPanel();
}

// ==============================================
// AUDIO
// ==============================================

/**
 * Play a sound for a character
 */
function playSound(character, soundType) {
  if (!character.sounds || !character.sounds[soundType]) return;
  
  const soundConfig = character.sounds[soundType];
  const soundId = character.id + '_' + soundType;
  
  let audioEl = document.getElementById(soundId);
  
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.id = soundId;
    audioEl.src = soundConfig.path;
    audioEl.volume = soundConfig.volume || 0.5;
    audioEl.loop = soundConfig.loop || false;
    audioEl.muted = isMuted;
    document.getElementById('audio-container').appendChild(audioEl);
    
    activeAudioElements.push(audioEl);
  }
  
  audioEl.muted = isMuted;
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
 * Toggle mute state for all audio
 */
function toggleMute() {
  isMuted = !isMuted;
  
  activeAudioElements.forEach(audio => {
    audio.muted = isMuted;
  });
  
  const audioContainer = document.getElementById('audio-container');
  if (audioContainer) {
    const audioElements = audioContainer.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = isMuted;
    });
  }
  
  const muteBtn = document.getElementById('mute-btn');
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');
  
  if (muteBtn) {
    if (isMuted) {
      muteBtn.classList.add('muted');
      muteBtn.title = 'Unmute';
      if (soundOnIcon) soundOnIcon.classList.add('hidden');
      if (soundOffIcon) soundOffIcon.classList.remove('hidden');
    } else {
      muteBtn.classList.remove('muted');
      muteBtn.title = 'Mute';
      if (soundOnIcon) soundOnIcon.classList.remove('hidden');
      if (soundOffIcon) soundOffIcon.classList.add('hidden');
    }
  }
  
  console.log('Audio muted:', isMuted);
}

// ==============================================
// UI FUNCTIONS
// ==============================================

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
  
  if (!modal || !modalName || !modalDesc) {
    console.log('Modal elements not found');
    return;
  }
  
  // Find the character image from 2D assets (the one with id "character" or first image)
  let portraitPath = null;
  if (currentCharacter.images2D && currentCharacter.images2D.length > 0) {
    // Look for the image with id "character" first
    const charImage = currentCharacter.images2D.find(img => img.id === 'character');
    if (charImage) {
      portraitPath = charImage.path;
    } else {
      // Fallback to first 2D image
      portraitPath = currentCharacter.images2D[0].path;
    }
  }
  
  // Set portrait image using src attribute
  if (modalPortrait && portraitPath) {
    modalPortrait.src = portraitPath;
    modalPortrait.style.display = 'block';
    console.log('Setting portrait to:', portraitPath);
  } else if (modalPortrait) {
    modalPortrait.style.display = 'none';
  }
  
  // Populate modal content
  modalName.textContent = currentCharacter.name;
  updateModalDescription();
  
  // Update language toggle button state
  updateLangToggleButton();
  
  // Show modal
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  
  console.log('Opened info modal for:', currentCharacter.name);
}

/**
 * Update modal description based on current language
 */
function updateModalDescription() {
  const modalDesc = document.getElementById('modal-description');
  if (!modalDesc || !currentCharacter) return;
  
  if (isCorsican && currentCharacter.descriptionCorsican) {
    modalDesc.textContent = currentCharacter.descriptionCorsican;
  } else {
    modalDesc.textContent = currentCharacter.description;
  }
}

/**
 * Update language toggle button appearance
 */
function updateLangToggleButton() {
  const langBtn = document.getElementById('lang-toggle-btn');
  const corsicanFlag = document.getElementById('corsican-flag');
  const frenchFlag = document.getElementById('french-flag');
  
  if (!langBtn) return;
  
  if (isCorsican) {
    // Currently in Corsican mode, show French flag to switch back
    langBtn.classList.add('active');
    langBtn.title = 'Passer en Français';
    if (corsicanFlag) corsicanFlag.classList.add('hidden');
    if (frenchFlag) frenchFlag.classList.remove('hidden');
  } else {
    // Currently in French mode, show Corsican flag to switch
    langBtn.classList.remove('active');
    langBtn.title = 'Passer en Corse';
    if (corsicanFlag) corsicanFlag.classList.remove('hidden');
    if (frenchFlag) frenchFlag.classList.add('hidden');
  }
}

/**
 * Toggle between French and Corsican description
 */
function toggleLanguage() {
  isCorsican = !isCorsican;
  updateModalDescription();
  updateLangToggleButton();
  console.log('Language switched to:', isCorsican ? 'Corsican' : 'French');
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

/**
 * Show scan prompt
 */
function showScanPrompt() {
  if (scanPrompt) {
    scanPrompt.classList.remove('hidden');
  }
}

/**
 * Hide scan prompt
 */
function hideScanPrompt() {
  if (scanPrompt) {
    scanPrompt.classList.add('hidden');
  }
}

/**
 * Show scan animation
 */
function showScanAnimation() {
  const scanAnimation = document.getElementById('scan-animation');
  if (scanAnimation) {
    scanAnimation.classList.remove('hidden');
  }
}

/**
 * Hide scan animation
 */
function hideScanAnimation() {
  const scanAnimation = document.getElementById('scan-animation');
  if (scanAnimation) {
    scanAnimation.classList.add('hidden');
  }
}

/**
 * Show zoom hint button
 */
function showZoomHint() {
  const zoomHint = document.getElementById('zoom-hint-container');
  if (zoomHint) {
    zoomHint.classList.remove('hidden');
  }
}

/**
 * Hide zoom hint button
 */
function hideZoomHint() {
  const zoomHint = document.getElementById('zoom-hint-container');
  if (zoomHint) {
    zoomHint.classList.add('hidden');
  }
}

/**
 * Hide loading screen
 */
function hideLoading() {
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
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
      const char = characters.find(c => c.id === id);
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
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

// ==============================================
// EVENT LISTENERS
// ==============================================

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') {
    toggleDebugPanel();
  }
  if (e.key === 'm' || e.key === 'M') {
    toggleMute();
  }
  if (e.key === 'Escape') {
    closeInfoModal();
  }
});

// UI button event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '../index.html#menu';
    });
  }
  
  // Mute button
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
  }
  
  // Zoom/expand button
  const zoomBtn = document.getElementById('zoom-btn');
  if (zoomBtn) {
    zoomBtn.addEventListener('click', openInfoModal);
  }
  
  // Close modal button
  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeInfoModal);
  }
  
  // Language toggle button
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
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

// ==============================================
// ANIMATION LOOP
// ==============================================

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
  
  // Render the scene
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Start animation loop
animate();

// ==============================================
// START APPLICATION
// ==============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardScanner);
} else {
  initCardScanner();
}
