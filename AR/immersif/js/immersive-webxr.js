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
let contentGroup = null;
let characterLayers = [];
let characterSound = null;
let videoTextures = [];
let animationMixers = [];
let animationClock = new THREE.Clock();

// Session state
let xrSession = null;
let isARActive = false;

// Hit-test & placement state
let hitTestSource = null;
let hitTestSourceRequested = false;
let reticle = null;
let characterPlaced = false;
let stableHitCount = 0;
let lastHitPosition = new THREE.Vector3();
let fallbackPlaceRequested = false;
let moveAnimation = null;


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
      <p style="margin: 0 0 12px 0; color: #fbbf24;">📱 <strong>iOS Détecté</strong></p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #d4d4d4;">
        Safari a un support WebXR limité.<br>
        Pour une meilleure expérience AR, utilisez l'application <strong>WebXR Viewer</strong>.
      </p>
      <button id="open-xr-viewer-btn" style="background: #f59e0b; color: #000; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: block; width: 100%;">
        📲 Ouvrir dans WebXR Viewer
      </button>
      <a href="https://apps.apple.com/app/webxr-viewer/id1295998056" target="_blank" style="color: #fbbf24; font-size: 13px; display: block; margin-bottom: 12px;">
        Pas encore installé ? Télécharger WebXR Viewer
      </a>
      <button id="try-safari-btn" style="background: transparent; color: #9a9680; border: 1px solid #9a9680; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px;">
        Essayer avec Safari
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
      showError('WebXR AR non supporté sur cet appareil/navigateur.');
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
    showError('WebXR non disponible : ' + err.message);
  });
}

// ============================================
// Initialization
// ============================================
async function init() {
  console.log('Initializing WebXR AR experience...');
  
  // Check for character ID in URL (for MindAR scan integration)
  const urlParams = new URLSearchParams(window.location.search);
  const characterFromUrl = urlParams.get('character') || urlParams.get('id');
  
  if (characterFromUrl) {
    console.log('Character from URL:', characterFromUrl);
    CONFIG.characterId = characterFromUrl;
  }
  
  // Load character data early so we can show correct info even if WebXR fails
  if (CONFIG.characterId) {
    try {
      await loadAllCharacters();
      const character = allCharacters.find(c => c.id === CONFIG.characterId);
      if (character) {
        updateStartScreenForCharacter(character);
      }
    } catch (err) {
      console.warn('Could not pre-load character data:', err);
    }
  }
  
  // Check WebXR support
  if (!navigator.xr) {
    // No WebXR at all - iOS without WebXR Viewer?
    if (isIOS()) {
      showIOSPrompt();
      return;
    }
    showError('WebXR non supporté. Veuillez utiliser un navigateur compatible (Chrome sur Android).');
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

// ============================================
// Hit-Test & Tap-to-Place
// ============================================
function createReticle() {
  const ring = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xece4cb, opacity: 0.7, transparent: true });
  reticle = new THREE.Mesh(ring, mat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}

function requestHitTestSource() {
  if (hitTestSourceRequested || !xrSession) return;
  hitTestSourceRequested = true;

  xrSession.requestReferenceSpace('viewer').then(viewerSpace => {
    xrSession.requestHitTestSource({ space: viewerSpace }).then(source => {
      hitTestSource = source;
      console.log('Hit-test source ready');
    }).catch(err => {
      console.warn('Hit-test not available:', err);
      hitTestSourceRequested = false;
      // Auto-place in front if hit-test unavailable
      if (!characterPlaced) {
        placeCharacterInFront();
      }
    });
  }).catch(err => {
    console.warn('Could not get viewer reference space:', err);
    hitTestSourceRequested = false;
    if (!characterPlaced) {
      placeCharacterInFront();
    }
  });
}

function updateHitTest(frame) {
  if (!hitTestSource) return;

  const referenceSpace = renderer.xr.getReferenceSpace();
  if (!referenceSpace) return;

  const hitTestResults = frame.getHitTestResults(hitTestSource);

  if (hitTestResults.length > 0) {
    const hit = hitTestResults[0];
    const pose = hit.getPose(referenceSpace);

    if (pose) {
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);

      // Auto-place after a few stable hits to avoid noisy first detections
      if (!characterPlaced) {
        const currentPos = new THREE.Vector3();
        currentPos.setFromMatrixPosition(reticle.matrix);

        const drift = lastHitPosition.distanceTo(currentPos);
        lastHitPosition.copy(currentPos);

        // Count frames where hit position is reasonably stable (< 20cm drift)
        if (drift < 0.2) {
          stableHitCount++;
        } else {
          stableHitCount = Math.max(0, stableHitCount - 1);
        }

        // Place after 5 stable frames
        if (stableHitCount >= 5) {
          placeCharacterAtReticle();
        }
      }
    }
  } else {
    reticle.visible = false;
    stableHitCount = 0;
  }
}

