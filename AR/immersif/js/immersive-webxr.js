/**
 * Immersive AR Experience - Pure WebXR Implementation
 * Requires WebXR-compatible browser/device
 */

// ============================================
// ES Module Imports (Three.js 0.169+)
// ============================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================
// Configuration
// ============================================
const CONFIG = {
  characterId: null, // Set dynamically from menu or URL param
  characterDataPath: '../data/characters.json',
  assetBasePath: '../'
};

// All characters cache (loaded once)
let allCharacters = [];
let allCharactersLoaded = false;

// ============================================
// Global State
// ============================================
let scene, camera, renderer;
let gltfLoader, textureLoader;

// Character state
let characterData = null;
let jsonSettings = null;
let characterGroup = null;
let characterLayers = [];
let characterSound = null;
let videoTextures = [];
let animationMixers = [];
let animationClock = new THREE.Clock();

// Session state
let xrSession = null;
let isARActive = false;

// Subtitle state
let currentLanguage = 'fr';
let subtitleElement = null;
let subtitleTextElement = null;
let currentSubtitleKey = null;
let subtitleTimeout = null;
let hasShownGreeting = false;

// ============================================
// iOS Detection & WebXR Viewer Redirect
// ============================================
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function getWebXRViewerURL() {
  // WebXR Viewer uses wxrviewer:// scheme to open URLs directly
  const currentURL = window.location.href;
  return 'wxrviewer://' + currentURL.replace(/^https?:\/\//, '');
}

function getAppStoreURL() {
  // WebXR Viewer by Mozilla on App Store
  return 'https://apps.apple.com/app/webxr-viewer/id1295998056';
}

function tryOpenWebXRViewer() {
  // Direct redirect to WebXR Viewer app with this URL
  const currentURL = encodeURIComponent(window.location.href);
  
  // WebXR Viewer URL scheme: wxrviewer://open?url=<encoded-url>
  window.location.href = `wxrviewer://open?url=${currentURL}`;
}

function showIOSPrompt() {
  // Hide loading screen and show start screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
  
  const startScreen = document.getElementById('start-screen');
  if (!startScreen) return;
  startScreen.style.display = 'flex';
  
  // Find or create iOS notice
  let iosNotice = document.getElementById('ios-notice');
  if (!iosNotice) {
    iosNotice = document.createElement('div');
    iosNotice.id = 'ios-notice';
    iosNotice.style.cssText = 'background: #f59e0b22; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;';
    iosNotice.innerHTML = `
      <p style="margin: 0 0 12px 0; color: #fbbf24;">📱 <strong>iOS Detected</strong></p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #d4d4d4;">
        Safari has limited WebXR support.<br>
        For the best AR experience, use the <strong>WebXR Viewer</strong> app.
      </p>
      <button id="open-xr-viewer-btn" style="background: #f59e0b; color: #000; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: block; width: 100%;">
        � Open in WebXR Viewer
      </button>
      <a href="https://apps.apple.com/app/webxr-viewer/id1295998056" target="_blank" style="color: #fbbf24; font-size: 13px; display: block; margin-bottom: 12px;">
        Don't have it? Download WebXR Viewer
      </a>
      <button id="try-safari-btn" style="background: transparent; color: #9a9680; border: 1px solid #9a9680; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px;">
        Try Safari Anyway
      </button>
    `;
    
    // Insert before the start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.parentNode.insertBefore(iosNotice, startBtn);
      startBtn.style.display = 'none'; // Hide default button
    } else {
      startScreen.querySelector('.start-content')?.appendChild(iosNotice);
    }
  }
  
  // Add event listeners
  document.getElementById('open-xr-viewer-btn')?.addEventListener('click', tryOpenWebXRViewer);
  document.getElementById('try-safari-btn')?.addEventListener('click', () => {
    iosNotice.style.display = 'none';
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.style.display = 'block';
    checkWebXRSupport();
  });
}

function checkWebXRSupport() {
  // Check for AR support
  navigator.xr.isSessionSupported('immersive-ar').then(async supported => {
    if (!supported) {
      showError('WebXR AR not supported on this device/browser.');
      return;
    }
    console.log('WebXR AR is supported');
    setupScene();
    
    // Load all characters for menu
    await loadAllCharacters();
    
    // If character specified via URL, go directly to start screen
    if (CONFIG.characterId) {
      const character = allCharacters.find(c => c.id === CONFIG.characterId);
      if (character) {
        updateStartScreenForCharacter(character);
        setupUI();
      } else {
        console.warn('Character not found:', CONFIG.characterId);
        showCharacterMenu();
      }
    } else {
      // Show character selection menu
      showCharacterMenu();
    }
  }).catch(err => {
    console.error('WebXR check failed:', err);
    showError('WebXR not available: ' + err.message);
  });
}