function placeCharacterInFront() {
  if (!characterGroup) return;

  // Place 2m in front of camera at ground level
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(camera.quaternion);
  dir.y = 0; // Keep on same horizontal plane
  dir.normalize();

  const pos = camera.position.clone().add(dir.multiplyScalar(1));
  pos.y = camera.position.y - 1.2; // Approximate ground level

  characterGroup.position.copy(pos);
  faceCharacterToCamera();
  characterGroup.visible = true;
  characterPlaced = true;

  console.log('Character auto-placed in front at:', pos.toArray().map(v => v.toFixed(2)));
  showRepositionHint();
}

function placeCharacterAtReticle() {
  if (!characterGroup || !reticle.visible) return;

  // Extract position from reticle matrix
  const pos = new THREE.Vector3();
  pos.setFromMatrixPosition(reticle.matrix);

  characterGroup.position.copy(pos);
  faceCharacterToCamera();
  characterGroup.visible = true;
  characterPlaced = true;

  console.log('Character placed at:', pos.toArray().map(v => v.toFixed(2)));

  // Show repositioning hint after first placement
  showRepositionHint();
}

function faceCharacterToCamera() {
  if (!characterGroup || !camera) return;
  // Rotate character to face camera on Y axis only (keep upright)
  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);
  const charPos = characterGroup.position.clone();
  camPos.y = charPos.y; // Ignore vertical difference
  characterGroup.lookAt(camPos);
}

function showRepositionHint() {
  const arHint = document.getElementById('ar-hint');
  if (!arHint) return;

  arHint.querySelector('span').textContent = 'Touchez pour repositionner le personnage';
  arHint.style.display = 'flex';
  arHint.classList.add('visible');
  setTimeout(() => {
    arHint.classList.remove('visible');
    setTimeout(() => { arHint.style.display = 'none'; }, 500);
  }, 3000);
}

function onSelectTap() {
  // Reposition character to where reticle is pointing
  if (!characterPlaced || !reticle || !reticle.visible || !characterGroup) return;

  const pos = new THREE.Vector3();
  pos.setFromMatrixPosition(reticle.matrix);

  // Start move animation (runs inside XR render loop via onXRFrame)
  moveAnimation = {
    startPos: characterGroup.position.clone(),
    endPos: pos,
    startTime: performance.now(),
    duration: 300
  };

  console.log('Character repositioning to:', pos.toArray().map(v => v.toFixed(2)));
}