// ============================================
// Initialization
// ============================================
function init() {
  console.log('Initializing WebXR AR experience...');
  
  // Check for character ID in URL (for MindAR scan integration)
  const urlParams = new URLSearchParams(window.location.search);
  const characterFromUrl = urlParams.get('character') || urlParams.get('id');
  
  if (characterFromUrl) {
    console.log('Character from URL:', characterFromUrl);
    CONFIG.characterId = characterFromUrl;
  }
  
  // Check WebXR support
  if (!navigator.xr) {
    // No WebXR at all - iOS without WebXR Viewer?
    if (isIOS()) {
      showIOSPrompt();
      return;
    }
    showError('WebXR not supported. Please use a compatible browser (Chrome on Android).');
    return;
  }
  
  // iOS with WebXR (could be Safari 15.4+ or WebXR Viewer)
  if (isIOS()) {
    // Check if we're already in WebXR Viewer (it sets a user agent hint)
    const inWebXRViewer = navigator.userAgent.includes('WebXRViewer');
    
    if (!inWebXRViewer) {
      // Show iOS prompt with option to open in WebXR Viewer
      showIOSPrompt();
      return;
    }
    console.log('Running in WebXR Viewer app');
  }
  
  checkWebXRSupport();
}

function setupScene() {
  // Scene
  scene = new THREE.Scene();
  
  // Camera with audio listener
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  const listener = new THREE.AudioListener();
  camera.add(listener);
  camera.userData.audioListener = listener;
  
  // Renderer - alpha: true required for AR camera passthrough
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true
  });
  
  // Higher pixel ratio for sharper rendering (capped for performance)
  const pixelRatio = Math.min(window.devicePixelRatio, 2.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  
  // Better color output for AR
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  document.getElementById('container').appendChild(renderer.domElement);
  
  // Lighting - Increased brightness for better AR visibility
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);
  
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7);
  scene.add(directional);
  
  // Secondary fill light from opposite direction
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);
  
  // Hemisphere light for natural sky/ground lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  
  // Loaders
  gltfLoader = new GLTFLoader();
  textureLoader = new THREE.TextureLoader();
  
  // Window resize - skip when XR is active
  window.addEventListener('resize', () => {
    if (renderer.xr.isPresenting) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  console.log('Scene setup complete');
  updateStatus('Ready to start AR');
}

function setupUI() {
  const startBtn = document.getElementById('start-webxr-ar-btn') || document.getElementById('start-btn');
  if (startBtn) {
    startBtn.textContent = 'Start AR';
    startBtn.addEventListener('click', startARSession);
  }
  
  // Back to menu button
  const backBtn = document.getElementById('back-to-menu-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Clear URL param
      const url = new URL(window.location);
      url.searchParams.delete('character');
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url);
      
      // Reset character selection
      CONFIG.characterId = null;
      
      // Hide start screen, show menu
      const startScreen = document.getElementById('start-screen');
      if (startScreen) startScreen.style.display = 'none';
      
      showCharacterMenu();
    });
  }
  
  // Subtitle elements - ensure hidden initially
  subtitleElement = document.getElementById('subtitles');
  subtitleTextElement = document.getElementById('subtitleText');
  if (subtitleElement) {
    subtitleElement.classList.remove('visible');
  }
  if (subtitleTextElement) {
    subtitleTextElement.textContent = '';
  }
  
  // Language toggle - ensure hidden initially
  const langToggle = document.getElementById('language-toggle');
  const langLabel = document.getElementById('lang-label');
  if (langToggle) {
    langToggle.classList.remove('visible');
    langToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Language toggle clicked! Current:', currentLanguage);
      currentLanguage = currentLanguage === 'fr' ? 'co' : 'fr';
      console.log('New language:', currentLanguage);
      if (langLabel) langLabel.textContent = currentLanguage.toUpperCase();
      // Update current subtitle if visible
      if (subtitleElement?.classList.contains('visible') && currentSubtitleKey) {
        showSubtitle(currentSubtitleKey);
      }
    });
    // Also add touchstart for mobile
    langToggle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      console.log('Language toggle touched!');
      currentLanguage = currentLanguage === 'fr' ? 'co' : 'fr';
      if (langLabel) langLabel.textContent = currentLanguage.toUpperCase();
      if (subtitleElement?.classList.contains('visible') && currentSubtitleKey) {
        showSubtitle(currentSubtitleKey);
      }
    }, { passive: false });
  }
  
  // Hide loading, show start
  const loading = document.getElementById('loading-screen');
  if (loading) loading.style.display = 'none';
  
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'flex';
}

// ============================================
// WebXR AR Session
// ============================================
async function startARSession() {
  console.log('Starting WebXR AR session...');
  
  // Hide UI elements
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'none';
  
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
  
  updateStatus('Starting AR...');
  
  // Set reference space type BEFORE session (Three.js standard)
  renderer.xr.setReferenceSpaceType('local');
  
  // Get overlay element for DOM Overlay feature
  const overlayElement = document.getElementById('ar-overlay');
  
  // Request AR session with DOM Overlay for HTML UI on top of AR
  try {
    const sessionOptions = {
      optionalFeatures: ['local-floor', 'hit-test', 'dom-overlay'],
      domOverlay: overlayElement ? { root: overlayElement } : undefined
    };
    xrSession = await navigator.xr.requestSession('immersive-ar', sessionOptions);
    
    // Log if DOM Overlay is active
    if (xrSession.domOverlayState) {
      console.log('DOM Overlay active, type:', xrSession.domOverlayState.type);
    } else {
      console.warn('DOM Overlay not supported - subtitles may not be visible');
    }
  } catch (err) {
    showError('Failed to start AR: ' + err.message);
    return;
  }
  
  isARActive = true;
  xrSession.addEventListener('end', onSessionEnd);
  
  // Show AR loading screen
  const arLoading = document.getElementById('ar-loading');
  if (arLoading) arLoading.classList.add('visible');
  
  // Let Three.js handle everything
  await renderer.xr.setSession(xrSession);
  console.log('Session started, blend mode:', xrSession.environmentBlendMode);
  
  // Resume audio context (needs user interaction)
  resumeAudioContext();
  
  // Load character and setup scene
  await loadCharacterData();
  setupCharacterScene();
  
  // Start render loop
  renderer.setAnimationLoop(onXRFrame);
  
  // Animate progress bar and hide loading after 6 seconds
  const loadingBar = document.querySelector('.ar-loading-bar');
  if (loadingBar) {
    loadingBar.style.transition = 'width 5.5s ease-out';
    loadingBar.style.width = '100%';
  }
  
  // Cycle through tips during loading
  const tips = [
    '💡 Tenez votre téléphone à hauteur des yeux',
    '🔊 Utilisez des écouteurs pour le son spatial',
    '🚶 Marchez pour vous déplacer dans la scène',
    '💬 Approchez-vous pour entendre les dialogues'
  ];
  let tipIndex = 0;
  const tipElement = document.querySelector('.ar-tip');
  const tipInterval = setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length;
    if (tipElement) {
      tipElement.style.opacity = '0';
      setTimeout(() => {
        tipElement.textContent = tips[tipIndex];
        tipElement.style.opacity = '1';
      }, 300);
    }
  }, 1500);
  
  // Hide loading screen after 6 seconds
  setTimeout(() => {
    clearInterval(tipInterval);
    if (arLoading) {
      arLoading.classList.add('fade-out');
      setTimeout(() => {
        arLoading.classList.remove('visible', 'fade-out');
      }, 500);
    }
    
    // Show language toggle
    const langToggle = document.getElementById('language-toggle');
    if (langToggle) langToggle.classList.add('visible');
    
    // Show hint briefly
    const arHint = document.getElementById('ar-hint');
    if (arHint) {
      arHint.style.display = 'flex';
      arHint.classList.add('visible');
      setTimeout(() => {
        arHint.classList.remove('visible');
        setTimeout(() => { arHint.style.display = 'none'; }, 500);
      }, 4000);
    }
  }, 6000);
  
  updateStatus('AR Active');
}

function onSessionEnd() {
  console.log('AR session ended');
  isARActive = false;
  xrSession = null;
  
  stopAllAudio();
  hideSubtitle();
  hasShownGreeting = false;
  
  // Hide language toggle
  const langToggle = document.getElementById('language-toggle');
  if (langToggle) langToggle.classList.remove('visible');
  
  renderer.setAnimationLoop(null);
  
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'block';
  
  updateStatus('AR session ended');
}

// ============================================
// Render Loop
// ============================================
let frameCount = 0;
function onXRFrame(time, frame) {
  if (!frame) return;
  
  frameCount++;
  if (frameCount <= 3) {
    console.log('XR Frame', frameCount);
  }
  
  // Update animation mixers
  const delta = animationClock.getDelta();
  animationMixers.forEach(mixer => mixer.update(delta));
  
  // Update billboards to face camera
  updateBillboards();
  
  // Update video textures
  updateVideoTextures();
  
  // Check proximity for subtitles
  checkCharacterProximity();
  
  // Render - Three.js handles everything including camera passthrough
  renderer.render(scene, camera);
}

// ============================================
// Character Loading & Scene Setup
// ============================================