function setupUI() {
  const startBtn = document.getElementById('start-webxr-ar-btn') || document.getElementById('start-btn');
  if (startBtn) {
    startBtn.textContent = 'Start AR';
    startBtn.addEventListener('click', startARSession);
  }
  
  // Back to menu button - redirect to main app encyclopedia
  const backBtn = document.getElementById('back-to-menu-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Redirect to main app's character encyclopedia
      window.location.href = '../../index.html#univers-prosa/encyclopedie';
    });
  }
  
  // AR Back button (visible during AR session) - redirect to main app encyclopedia
  const arBackBtn = document.getElementById('ar-back-btn');
  if (arBackBtn) {
    arBackBtn.addEventListener('click', () => {
      // End AR session if active
      if (xrSession) {
        xrSession.end();
      }
      // Redirect to main app's character encyclopedia
      window.location.href = '../../index.html#univers-prosa/encyclopedie';
    });
  }
  
  // AR Mute button
  const arMuteBtn = document.getElementById('ar-mute-btn');
  if (arMuteBtn) {
    arMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Mute button clicked');
      toggleMute();
    });
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
    showError('Échec du démarrage AR : ' + err.message);
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

  // Hide character until placed
  characterPlaced = false;
  if (characterGroup) characterGroup.visible = false;

  // Setup hit-test for tap-to-place
  createReticle();
  requestHitTestSource();

  // Listen for taps (select event) to reposition character
  xrSession.addEventListener('select', onSelectTap);

  // Fallback flag: placeCharacterInFront will be called from the render loop
  // after 5s so the camera position is up-to-date
  setTimeout(() => {
    if (!characterPlaced) {
      console.log('Hit-test fallback: will auto-place on next frame');
      fallbackPlaceRequested = true;
    }
  }, 5000);

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
    'Tenez votre téléphone à hauteur des yeux',
    'Utilisez des écouteurs pour le son spatial',
    'Marchez pour vous déplacer dans la scène',
    'Approchez-vous pour entendre les dialogues'
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
    
    // Show back button and mute button
    const arBackBtn = document.getElementById('ar-back-btn');
    if (arBackBtn) arBackBtn.classList.add('visible');
    const arMuteBtn = document.getElementById('ar-mute-btn');
    if (arMuteBtn) arMuteBtn.classList.add('visible');
    
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

  // Clean up hit-test
  hitTestSource = null;
  hitTestSourceRequested = false;
  characterPlaced = false;
  stableHitCount = 0;
  fallbackPlaceRequested = false;
  if (reticle) {
    scene.remove(reticle);
    reticle = null;
  }

  stopAllAudio();

  // Hide back button and mute button
  const arBackBtn = document.getElementById('ar-back-btn');
  if (arBackBtn) arBackBtn.classList.remove('visible');
  const arMuteBtn = document.getElementById('ar-mute-btn');
  if (arMuteBtn) arMuteBtn.classList.remove('visible');
  
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
  
  // Update hit-test reticle
  updateHitTest(frame);

  // Fallback placement (runs in render loop so camera position is valid)
  if (fallbackPlaceRequested && !characterPlaced) {
    fallbackPlaceRequested = false;
    placeCharacterInFront();
  }

  // Animate character repositioning
  if (moveAnimation) {
    const t = Math.min((time - moveAnimation.startTime) / moveAnimation.duration, 1);
    const ease = t * (2 - t); // ease-out
    characterGroup.position.lerpVectors(moveAnimation.startPos, moveAnimation.endPos, ease);
    if (t >= 1) {
      faceCharacterToCamera();
      moveAnimation = null;
    }
  }

  // Update animation mixers
  const delta = animationClock.getDelta();
  animationMixers.forEach(mixer => mixer.update(delta));

  // Update billboards to face camera
  updateBillboards();

  // Update video textures
  updateVideoTextures();

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
    showError('Échec du chargement des personnages');
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
  
  // Initialize AR loading Lottie animation if not already done
  const arLoadingIcon = document.querySelector('.ar-loading-icon');
  if (arLoadingIcon && !arLoadingIcon.dataset.lottieInit && window.lottie) {
    const lottiePath = arLoadingIcon.getAttribute('data-lottie');
    if (lottiePath) {
      window.lottie.loadAnimation({
        container: arLoadingIcon,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: window.resolvePath ? window.resolvePath(lottiePath) : lottiePath
      });
      arLoadingIcon.dataset.lottieInit = 'true';
    }
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
  
  // Create character group at origin (positioned by AR hit-test)
  characterGroup = new THREE.Group();
  characterGroup.position.set(0, 0, 0);
  scene.add(characterGroup);

  // Apply scene-level transform offset from editor (nested group preserves AR placement)
  const st = characterData.sceneTransform;
  if (st) {
    const offsetGroup = new THREE.Group();
    if (st.position) {
      offsetGroup.position.set(st.position.x || 0, st.position.y || 0, st.position.z || 0);
    }
    if (st.rotation) {
      offsetGroup.rotation.set(
        THREE.MathUtils.degToRad(st.rotation.x || 0),
        THREE.MathUtils.degToRad(st.rotation.y || 0),
        THREE.MathUtils.degToRad(st.rotation.z || 0)
      );
    }
    if (st.scale) {
      offsetGroup.scale.setScalar(st.scale);
    }
    characterGroup.add(offsetGroup);
    // Store the content target — asset loaders use this
    contentGroup = offsetGroup;
  }

  // Set content group — if no sceneTransform, assets go directly into characterGroup
  if (!contentGroup) {
    contentGroup = characterGroup;
  }

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
    
    sortedLayers.forEach((layer, index) => {
      console.log('Processing layer:', layer.key, 'visibleIn:', layer.visibleIn);
      if (!isVisibleInMode(layer, 'immersive')) {
        console.log('  -> Skipped (not visible in immersive)');
        return;
      }

      // Assign fallback order from sorted index if not explicitly set
      if (layer.order == null) layer.order = index;

      const assetPath = CONFIG.assetBasePath + layer.path;

      if (layer.type === 'video') {
        loadVideoLayer(layer.key, layer, assetPath);
      } else {
        loadImageLayer(layer.key, layer, assetPath);
      }
    });
  }
  if (assets2d.length > 0) {
    // Load from assets.2d array
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

      // Assign fallback order from sorted index if not explicitly set
      if (asset.order == null) asset.order = index;

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
      
      contentGroup.add(model);
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

/**
 * Migrate old wrapShape/wrapRadius to curvature value (radians).
 */
function migrateCurvature(obj) {
  if (obj.curvature != null) return obj.curvature;
  const shape = obj.wrapShape || 'plane';
  if (shape === 'plane' || !shape) return 0;
  if (shape === 'half-cylinder') return Math.PI;
  if (shape === 'cylinder-270') return Math.PI * 1.5;
  if (shape === 'cylinder') return Math.PI * 2;
  if (shape === 'bend') return obj.wrapRadius || 2;
  return 0;
}

/**
 * Build a PlaneGeometry bent into a circular arc.
 * bendAngle in radians: 0 = flat, PI = half-circle, 2*PI = full circle.
 */
function buildBentPlane(width, height, bendAngle, curveAxis) {
  if (!bendAngle || bendAngle <= 0.01) return new THREE.PlaneGeometry(width, height);

  const isVertical = curveAxis === 'y';
  const span = isVertical ? height : width;
  const segments = Math.max(32, Math.round(bendAngle * 16));
  const segX = isVertical ? 1 : segments;
  const segY = isVertical ? segments : 1;
  const geo = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geo.attributes.position;
  const R = span / (2 * Math.sin(bendAngle / 2));

  for (let i = 0; i < pos.count; i++) {
    const coord = isVertical ? pos.getY(i) : pos.getX(i);
    const angle = (coord / span) * bendAngle;
    const newCoord = R * Math.sin(angle);
    const newZ = R * (1 - Math.cos(angle));
    if (isVertical) {
      pos.setY(i, newCoord);
    } else {
      pos.setX(i, newCoord);
    }
    pos.setZ(i, newZ);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
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
      const scale = config.scale || 1;
      const scaleX = config.scaleX || 1;
      const scaleY = config.scaleY || 1;
      const scaleZ = config.scaleZ || 1;

      // Curvature support — geometry at unit size, scale via mesh.scale (matches editor)
      const curvature = migrateCurvature(config);
      const curveAxis = config.curveAxis || 'x';
      const geo = curvature > 0.01
        ? buildBentPlane(aspect, 1, curvature, curveAxis)
        : new THREE.PlaneGeometry(aspect, 1);

      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: config.opacity ?? 1,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
        alphaTest: 0.01
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.scale.set(scale * scaleX, scale * scaleY, scaleZ);
      mesh.position.set(
        config.position?.x ?? 0,
        config.position?.y ?? 0,
        config.position?.z ?? 0
      );

      // Rotation (degrees to radians)
      const rot = config.rotation || {};
      mesh.rotation.set(
        THREE.MathUtils.degToRad(rot.x || 0),
        THREE.MathUtils.degToRad(rot.y || 0),
        THREE.MathUtils.degToRad(rot.z || 0)
      );

      // Render order for stable layer compositing
      if (config.order != null) {
        mesh.renderOrder = Math.round(config.order * 10);
      }

      mesh.userData.layerName = key;
      mesh.userData.billboard = config.billboard !== false;
      mesh.userData.hasCurvature = curvature > 0.01;

      contentGroup.add(mesh);
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
    const scale = config.scale || 1;
    const scaleX = config.scaleX || 1;
    const scaleY = config.scaleY || 1;
    const scaleZ = config.scaleZ || 1;

    // Unit-size geometry, scale via mesh.scale (matches editor)
    const geo = new THREE.PlaneGeometry(aspect, 1);

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
        depthWrite: false,
        depthTest: false
      });
    } else {
      mat = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        opacity: config.opacity ?? 1,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false
      });
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.scale.set(scale * scaleX, scale * scaleY, scaleZ);
    mesh.position.set(
      config.position?.x ?? 0,
      config.position?.y ?? 0,
      config.position?.z ?? 0
    );

    // Rotation (degrees to radians)
    const rot = config.rotation || {};
    mesh.rotation.set(
      THREE.MathUtils.degToRad(rot.x || 0),
      THREE.MathUtils.degToRad(rot.y || 0),
      THREE.MathUtils.degToRad(rot.z || 0)
    );

    // Render order for stable layer compositing
    if (config.order != null) {
      mesh.renderOrder = Math.round(config.order * 10);
    }

    mesh.userData.layerName = key;
    mesh.userData.isVideo = true;
    mesh.userData.video = video;
    mesh.userData.billboard = config.billboard !== false;

    contentGroup.add(mesh);
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
let isMuted = false;