/**
 * Load all characters from JSON for menu display
 */
async function loadAllCharacters() {
  if (allCharactersLoaded) return allCharacters;
  
  try {
    const res = await fetch(CONFIG.characterDataPath);
    const data = await res.json();
    jsonSettings = data.settings || {};
    allCharacters = data.characters || [];
    allCharactersLoaded = true;
    console.log('Loaded', allCharacters.length, 'characters');
    return allCharacters;
  } catch (err) {
    console.error('Failed to load characters:', err);
    showError('Failed to load character data');
    return [];
  }
}

/**
 * Show the character selection menu
 */
function showCharacterMenu() {
  const loading = document.getElementById('loading-screen');
  if (loading) loading.style.display = 'none';
  
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'none';
  
  let menu = document.getElementById('character-menu');
  if (!menu) {
    console.error('Character menu element not found');
    return;
  }
  
  // Populate the grid
  const grid = menu.querySelector('.character-grid');
  if (grid) {
    grid.innerHTML = '';
    
    allCharacters.forEach(char => {
      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.characterId = char.id;
      card.style.setProperty('--theme-color', char.themeColor || '#6366F1');
      
      // Get portrait image
      const portrait = char.portrait || char.assets?.['2d']?.find(a => a.id === 'character')?.path;
      const portraitPath = portrait ? CONFIG.assetBasePath + portrait : '';
      
      card.innerHTML = `
        <div class="character-portrait">
          ${portraitPath ? `<img src="${portraitPath}" alt="${char.name}" onerror="this.style.display='none'">` : ''}
          <div class="character-portrait-fallback">${char.name.charAt(0)}</div>
        </div>
        <div class="character-info">
          <h3 class="character-name">${char.name}</h3>
          <span class="character-region">${char.region || ''}</span>
        </div>
      `;
      
      card.addEventListener('click', () => selectCharacter(char.id));
      grid.appendChild(card);
    });
  }
  
  menu.style.display = 'flex';
}

/**
 * Select a character and proceed to start screen
 * @param {string} characterId - The character ID to select
 */
function selectCharacter(characterId) {
  const character = allCharacters.find(c => c.id === characterId);
  if (!character) {
    console.error('Character not found:', characterId);
    return;
  }
  
  CONFIG.characterId = characterId;
  console.log('Selected character:', character.name);
  
  // Update URL without reload (for sharing/bookmarking)
  const url = new URL(window.location);
  url.searchParams.set('character', characterId);
  window.history.replaceState({}, '', url);
  
  // Hide menu, show start screen
  const menu = document.getElementById('character-menu');
  if (menu) menu.style.display = 'none';
  
  updateStartScreenForCharacter(character);
  setupUI();
}

/**
 * Update the start screen with character-specific info
 * @param {Object} character - Character data object
 */
function updateStartScreenForCharacter(character) {
  // Update page title
  document.title = `${character.name} - Expérience AR - PROSA`;
  
  // Update start screen content
  const startScreen = document.getElementById('start-screen');
  if (!startScreen) return;
  
  // Update title
  const title = startScreen.querySelector('h1');
  if (title) title.textContent = `Rencontre avec ${character.name}`;
  
  // Update about section
  const aboutSection = startScreen.querySelector('.info-section p');
  if (aboutSection && character.description) {
    aboutSection.textContent = character.description;
  }
  
  // Update AR loading icon based on character
  const arLoadingIcon = document.querySelector('.ar-loading-icon');
  if (arLoadingIcon) {
    // Use first character of name as emoji fallback
    const icons = {
      'fata': '🧚',
      'strega': '🧙‍♀️',
      'signadora': '🙏',
      'fullettu': '👻',
      'squadra': '⚔️',
      'magu': '🔮',
      'mazzeru': '🌙',
      'orcu': '👹',
      'drac': '🐉',
      'matagot': '🐱',
      'tarasca': '🦎',
      'default': '✨'
    };
    arLoadingIcon.textContent = icons[character.id] || icons['default'];
  }
  
  // Apply theme color
  if (character.themeColor) {
    document.documentElement.style.setProperty('--character-theme', character.themeColor);
  }
}

async function loadCharacterData() {
  // Use cached characters if available
  if (allCharactersLoaded && allCharacters.length > 0) {
    characterData = allCharacters.find(c => c.id === CONFIG.characterId);
    if (!characterData) {
      throw new Error('Character not found: ' + CONFIG.characterId);
    }
    console.log('Using cached character:', characterData.name);
    return characterData;
  }
  
  // Otherwise fetch fresh
  const res = await fetch(CONFIG.characterDataPath);
  const data = await res.json();
  jsonSettings = data.settings || {};
  const characters = data.characters || [];
  characterData = characters.find(c => c.id === CONFIG.characterId);
  
  if (!characterData) {
    throw new Error('Character not found: ' + CONFIG.characterId);
  }
  
  console.log('Loaded character:', characterData.name);
  return characterData;
}

function setupCharacterScene() {
  if (!characterData) {
    console.error('No character data');
    return;
  }
  
  // Create character group at origin
  characterGroup = new THREE.Group();
  characterGroup.position.set(0, 0, 0);
  scene.add(characterGroup);
  
  // Check for layers (legacy fata format) or assets.2d (newer format)
  const hasLayers = characterData.layers && Object.keys(characterData.layers).length > 0;
  const assets2d = characterData.assets?.['2d'] || [];
  
  if (hasLayers) {
    // Legacy format: load from layers object
    const layers = characterData.layers;
    console.log('Setting up layers (legacy format):', Object.keys(layers));
    
    const sortedLayers = Object.entries(layers)
      .map(([key, layer]) => ({ key, ...layer }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    sortedLayers.forEach(layer => {
      console.log('Processing layer:', layer.key, 'visibleIn:', layer.visibleIn);
      if (!isVisibleInMode(layer, 'immersive')) {
        console.log('  -> Skipped (not visible in immersive)');
        return;
      }
      
      const assetPath = CONFIG.assetBasePath + layer.path;
      
      if (layer.type === 'video') {
        loadVideoLayer(layer.key, layer, assetPath);
      } else {
        loadImageLayer(layer.key, layer, assetPath);
      }
    });
  } else if (assets2d.length > 0) {
    // Newer format: load from assets.2d array
    console.log('Setting up assets.2d (newer format):', assets2d.length, 'assets');
    
    // Sort by z position (background first)
    const sortedAssets = [...assets2d].sort((a, b) => {
      const zA = a.position?.z ?? 0;
      const zB = b.position?.z ?? 0;
      return zA - zB; // More negative (further back) first
    });
    
    sortedAssets.forEach((asset, index) => {
      console.log('Processing 2D asset:', asset.id, 'visibleIn:', asset.visibleIn);
      if (!isVisibleInMode(asset, 'immersive')) {
        console.log('  -> Skipped (not visible in immersive)');
        return;
      }
      
      const assetPath = CONFIG.assetBasePath + asset.path;
      
      if (asset.type === 'video') {
        loadVideoLayer(asset.id, asset, assetPath);
      } else {
        loadImageLayer(asset.id, asset, assetPath);
      }
    });
  } else {
    console.warn('No 2D assets found for character:', characterData.id);
  }
  
  // Setup audio
  setupCharacterSound();
  
  // Load 3D models
  const assets3d = characterData.assets?.['3d'] || [];
  console.log('Loading 3D assets:', assets3d.length);
  
  assets3d.forEach(asset => {
    if (!isVisibleInMode(asset, 'immersive')) {
      console.log('  -> Skipped 3D asset (not visible in immersive):', asset.id);
      return;
    }
    const assetPath = CONFIG.assetBasePath + asset.path;
    loadGLTFModel(asset.id, asset, assetPath);
  });
  
  console.log('Character scene setup complete');
}

function isVisibleInMode(asset, mode) {
  const defaultVisibility = jsonSettings?.defaultVisibility || ['scan', 'immersive'];
  const visibility = asset.visibleIn || defaultVisibility;
  return Array.isArray(visibility) ? visibility.includes(mode) : visibility === mode;
}

// ============================================
// Layer Loading
// ============================================
function loadGLTFModel(id, config, path) {
  console.log('Loading 3D model:', id, 'from:', path);
  
  gltfLoader.load(
    path,
    gltf => {
      const model = gltf.scene;
      
      // Apply scale
      const scale = config.scale || 1;
      model.scale.set(scale, scale, scale);
      
      // Apply position
      model.position.set(
        config.position?.x ?? 0,
        config.position?.y ?? 0,
        config.position?.z ?? 0
      );
      
      // Apply rotation (degrees to radians)
      if (config.rotation) {
        model.rotation.set(
          (config.rotation.x || 0) * Math.PI / 180,
          (config.rotation.y || 0) * Math.PI / 180,
          (config.rotation.z || 0) * Math.PI / 180
        );
      }
      
      model.userData.modelId = id;
      model.userData.is3DModel = true;
      model.frustumCulled = false;
      
      // Ensure all meshes are visible and not culled
      model.traverse(child => {
        if (child.isMesh) {
          child.frustumCulled = false;
          // Enable shadows if desired
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Log available animations
      if (gltf.animations && gltf.animations.length > 0) {
        console.log('📽️ Available animations for', id + ':', gltf.animations.map(a => `"${a.name}" (${a.duration.toFixed(2)}s)`).join(', '));
      } else {
        console.log('📽️ No animations found in', id);
      }
      
      // Play animations if available
      if (config.animation && gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const clipName = config.animation.clipName;
        let clip = gltf.animations[0];
        
        if (clipName) {
          const namedClip = gltf.animations.find(a => a.name === clipName);
          if (namedClip) clip = namedClip;
        }
        
        const action = mixer.clipAction(clip);
        if (config.animation.loop !== false) {
          action.setLoop(THREE.LoopRepeat);
        }
        action.play();
        
        animationMixers.push(mixer);
        console.log('Animation started for 3D model:', id);
      }
      
      characterGroup.add(model);
      console.log('Loaded 3D model:', id);
    },
    progress => {
      const percent = (progress.loaded / progress.total * 100).toFixed(0);
      console.log('Loading 3D model', id + ':', percent + '%');
    },
    error => {
      console.error('Failed to load 3D model:', id, error);
    }
  );
}

function loadImageLayer(key, config, path) {
  console.log('Loading image layer:', key, 'from:', path);
  
  textureLoader.load(
    path,
    texture => {
      // Better texture filtering for quality
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      
      // Enable anisotropic filtering for sharper textures at angles
      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.anisotropy = maxAnisotropy;
      
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const aspect = texture.image.width / texture.image.height;
      let height = config.scale || 2;
      let width = height * aspect;
      
      if (config.scaleX) width *= config.scaleX;
      if (config.scaleY) height *= config.scaleY;
      
      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.position.set(
        config.position?.x ?? 0,
        config.position?.y ?? 0,
        config.position?.z ?? 0
      );
      mesh.userData.layerName = key;
      mesh.userData.billboard = config.billboard !== false; // default true
    
      characterGroup.add(mesh);
      characterLayers.push(mesh);
      
      console.log('Loaded image layer:', key, 'billboard:', mesh.userData.billboard);
    },
    undefined,
    (error) => {
      console.error('Failed to load image:', key, path, error);
    }
  );
}

// Chroma key shader
const ChromaKeyShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 keyColor;
    uniform float similarity;
    uniform float smoothness;
    uniform float spill;
    varying vec2 vUv;
    
    vec2 RGBtoUV(vec3 rgb) {
      return vec2(
        rgb.r * -0.169 + rgb.g * -0.331 + rgb.b * 0.5 + 0.5,
        rgb.r * 0.5 + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
      );
    }
    
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      float chromaDist = distance(RGBtoUV(texColor.rgb), RGBtoUV(keyColor));
      float alpha = smoothstep(similarity, similarity + smoothness, chromaDist);
      
      float convergence = abs(texColor.g - mix(texColor.r, texColor.b, 0.5));
      float spillMask = smoothstep(0.0, spill, convergence);
      texColor.g = mix(texColor.g, mix(texColor.r, texColor.b, 0.5), (1.0 - spillMask) * 0.5);
      
      gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
    }
  `
};

function loadVideoLayer(key, config, path) {
  console.log('Loading video layer:', key, path);
  
  const video = document.createElement('video');
  video.src = path;
  video.crossOrigin = 'anonymous';
  video.loop = config.loop !== false;
  video.muted = true; // MUST be muted for iOS autoplay
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', ''); // iOS Safari
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  
  // Add to DOM (required for some iOS versions)
  video.style.position = 'absolute';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
  video.style.width = '1px';
  video.style.height = '1px';
  document.body.appendChild(video);
  
  video.addEventListener('canplay', () => {
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    videoTexture.generateMipmaps = false;
    
    const aspect = video.videoWidth / video.videoHeight;
    let height = config.scale || 2;
    let width = height * aspect;
    
    if (config.scaleX) width *= config.scaleX;
    if (config.scaleY) height *= config.scaleY;
    
    const geo = new THREE.PlaneGeometry(width, height);
    
    let mat;
    if (config.chromaKey) {
      const keyColor = new THREE.Color(config.chromaKey);
      mat = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: videoTexture },
          keyColor: { value: keyColor },
          similarity: { value: config.tolerance || 0.4 },
          smoothness: { value: config.smoothness || 0.08 },
          spill: { value: config.spill || 0.1 }
        },
        vertexShader: ChromaKeyShader.vertexShader,
        fragmentShader: ChromaKeyShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    } else {
      mat = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    }
    
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.position.set(
      config.position?.x ?? 0,
      config.position?.y ?? 0,
      config.position?.z ?? 0
    );
    mesh.userData.layerName = key;
    mesh.userData.isVideo = true;
    mesh.userData.video = video;
    mesh.userData.billboard = config.billboard !== false; // default true
    
    characterGroup.add(mesh);
    characterLayers.push(mesh);
    videoTextures.push({ texture: videoTexture, video, mesh });
    
    // Try to play - iOS needs extra handling
    const playVideo = () => {
      video.play().then(() => {
        console.log('Video playing:', key);
      }).catch(e => {
        console.warn('Video autoplay blocked:', key, e.message);
        // Try again on next user interaction
        const retryPlay = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', retryPlay);
          document.removeEventListener('click', retryPlay);
        };
        document.addEventListener('touchstart', retryPlay, { once: true });
        document.addEventListener('click', retryPlay, { once: true });
      });
    };
    playVideo();
    
    console.log('Loaded video layer:', key, 'billboard:', mesh.userData.billboard);
  }, { once: true });
  
  video.addEventListener('error', e => {
    console.error('Video load error:', key, e.target?.error?.message || e);
  });
  
  // Force load
  video.load();
  
  // iOS fallback - try play after a short delay
  setTimeout(() => {
    if (video.paused) {
      video.play().catch(() => {});
    }
  }, 500);
}

// ============================================
// Audio
// ============================================
let audioElement = null;

function setupCharacterSound() {
  if (!characterData?.sounds) return;
  
  // Try ambient first, then intro, then any first sound
  let soundConfig = characterData.sounds.ambient;
  let soundKey = 'ambient';
  
  if (!soundConfig) {
    soundConfig = characterData.sounds.intro;
    soundKey = 'intro';
  }
  
  if (!soundConfig) {
    // Use first available sound
    const soundKeys = Object.keys(characterData.sounds);
    if (soundKeys.length > 0) {
      soundKey = soundKeys[0];
      soundConfig = characterData.sounds[soundKey];
    }
  }
  
  if (!soundConfig) return;
  
  // Check visibility
  if (soundConfig.visibleIn && !soundConfig.visibleIn.includes('immersive')) {
    console.log('Sound', soundKey, 'not visible in immersive mode');
    return;
  }
  
  const soundPath = CONFIG.assetBasePath + soundConfig.path;
  console.log('Loading character sound:', soundKey, soundPath);
  
  // Create AudioListener if not exists
  if (!camera.userData.audioListener) {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    camera.userData.audioListener = listener;
  }
  
  // Use HTMLAudioElement for better iOS compatibility
  audioElement = document.createElement('audio');
  audioElement.src = soundPath;
  audioElement.loop = soundConfig.loop !== false; // Default to true unless explicitly false
  audioElement.preload = 'auto';
  audioElement.crossOrigin = 'anonymous';
  audioElement.setAttribute('playsinline', '');
  
  // Add to DOM for iOS
  audioElement.style.display = 'none';
  document.body.appendChild(audioElement);
  
  audioElement.addEventListener('canplaythrough', () => {
    console.log('Audio ready, setting up spatial audio');
    
    // Create PositionalAudio and use MediaElementSource for spatialization
    characterSound = new THREE.PositionalAudio(camera.userData.audioListener);
    characterSound.setMediaElementSource(audioElement);
    characterSound.setRefDistance(soundConfig.refDistance || 1);
    characterSound.setMaxDistance(soundConfig.maxDistance || 10);
    characterSound.setDistanceModel('inverse');
    characterSound.setRolloffFactor(soundConfig.rolloff || 1);
    
    // Attach to character group for spatial positioning
    characterGroup.add(characterSound);
    
    // Set volume via gain
    characterSound.setVolume(soundConfig.volume !== undefined ? soundConfig.volume : 0.8);
    
    tryPlayAudio();
  }, { once: true });
  
  audioElement.addEventListener('error', (e) => {
    console.error('Audio load error:', e.target?.error?.message || e);
  });
  
  audioElement.load();
}

function tryPlayAudio() {
  if (!audioElement) return;
  
  audioElement.play().then(() => {
    console.log('Spatial audio playing');
  }).catch(e => {
    console.warn('Audio autoplay blocked:', e.message);
    // Retry on user interaction
    const retryAudio = () => {
      audioElement?.play().catch(() => {});
      document.removeEventListener('touchstart', retryAudio);
      document.removeEventListener('click', retryAudio);
    };
    document.addEventListener('touchstart', retryAudio, { once: true });
    document.addEventListener('click', retryAudio, { once: true });
  });
}

function resumeAudioContext() {
  // Try to play audio on user interaction
  tryPlayAudio();
  
  // Also resume Web Audio context if used
  const ctx = camera?.userData?.audioListener?.context;
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      console.log('AudioContext resumed');
    });
  }
}

function stopAllAudio() {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  if (characterSound?.isPlaying) {
    characterSound.stop();
  }
  videoTextures.forEach(vt => {
    if (vt.video) vt.video.pause();
  });
}

// ============================================
// Updates
// ============================================
function updateBillboards() {
  if (!characterGroup || !camera) return;
  
  characterLayers.forEach(layer => {
    // Only billboard if not explicitly disabled (default is true)
    if (layer.userData.billboard !== false) {
      layer.lookAt(camera.position);
    }
  });
}

function updateVideoTextures() {
  videoTextures.forEach(vt => {
    if (vt.video.readyState >= vt.video.HAVE_CURRENT_DATA) {
      vt.texture.needsUpdate = true;
    }
  });
}

function checkCharacterProximity() {
  if (!characterGroup) {
    return;
  }
  
  // Check if character has subtitles configured
  if (!characterData?.subtitles || Object.keys(characterData.subtitles).length === 0) {
    return;
  }
  
  const charPos = new THREE.Vector3();
  characterGroup.getWorldPosition(charPos);
  
  // Get camera world position (in WebXR, camera is tracked)
  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);
  
  const distance = camPos.distanceTo(charPos);
  const triggerDistance = characterData.interaction?.subtitleTriggerDistance || 2.5;
  
  // Debug log occasionally
  if (frameCount % 60 === 0) {
    console.log('Proximity - cam:', camPos.toArray().map(v => v.toFixed(2)), 
                'char:', charPos.toArray().map(v => v.toFixed(2)),
                'dist:', distance.toFixed(2), 'trigger:', triggerDistance);
  }
  
  // Show greeting when approaching
  if (distance < triggerDistance) {
    if (!hasShownGreeting) {
      hasShownGreeting = true;
      console.log('Triggering greeting subtitle at distance:', distance.toFixed(2));
      showSubtitle('greeting');
    }
  } else {
    // Reset when moving away
    if (hasShownGreeting && distance > triggerDistance + 1) {
      hasShownGreeting = false;
      hideSubtitle();
    }
  }
}

function showSubtitle(key, duration = 8000) {
  console.log('showSubtitle called with key:', key);
  console.log('subtitleElement:', subtitleElement);
  console.log('subtitleTextElement:', subtitleTextElement);
  console.log('characterData.subtitles:', characterData?.subtitles);
  
  if (!characterData?.subtitles?.[key]) {
    console.warn('Subtitle not found:', key);
    return;
  }
  
  const subtitleData = characterData.subtitles[key];
  const text = subtitleData[currentLanguage] || subtitleData.fr || subtitleData.co;
  
  if (!text) {
    console.warn('No text for subtitle:', key, 'in language:', currentLanguage);
    return;
  }
  
  currentSubtitleKey = key;
  
  if (subtitleTextElement) {
    subtitleTextElement.textContent = text;
    console.log('Set subtitle text to:', text);
  } else {
    console.error('subtitleTextElement is null!');
  }
  
  if (subtitleElement) {
    subtitleElement.classList.add('visible');
    console.log('Added visible class, classList:', subtitleElement.classList);
  } else {
    console.error('subtitleElement is null!');
  }
  
  // Clear previous timeout
  if (subtitleTimeout) {
    clearTimeout(subtitleTimeout);
  }
  
  // Auto-hide after duration (unless duration is 0 for permanent)
  if (duration > 0) {
    subtitleTimeout = setTimeout(() => {
      // Try to show next dialogue if available
      const nextKey = getNextSubtitleKey(key);
      if (nextKey && hasShownGreeting) {
        showSubtitle(nextKey);
      } else {
        hideSubtitle();
      }
    }, duration);
  }
  
  console.log('Showing subtitle:', key, '-', text.substring(0, 50) + '...');
}

function getNextSubtitleKey(currentKey) {
  if (!characterData?.subtitles) return null;
  
  const keys = Object.keys(characterData.subtitles);
  const currentIndex = keys.indexOf(currentKey);
  
  // Return next key if exists
  if (currentIndex >= 0 && currentIndex < keys.length - 1) {
    return keys[currentIndex + 1];
  }
  return null;
}

function hideSubtitle() {
  if (subtitleElement) subtitleElement.classList.remove('visible');
  currentSubtitleKey = null;
  if (subtitleTimeout) {
    clearTimeout(subtitleTimeout);
    subtitleTimeout = null;
  }
}

// ============================================
// Utilities
// ============================================
function updateStatus(msg) {
  const statusText = document.getElementById('status-text');
  if (statusText) statusText.textContent = msg;
  console.log('Status:', msg);
}

function showError(msg) {
  console.error(msg);
  alert(msg);
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'flex';
}

// ============================================
// Start
// ============================================
window.addEventListener('DOMContentLoaded', init);