function setupCharacterSound() {
  if (!characterData?.sounds) return;

  const sounds = characterData.sounds;
  const soundKeys = Object.keys(sounds);
  if (soundKeys.length === 0) return;

  // Create AudioListener if not exists
  if (!camera.userData.audioListener) {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    camera.userData.audioListener = listener;
  }

  soundKeys.forEach(key => {
    const soundConfig = sounds[key];
    if (!soundConfig?.path) return;

    // Check visibility
    if (soundConfig.visibleIn && !soundConfig.visibleIn.includes('immersive')) {
      console.log('Sound', key, 'not visible in immersive mode, skipping');
      return;
    }

    const soundPath = CONFIG.assetBasePath + soundConfig.path;
    console.log('Loading character sound:', key, soundPath);

    const audio = document.createElement('audio');
    audio.src = soundPath;
    audio.loop = soundConfig.loop !== false;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';
    document.body.appendChild(audio);

    audio.addEventListener('canplaythrough', () => {
      console.log('Audio ready:', key);

      const positionalAudio = new THREE.PositionalAudio(camera.userData.audioListener);
      positionalAudio.setMediaElementSource(audio);
      positionalAudio.setRefDistance(soundConfig.refDistance || 1);
      positionalAudio.setMaxDistance(soundConfig.maxDistance || 10);
      positionalAudio.setDistanceModel('inverse');
      positionalAudio.setRolloffFactor(soundConfig.rolloff || 1);

      // Apply directional cone if configured
      if (soundConfig.coneAngle) {
        const inner = soundConfig.coneAngle;
        const outer = Math.min(360, inner * 1.5);
        positionalAudio.setDirectionalCone(inner, outer, 0.2);
      }

      // Position relative to character
      if (soundConfig.position) {
        positionalAudio.position.set(
          soundConfig.position.x || 0,
          soundConfig.position.y || 0,
          soundConfig.position.z || 0
        );
      }

      // Rotation (degrees to radians)
      if (soundConfig.rotation) {
        positionalAudio.rotation.set(
          THREE.MathUtils.degToRad(soundConfig.rotation.x || 0),
          THREE.MathUtils.degToRad(soundConfig.rotation.y || 0),
          THREE.MathUtils.degToRad(soundConfig.rotation.z || 0)
        );
      }

      positionalAudio.setVolume(soundConfig.volume !== undefined ? soundConfig.volume : 0.8);
      contentGroup.add(positionalAudio);

      // Store first sound as characterSound for legacy references
      if (!characterSound) {
        characterSound = positionalAudio;
        audioElement = audio;
      }

      // Store all sounds for cleanup
      if (!characterGroup.userData.allSounds) {
        characterGroup.userData.allSounds = [];
      }
      characterGroup.userData.allSounds.push({ audio, positionalAudio, key });

      // Try to play
      audio.play().then(() => {
        console.log('Spatial audio playing:', key);
      }).catch(e => {
        console.warn('Audio autoplay blocked:', key, e.message);
        const retryAudio = () => {
          audio.play().catch(() => {});
          document.removeEventListener('touchstart', retryAudio);
          document.removeEventListener('click', retryAudio);
        };
        document.addEventListener('touchstart', retryAudio, { once: true });
        document.addEventListener('click', retryAudio, { once: true });
      });
    }, { once: true });

    audio.addEventListener('error', (e) => {
      console.error('Audio load error:', key, e.target?.error?.message || e);
    });

    audio.load();
  });
}

function tryPlayAudio() {
  // Play all sounds
  const allSounds = characterGroup?.userData?.allSounds || [];
  if (allSounds.length > 0) {
    allSounds.forEach(s => s.audio.play().catch(() => {}));
  } else if (audioElement) {
    audioElement.play().catch(() => {});
  }
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
  // Stop all character sounds
  const allSounds = characterGroup?.userData?.allSounds || [];
  allSounds.forEach(s => {
    s.audio.pause();
    s.audio.currentTime = 0;
    if (s.positionalAudio?.isPlaying) s.positionalAudio.stop();
  });
  // Fallback for legacy single sound
  if (allSounds.length === 0 && audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    if (characterSound?.isPlaying) characterSound.stop();
  }
  videoTextures.forEach(vt => {
    if (vt.video) vt.video.pause();
  });
}

function toggleMute() {
  try {
    isMuted = !isMuted;
    console.log('toggleMute called, isMuted:', isMuted);
    
    // Mute/unmute all audio elements
    const allSounds = characterGroup?.userData?.allSounds || [];
    allSounds.forEach(s => {
      s.audio.muted = isMuted;
    });
    if (allSounds.length === 0 && audioElement) {
      audioElement.muted = isMuted;
    }
    
    // Mute/unmute via AudioListener gain node
    if (camera && camera.userData && camera.userData.audioListener) {
      const listener = camera.userData.audioListener;
      if (listener.gain) {
        listener.gain.gain.value = isMuted ? 0 : 1;
        console.log('AudioListener gain set to:', listener.gain.gain.value);
      }
    }
    
    // Mute/unmute video textures
    videoTextures.forEach(vt => {
      if (vt.video) vt.video.muted = isMuted;
    });
    
    // Update UI
    const muteBtn = document.getElementById('ar-mute-btn');
    const soundOnIcon = document.getElementById('ar-sound-on-icon');
    const soundOffIcon = document.getElementById('ar-sound-off-icon');
    
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
  } catch (err) {
    console.error('Error in toggleMute:', err);
  }
}

// ============================================
// Updates
// ============================================
function updateBillboards() {
  if (!characterGroup || !camera) return;

  characterLayers.forEach(layer => {
    // Skip billboard for curved meshes or explicitly disabled
    if (layer.userData.hasCurvature) return;
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
