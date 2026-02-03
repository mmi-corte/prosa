/**
 * Immersive AR Character Demo - A Fata
 * ES5 Compatible for WebXR Viewer on iOS
 * Loads character from JSON config for reusability
 */

// Debug helper
function debugLog(msg) {
  console.log(msg);
  var debugEl = document.getElementById('debug-info');
  if (debugEl) {
    debugEl.textContent = msg;
  }
}

// Use global THREE object (loaded via script tags)

// Configuration
var CONFIG = {
  // Character to load from JSON (can be changed for different characters)
  characterId: 'fata',
  // Path to character data JSON
  characterDataPath: '../data/characters.json',
  // Base path for assets (relative to this file)
  assetBasePath: '../'
};

// Global state
var scene, camera, renderer;
var reticle;
var placedObjects = [];
var gltfLoader;
var textureLoader;

// Character demo state
var characterData = null; // Loaded from JSON
var characterLayers = []; // Array of layer meshes
var characterGroup = null; // Group containing all layers
var characterSound = null; // Spatialized audio
var characterLoaded = false;
var raycaster;
var mouse;
var videoTextures = []; // Array of video textures that need updating

// Subtitle state
var currentLanguage = 'fr'; // 'fr' or 'co' (Corsican)
var currentSubtitleKey = 'greeting';
var isSubtitleVisible = false;
var subtitleElement = null;
var subtitleTextElement = null;

// User configuration
var userHeight = 170;
var playstyle = 'standing';
var groundOffset = -1.5;

// AR mode state
var isARActive = false;
var videoElement = null;
var deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };

// VR mode state
var isVRActive = false;
var isVRSupported = false;
var vrSession = null;
var controller1, controller2;
var controllerGrip1, controllerGrip2;
var initialOrientation = null;

// WebXR AR mode state (native AR on supported devices)
var isWebXRARSupported = false;
var webXRARSession = null;
var hitTestSource = null;
var hitTestSourceRequested = false;
var xrRefSpace = null;

// Position tracking (step detection)
var userPosition = { x: 0, y: 0, z: 0 };
var targetPosition = { x: 0, y: 0, z: 0 }; // Target position for smooth interpolation
var positionSmoothing = 0.1; // Fast but smooth (0-1)
var lastMotionTime = 0;
var isMoving = false;
var orientationSmoothing = 0.15; // Lower = smoother orientation (0-1)
var lastQuaternion = null;

// Step detection parameters
var stepLength = 0.8; // Smaller steps
var stepThreshold = 1.0; // Middle ground sensitivity
var stepCooldown = 350; // Moderate step rate
var lastStepTime = 0;
var accelHistory = [];
var accelHistorySize = 4; // More smoothing
var lastPeak = 0;
var inStep = false;
var isMoving = false;
var rotationRate = { alpha: 0, beta: 0, gamma: 0 }; // Track rotation speed
var rotationThreshold = 30; // Block steps during rotation OR tilting

// Height tracking for crouching
var standingHeight = 1.7; // Standing eye height in meters
var currentHeight = 1.7; // Current eye height
var minCrouchHeight = 0.5; // Minimum crouch height (about kneeling)
var heightVelocity = 0;
var verticalAccelHistory = [];
var verticalHistorySize = 8;
var isCrouching = false;

// Audio state
var audioContextResumed = false;
var pendingKeySound = null;

debugLog('Script loaded, waiting for DOM...');

/**
 * Resume AudioContext - must be called from user interaction
 */
function resumeAudioContext() {
  if (audioContextResumed) return;
  
  if (camera && camera.userData.audioListener) {
    var audioContext = camera.userData.audioListener.context;
    
    // For iOS, we need to resume and also play a silent buffer
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(function() {
        console.log('AudioContext resumed successfully, state:', audioContext.state);
        audioContextResumed = true;
        
        // Play pending sound if any
        if (pendingKeySound && !pendingKeySound.isPlaying) {
          console.log('Playing pending key sound');
          pendingKeySound.play();
        }
      }).catch(function(err) {
        console.warn('Failed to resume AudioContext:', err);
      });
    } else {
      audioContextResumed = true;
      console.log('AudioContext already running, state:', audioContext.state);
    }
    
    // iOS workaround: create and play a silent buffer to unlock audio
    try {
      var silentBuffer = audioContext.createBuffer(1, 1, 22050);
      var source = audioContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      console.log('Silent buffer played to unlock iOS audio');
    } catch (e) {
      console.warn('Silent buffer workaround failed:', e);
    }
  }
}

/**
 * Initialize the AR experience
 */
function init() {
  debugLog('Init starting...');
  
  // Check if THREE is loaded
  if (typeof THREE === 'undefined') {
    debugLog('ERROR: THREE.js not loaded');
    alert('Erreur : La bibliothèque Three.js n\'a pas pu être chargée.');
    return;
  }
  
  debugLog('THREE v' + THREE.REVISION + ' loaded');
  
  // Initialize loaders
  if (typeof THREE.GLTFLoader === 'undefined') {
    debugLog('ERROR: GLTFLoader not loaded');
    alert('Erreur : GLTFLoader n\'a pas pu être chargé.');
    return;
  }
  
  debugLog('Creating loaders...');
  gltfLoader = new THREE.GLTFLoader();
  textureLoader = new THREE.TextureLoader();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  debugLog('Creating scene...');
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  
  // Add audio listener
  var listener = new THREE.AudioListener();
  camera.add(listener);
  camera.userData.audioListener = listener;

  debugLog('Creating renderer...');
  // Create renderer with XR-compatible settings
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  // Don't set CSS width/height - let the canvas use its native resolution
  // Setting width:100% / height:100% causes blurriness by CSS-scaling the canvas
  document.getElementById('container').appendChild(renderer.domElement);

  debugLog('Setting up lighting...');
  // Setup lighting
  setupLighting();

  // Create reticle
  createReticle();

  debugLog('Setting up UI...');
  // Setup UI
  setupUI();
  
  // Setup subtitle test
  setupSubtitleTest();

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Handle clicks and touches for key pickup
  window.addEventListener('click', onScreenClick);
  window.addEventListener('touchstart', onScreenTouch);
  
  // Handle page visibility change (tab hidden, browser minimized)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      console.log('Page hidden - stopping audio');
      stopAllAudio();
    }
  });
  
  // Handle page unload (browser closed, navigation away)
  window.addEventListener('beforeunload', function() {
    console.log('Page unloading - stopping audio');
    stopAllAudio();
  });
  
  // Handle page hide (iOS Safari background)
  window.addEventListener('pagehide', function() {
    console.log('Page hide - stopping audio');
    stopAllAudio();
  });

  // Hide loading screen, show start screen
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
  
  var startScreen = document.getElementById('start-screen');
  if (startScreen) {
    startScreen.style.display = 'block';
  }

  debugLog('Init complete!');
  updateStatus('Prêt à démarrer');
  
  // WebXR modes temporarily disabled
  // checkVRSupport();
  // checkWebXRARSupport();
  
  // Wait for start button click (Gyro AR mode - fallback)
  var startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function(e) {
      e.preventDefault();
      startScreen.style.display = 'none';
      updateStatus('Démarrage...');
      startAR();
    });
  }
  
  // Wait for WebXR AR button click (native AR)
  var startWebXRARBtn = document.getElementById('start-webxr-ar-btn');
  if (startWebXRARBtn) {
    startWebXRARBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (!isWebXRARSupported) {
        alert('Le mode AR natif n\'est pas supporté sur cet appareil.');
        return;
      }
      
      startScreen.style.display = 'none';
      updateStatus('Démarrage AR natif...');
      
      console.log('Starting WebXR AR mode...');
      renderer.xr.enabled = true;
      
      // Request session DIRECTLY in click handler (user activation required)
      navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: [],
        optionalFeatures: ['hit-test', 'dom-overlay', 'local-floor', 'camera-access'],
        domOverlay: { root: document.getElementById('status-bar') }
      }).then(function(session) {
        resumeAudioContext();
        onWebXRARSessionStarted(session);
      }).catch(function(err) {
        console.warn('Full AR session failed, trying minimal:', err);
        navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: [],
          optionalFeatures: ['local-floor']
        }).then(function(session) {
          resumeAudioContext();
          onWebXRARSessionStarted(session);
        }).catch(function(fallbackErr) {
          console.error('Failed to start WebXR AR:', fallbackErr);
          alert('Erreur AR: ' + fallbackErr.message);
          startScreen.style.display = 'block';
        });
      });
    });
  }
  
  // Wait for VR button click
  var startVRBtn = document.getElementById('start-vr-btn');
  if (startVRBtn) {
    startVRBtn.addEventListener('click', function(e) {
      e.preventDefault();
      startScreen.style.display = 'none';
      updateStatus('Démarrage VR...');
      startVR();
    });
  }
}

/**
 * Setup scene lighting
 */
function setupLighting() {
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 5, 2);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  var fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-2, 1, -2);
  scene.add(fillLight);
}

/**
 * Create placement reticle
 */
function createReticle() {
  var geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
  var material = new THREE.MeshBasicMaterial({ color: 0x667eea });
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
  var startBtn = document.getElementById('start-ar-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startAR);
  }

  // Asset selection buttons
  var assetBtns = document.querySelectorAll('.asset-btn');
  for (var i = 0; i < assetBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        var allBtns = document.querySelectorAll('.asset-btn');
        for (var j = 0; j < allBtns.length; j++) {
          allBtns[j].classList.remove('selected');
        }
        btn.classList.add('selected');
        selectedModel = btn.getAttribute('data-model');
        updateStatus('Sélectionné : ' + btn.textContent.trim());
      });
    })(assetBtns[i]);
  }

  // Toggle menu
  var toggleBtn = document.getElementById('toggle-menu');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      document.getElementById('asset-menu').classList.toggle('collapsed');
    });
  }

  // Clear all objects
  var clearBtn = document.getElementById('clear-all-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      clearAllObjects();
    });
  }
  
  // Placement mode toggle
  var placementCheckbox = document.getElementById('placement-mode');
  if (placementCheckbox) {
    placementCheckbox.addEventListener('change', function(e) {
      placementModeEnabled = e.target.checked;
      if (placementModeEnabled) {
        updateStatus('Mode placement activé');
      } else {
        updateStatus('Mode placement désactivé');
      }
    });
  }

  // Select first asset by default
  var firstBtn = document.querySelector('.asset-btn');
  if (firstBtn) {
    firstBtn.classList.add('selected');
  }
}

/**
 * Clear all placed objects
 */
function clearAllObjects() {
  for (var i = 0; i < placedObjects.length; i++) {
    scene.remove(placedObjects[i]);
  }
  placedObjects = [];
  updateStatus('Tout effacé', 'success');
  setTimeout(function() { updateStatus('Appuyez pour placer des objets'); }, 2000);
}

/**
 * Request device orientation and motion permission (required for iOS)
 */
function requestDeviceOrientationPermission() {
  return new Promise(function(resolve) {
    var promises = [];
    
    // Request orientation permission
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      promises.push(
        DeviceOrientationEvent.requestPermission()
          .then(function(state) {
            console.log('DeviceOrientation permission:', state);
            return state === 'granted';
          })
          .catch(function(err) {
            console.error('DeviceOrientation permission error:', err);
            return false;
          })
      );
    } else {
      promises.push(Promise.resolve(true));
    }
    
    // Request motion permission (for accelerometer)
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      promises.push(
        DeviceMotionEvent.requestPermission()
          .then(function(state) {
            console.log('DeviceMotion permission:', state);
            return state === 'granted';
          })
          .catch(function(err) {
            console.error('DeviceMotion permission error:', err);
            return false;
          })
      );
    } else {
      promises.push(Promise.resolve(true));
    }
    
    Promise.all(promises).then(function(results) {
      var allGranted = results.every(function(r) { return r; });
      resolve(allGranted);
    });
  });
}

/**
 * Start AR session
 */
function startAR() {
  console.log('Starting AR...');
  debugLog('Starting AR...');
  
  // Resume AudioContext (required for iOS after user interaction)
  // Must be done synchronously in the click/touch handler
  resumeAudioContext();
  
  // Request device orientation permission first (for iOS)
  requestDeviceOrientationPermission().then(function(granted) {
    if (!granted) {
      console.warn('Device orientation permission not granted, AR may have limited functionality');
    }
    
    // Start camera + gyroscope AR
    startCameraAR();
  });
}

/**
 * Start AR mode using camera + gyroscope
 */
function startCameraAR() {
  console.log('Starting camera + gyroscope AR...');
  debugLog('Starting camera + gyroscope AR...');
  isARActive = true;
  
  // Reset position tracking
  userPosition = { x: 0, y: 0, z: 0 };
  targetPosition = { x: 0, y: 0, z: 0 };
  lastMotionTime = 0;
  initialOrientation = null;
  
  // Hide instructions if it exists
  var instructions = document.getElementById('instructions');
  if (instructions) {
    instructions.classList.add('hidden');
  }
  
  // Fixed camera height at 1.7m (170cm)
  var fixedEyeHeight = 1.7;
  groundOffset = -fixedEyeHeight;
  
  // Create video element for camera
  videoElement = document.createElement('video');
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('autoplay', '');
  videoElement.setAttribute('muted', ''); // Muted to allow autoplay
  videoElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;';
  document.body.insertBefore(videoElement, document.body.firstChild);
  
  // Request camera access
  navigator.mediaDevices.getUserMedia({
    video: { 
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  }).then(function(stream) {
    videoElement.srcObject = stream;
    videoElement.play();
    debugLog('Camera started');
    
    // Setup device orientation
    setupDeviceOrientation();
    
    // Make renderer transparent
    renderer.setClearColor(0x000000, 0);
    
    // Setup the puzzle scene with key and spatialized audio
    setupPuzzleScene();
    
    // Start fallback render loop
    updateStatus('Trouvez la clé ! Écoutez le son.');
    fallbackAnimate();
    
  }).catch(function(err) {
    console.error('Camera access error:', err);
    debugLog('Camera error: ' + err.message);
    alert('Impossible d\'accéder à la caméra.\nErreur : ' + err.message);
    document.getElementById('instructions').classList.remove('hidden');
    isARActive = false;
  });
}

/**
 * Setup device orientation tracking
 */
function setupDeviceOrientation() {
  // Orientation tracking (rotation)
  window.addEventListener('deviceorientation', function(event) {
    if (event.alpha !== null) {
      // Store initial orientation on first reading
      if (initialOrientation === null) {
        initialOrientation = {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        };
      }
      
      deviceOrientation.alpha = event.alpha;
      deviceOrientation.beta = event.beta;
      deviceOrientation.gamma = event.gamma;
    }
  }, true);
  
  // Motion tracking (position/movement)
  window.addEventListener('devicemotion', function(event) {
    if (!isARActive) return;
    
    var now = Date.now();
    var dt = lastMotionTime > 0 ? (now - lastMotionTime) / 1000 : 0;
    lastMotionTime = now;
    
    if (dt <= 0 || dt > 0.5) return; // Skip invalid time deltas
    
    // Track rotation rate to filter out turning AND tilting
    if (event.rotationRate) {
      rotationRate.alpha = Math.abs(event.rotationRate.alpha || 0); // Yaw (turning left/right)
      rotationRate.beta = Math.abs(event.rotationRate.beta || 0);   // Pitch (looking up/down)
      rotationRate.gamma = Math.abs(event.rotationRate.gamma || 0); // Roll
    }
    
    // Check if phone is rotating (turning OR tilting) - ignore steps during rotation
    var maxRotation = Math.max(rotationRate.alpha, rotationRate.beta, rotationRate.gamma);
    if (maxRotation > rotationThreshold) {
      // Phone is moving rotationally, don't count as step
      return;
    }
    
    // Get acceleration - use linear acceleration (without gravity) for better accuracy
    var accel = event.acceleration || { x: 0, y: 0, z: 0 };
    var hasLinearAccel = !!event.acceleration && (accel.x !== null);
    
    if (!hasLinearAccel) {
      // Fallback: use accelerationIncludingGravity but subtract gravity
      accel = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    }
    
    // Focus on horizontal acceleration (X and Z in device space)
    // This ignores vertical bounce which can be caused by tilting
    var ax = accel.x || 0;
    var az = accel.z || 0;
    var horizontalMag = Math.sqrt(ax * ax + az * az);
    
    // If using accelerationIncludingGravity, the horizontal component should be small when stationary
    // Walking creates horizontal oscillation
    
    // Add to history for smoothing
    accelHistory.push(horizontalMag);
    if (accelHistory.length > accelHistorySize) {
      accelHistory.shift();
    }
    
    // Calculate smoothed magnitude
    var smoothedMag = 0;
    for (var i = 0; i < accelHistory.length; i++) {
      smoothedMag += accelHistory[i];
    }
    smoothedMag /= accelHistory.length;
    
    // Continuous movement: any motion above threshold moves the player
    var timeSinceLastStep = now - lastStepTime;
    
    if (smoothedMag > stepThreshold && timeSinceLastStep > stepCooldown) {
      // Movement detected!
      lastStepTime = now;
      isMoving = true;
      
      // Move forward in the direction the camera is facing
      var forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0; // Keep movement horizontal
      forward.normalize();
      
      // Fixed step size for consistent movement
      var moveAmount = stepLength;
      
      // Update target position (camera will smoothly interpolate)
      targetPosition.x += forward.x * moveAmount;
      targetPosition.z += forward.z * moveAmount;
      
      // Clamp position to reasonable bounds (10 meter radius)
      var maxDist = 10;
      var dist = Math.sqrt(targetPosition.x * targetPosition.x + targetPosition.z * targetPosition.z);
      if (dist > maxDist) {
        targetPosition.x *= maxDist / dist;
        targetPosition.z *= maxDist / dist;
      }
    } else if (timeSinceLastStep > 500) {
      isMoving = false;
    }
    
  }, true);
  
  // Crouch detection using phone tilt angle
  // When the phone points towards the ground, crouch
  // Works in both portrait and landscape orientation
  window.addEventListener('deviceorientation', function(event) {
    if (!isARActive) return;
    
    var beta = event.beta || 0; // -180 to 180, phone tilt front/back
    var gamma = event.gamma || 0; // -90 to 90, phone tilt left/right
    var screenOrientation = window.orientation || 0;
    
    // Calculate the "looking down" angle based on screen orientation
    // Positive = looking DOWN at ground, Negative = looking UP at sky
    var lookDownAngle;
    
    if (screenOrientation === 0) {
      // Portrait: beta 90 = looking straight, beta < 90 = looking down at ground
      lookDownAngle = 90 - beta;
      // Handle looking straight down (beta goes negative when past vertical)
      if (beta < 0) lookDownAngle = 90 + Math.abs(beta);
    } else if (screenOrientation === 90) {
      // Landscape left (home button on right)
      // gamma ranges from -90 to 90, use beta to detect looking past vertical
      lookDownAngle = -gamma;
      // When beta is close to 0 or negative, we're looking past vertical
      if (Math.abs(beta) < 30) lookDownAngle = 90 - Math.abs(gamma);
    } else if (screenOrientation === -90 || screenOrientation === 270) {
      // Landscape right (home button on left)
      lookDownAngle = gamma;
      if (Math.abs(beta) < 30) lookDownAngle = 90 - Math.abs(gamma);
    } else if (screenOrientation === 180) {
      // Portrait upside down
      lookDownAngle = beta - 90;
    } else {
      lookDownAngle = 90 - beta;
    }
    
    // lookDownAngle: 0 = looking at horizon, positive = looking down, negative = looking up
    // Map looking down angle to crouch height
    // Different thresholds for portrait vs landscape
    var isLandscape = Math.abs(screenOrientation) === 90 || screenOrientation === 270;
    var crouchStartAngle = isLandscape ? 35 : 20; // Less sensitive in landscape
    var maxCrouchAngle = 80; // Full crouch when looking down 80+ degrees
    
    if (lookDownAngle > crouchStartAngle) {
      // Calculate crouch amount (0 to 1)
      var crouchAmount = (lookDownAngle - crouchStartAngle) / (maxCrouchAngle - crouchStartAngle);
      crouchAmount = Math.min(1, Math.max(0, crouchAmount)); // Clamp 0-1
      
      // Interpolate height from standing to crouch
      var targetHeight = standingHeight - (standingHeight - minCrouchHeight) * crouchAmount;
      
      // Smooth transition to target height
      currentHeight += (targetHeight - currentHeight) * 0.1;
    } else {
      // Not looking down enough - return to standing
      currentHeight += (standingHeight - currentHeight) * 0.05;
    }
    
    // Clamp height between crouch and standing
    if (currentHeight > standingHeight) {
      currentHeight = standingHeight;
    } else if (currentHeight < minCrouchHeight) {
      currentHeight = minCrouchHeight;
    }
    
    isCrouching = currentHeight < standingHeight - 0.3;
    
  }, true);
}

/**
 * Update billboard sprites to always face the camera (N64 style)
 * Only applies to character layer, not environment layers
 */
function updateBillboards() {
  if (!characterLayers || characterLayers.length === 0) return;
  
  for (var i = 0; i < characterLayers.length; i++) {
    var layer = characterLayers[i];
    if (layer && layer.userData.layerName === 'character') {
      // Get world position of the layer
      var layerWorldPos = new THREE.Vector3();
      layer.getWorldPosition(layerWorldPos);
      
      // Make the layer look at the camera, but only rotate on Y axis (keep upright)
      var cameraPos = camera.position.clone();
      cameraPos.y = layerWorldPos.y; // Keep same height to only rotate horizontally
      
      layer.lookAt(cameraPos);
    }
  }
}

/**
 * Fallback mode animation loop
 */
function fallbackAnimate() {
  if (!isARActive) return;
  
  requestAnimationFrame(fallbackAnimate);
  
  // Update camera rotation based on device orientation
  if (deviceOrientation.alpha !== null && deviceOrientation.beta !== null) {
    // Convert degrees to radians
    var alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha); // Z axis (compass)
    var beta = THREE.MathUtils.degToRad(deviceOrientation.beta);   // X axis (tilt front/back)
    var gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma); // Y axis (tilt left/right)
    
    // Get screen orientation
    var screenOrientation = window.orientation || 0;
    var orient = THREE.MathUtils.degToRad(screenOrientation);
    
    // Create quaternion from device orientation
    // This properly handles the phone held in portrait mode
    var quaternion = new THREE.Quaternion();
    var euler = new THREE.Euler();
    
    // Set euler angles for device orientation
    // Beta is the front-to-back tilt (x rotation)
    // Gamma is the left-to-right tilt (y rotation)  
    // Alpha is the compass direction (z rotation)
    euler.set(beta, alpha, -gamma, 'YXZ');
    
    quaternion.setFromEuler(euler);
    
    // Apply correction for phone being held upright (screen facing user)
    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90 deg around X
    quaternion.multiply(q1);
    
    // Apply screen orientation correction
    var q2 = new THREE.Quaternion(0, 0, Math.sin(-orient / 2), Math.cos(-orient / 2));
    quaternion.multiply(q2);
    
    // Smooth the orientation to reduce jitter
    if (lastQuaternion === null) {
      lastQuaternion = quaternion.clone();
    } else {
      lastQuaternion.slerp(quaternion, orientationSmoothing);
      quaternion.copy(lastQuaternion);
    }
    
    camera.quaternion.copy(quaternion);
  }
  
  // Update camera position with smooth interpolation
  // Smoothly move toward target position
  userPosition.x += (targetPosition.x - userPosition.x) * positionSmoothing;
  userPosition.z += (targetPosition.z - userPosition.z) * positionSmoothing;
  
  camera.position.x = userPosition.x;
  camera.position.y = currentHeight;
  camera.position.z = userPosition.z;
  
  // Debug: show position and height
  var posInfo = 'Pos: ' + userPosition.x.toFixed(2) + ', ' + userPosition.z.toFixed(2) + ' H:' + currentHeight.toFixed(2);
  if (isMoving) posInfo += ' [MARCHE]';
  if (isCrouching) posInfo += ' [ACCROUPI]';
  updateStatus(posInfo);
  
  // Check proximity to character for subtitle trigger
  checkCharacterProximity();
  
  // Make layers face the camera (billboard effect like N64)
  updateBillboards();
  
  // Update video textures
  updateVideoTextures();
  
  // Render scene
  renderer.render(scene, camera);
}

/**
 * Stop fallback AR mode
 */
function stopARSession() {
  isARActive = false;
  
  // Stop camera
  if (videoElement && videoElement.srcObject) {
    var tracks = videoElement.srcObject.getTracks();
    tracks.forEach(function(track) { track.stop(); });
    videoElement.srcObject = null;
  }
  
  // Remove video element
  if (videoElement && videoElement.parentNode) {
    videoElement.parentNode.removeChild(videoElement);
  }
  videoElement = null;
  
  // Reset orientation
  initialOrientation = null;
  
  // Show instructions
  var instructions = document.getElementById('instructions');
  if (instructions) instructions.classList.remove('hidden');
  
  // Clear placed objects
  clearAllObjects();
  
  debugLog('AR stopped');
  updateStatus('Session AR terminée');
}

/**
 * Load character data from JSON
 */
function loadCharacterData(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', CONFIG.characterDataPath, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          // Find the character by ID
          var characters = data.characters || [];
          for (var i = 0; i < characters.length; i++) {
            if (characters[i].id === CONFIG.characterId) {
              characterData = characters[i];
              console.log('Loaded character data:', characterData.name);
              if (callback) callback(null, characterData);
              return;
            }
          }
          console.error('Character not found:', CONFIG.characterId);
          if (callback) callback(new Error('Character not found'));
        } catch (e) {
          console.error('Failed to parse character JSON:', e);
          if (callback) callback(e);
        }
      } else {
        console.error('Failed to load character data:', xhr.status);
        if (callback) callback(new Error('HTTP ' + xhr.status));
      }
    }
  };
  xhr.send();
}

/**
 * Setup the character scene with layered 2D images
 */
function setupCharacterScene() {
  if (!characterData) {
    console.error('No character data loaded');
    return;
  }
  
  console.log('Setting up character scene for:', characterData.name);
  
  // Set camera height (only for non-WebXR modes)
  if (!webXRARSession) {
    camera.position.y = 1.7;
  }
  
  // No ground or sky - let the real camera video show through for AR!
  // The renderer is already set to transparent (alpha: true)
  
  // Create character group
  characterGroup = new THREE.Group();
  
  // For WebXR AR, place the character at a fixed world position
  // The XR camera will move around this fixed point
  if (webXRARSession) {
    // Place character at origin, 3 meters forward in -Z direction
    // This is a fixed world position that won't move with the camera
    characterGroup.position.set(0, 0, -3);
    characterGroup.updateMatrixWorld(true);
    console.log('WebXR AR: Placed character at fixed world position (0, 0, -3)');
  } else {
    characterGroup.position.set(0, 0, -3); // Position character in front of player
  }
  
  // Add to scene at root level (important for world-space positioning)
  scene.add(characterGroup);
  characterGroup.updateMatrixWorld(true);
  
  // Load character layers from config
  var layers = characterData.layers;
  if (layers) {
    // Sort layers by order
    var layerKeys = Object.keys(layers);
    layerKeys.sort(function(a, b) {
      return (layers[a].order || 0) - (layers[b].order || 0);
    });
    
    // Load each layer
    for (var i = 0; i < layerKeys.length; i++) {
      (function(layerKey) {
        var layerConfig = layers[layerKey];
        var assetPath = CONFIG.assetBasePath + layerConfig.path;
        
        // Check if this is a video layer
        if (layerConfig.type === 'video') {
          loadVideoLayer(layerKey, layerConfig, assetPath);
        } else {
          // Standard image layer
          loadImageLayer(layerKey, layerConfig, assetPath);
        }
      })(layerKeys[i]);
    }
  }
  
  // Setup spatialized sound
  setupCharacterSound();
  
  // Setup subtitle system
  setupSubtitleSystem();
  
  characterLoaded = true;
  updateStatus('Approchez-vous de ' + characterData.name, 'success');
}

/**
 * Load a standard image layer
 */
function loadImageLayer(layerKey, layerConfig, imagePath) {
  textureLoader.load(imagePath, function(texture) {
    // Create plane with proper aspect ratio
    var aspectRatio = texture.image.width / texture.image.height;
    var height = layerConfig.scale || 2;
    var width = height * aspectRatio;
    // Apply horizontal stretch if specified
    if (layerConfig.scaleX) {
      width = width * layerConfig.scaleX;
    }
    
    var geometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    var mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false; // Prevent disappearing when camera moves
    mesh.position.set(
      layerConfig.position.x || 0,
      layerConfig.position.y || 1,
      layerConfig.position.z || 0
    );
    mesh.userData.layerName = layerKey;
    
    characterGroup.add(mesh);
    characterLayers.push(mesh);
    
    console.log('Loaded image layer:', layerKey, 'at z:', layerConfig.position.z);
  }, undefined, function(error) {
    console.error('Failed to load layer:', layerKey, error);
  });
}

/**
 * Chroma key (green screen) shader for video layers
 */
var ChromaKeyShader = {
  uniforms: {
    tDiffuse: { value: null },
    keyColor: { value: new THREE.Color(0x00ff00) },
    similarity: { value: 0.4 },
    smoothness: { value: 0.08 },
    spill: { value: 0.1 }
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D tDiffuse;',
    'uniform vec3 keyColor;',
    'uniform float similarity;',
    'uniform float smoothness;',
    'uniform float spill;',
    'varying vec2 vUv;',
    '',
    'vec2 RGBtoUV(vec3 rgb) {',
    '  return vec2(',
    '    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,',
    '    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5',
    '  );',
    '}',
    '',
    'void main() {',
    '  vec4 texColor = texture2D(tDiffuse, vUv);',
    '  ',
    '  // Calculate distance from key color',
    '  float chromaDist = distance(RGBtoUV(texColor.rgb), RGBtoUV(keyColor));',
    '  ',
    '  // Create alpha mask',
    '  float alpha = smoothstep(similarity, similarity + smoothness, chromaDist);',
    '  ',
    '  // Spill suppression - reduce green tint on edges',
    '  float convergence = abs(texColor.g - mix(texColor.r, texColor.b, 0.5));',
    '  float spillMask = smoothstep(0.0, spill, convergence);',
    '  texColor.g = mix(texColor.g, mix(texColor.r, texColor.b, 0.5), (1.0 - spillMask) * 0.5);',
    '  ',
    '  gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);',
    '}'
  ].join('\n')
};

/**
 * Load a video layer with chroma key (green screen) support
 */
function loadVideoLayer(layerKey, layerConfig, videoPath) {
  console.log('Loading video layer:', layerKey, videoPath);
  
  // Create video element
  var video = document.createElement('video');
  video.src = videoPath;
  video.crossOrigin = 'anonymous';
  video.loop = layerConfig.loop !== false; // Default to loop
  video.muted = layerConfig.muted !== false; // Default to muted (for autoplay)
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  
  // Wait for video metadata to load
  video.addEventListener('loadedmetadata', function() {
    console.log('Video metadata loaded:', layerKey, video.videoWidth, 'x', video.videoHeight);
    
    // Create video texture
    var videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    
    // Calculate aspect ratio and size
    var aspectRatio = video.videoWidth / video.videoHeight;
    var height = layerConfig.scale || 2;
    var width = height * aspectRatio;
    
    var geometry = new THREE.PlaneGeometry(width, height);
    geometry.computeBoundingSphere();
    
    // Create material - use chroma key shader if chromaKey is specified
    var material;
    if (layerConfig.chromaKey) {
      // Parse chroma key color
      var keyColor = new THREE.Color(layerConfig.chromaKey);
      
      material = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: videoTexture },
          keyColor: { value: keyColor },
          similarity: { value: layerConfig.tolerance || 0.4 },
          smoothness: { value: layerConfig.smoothness || 0.08 },
          spill: { value: layerConfig.spill || 0.1 }
        },
        vertexShader: ChromaKeyShader.vertexShader,
        fragmentShader: ChromaKeyShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true
      });
      
      console.log('Created chroma key material for:', layerKey, 'key color:', layerConfig.chromaKey);
    } else {
      // Standard video material (no chroma key)
      material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    }
    
    var mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false; // Prevent disappearing when camera moves
    // Force geometry bounding sphere to be very large to prevent any culling issues
    mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), Infinity);
    mesh.position.set(
      layerConfig.position.x || 0,
      layerConfig.position.y || 1,
      layerConfig.position.z || 0
    );
    mesh.userData.layerName = layerKey;
    mesh.userData.isVideo = true;
    mesh.userData.video = video;
    mesh.userData.videoTexture = videoTexture;
    
    characterGroup.add(mesh);
    characterLayers.push(mesh);
    
    // Store video texture for updates
    videoTextures.push({
      texture: videoTexture,
      video: video,
      mesh: mesh
    });
    
    // Start playing
    video.play().then(function() {
      console.log('Video playing:', layerKey);
    }).catch(function(err) {
      console.warn('Video autoplay failed:', layerKey, err);
      // Will need user interaction to play
    });
    
    console.log('Loaded video layer:', layerKey, 'at z:', layerConfig.position.z);
  });
  
  video.addEventListener('error', function(e) {
    console.error('Failed to load video layer:', layerKey, e);
  });
  
  // Start loading
  video.load();
}

/**
 * Update all video textures (call in animation loop)
 */
function updateVideoTextures() {
  for (var i = 0; i < videoTextures.length; i++) {
    var vt = videoTextures[i];
    if (vt.video.readyState >= vt.video.HAVE_CURRENT_DATA) {
      vt.texture.needsUpdate = true;
    }
  }
}

/**
 * Setup spatialized audio for the character
 */
function setupCharacterSound() {
  if (!characterData || !characterData.sounds || !characterData.sounds.ambient) {
    console.log('No ambient sound configured for character');
    return;
  }
  
  var soundConfig = characterData.sounds.ambient;
  var soundPath = CONFIG.assetBasePath + soundConfig.path;
  
  console.log('Setting up character sound:', soundPath);
  
  // Create positional audio
  characterSound = new THREE.PositionalAudio(camera.userData.audioListener);
  
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load(soundPath, function(buffer) {
    console.log('Character audio loaded successfully');
    characterSound.setBuffer(buffer);
    characterSound.setRefDistance(soundConfig.refDistance || 2);
    characterSound.setRolloffFactor(soundConfig.rolloffFactor || 1.5);
    characterSound.setMaxDistance(soundConfig.maxDistance || 15);
    characterSound.setVolume(soundConfig.volume || 0.8);
    characterSound.setLoop(true); // Always loop ambient sound
    
    console.log('Audio loop enabled:', characterSound.getLoop());
    
    // Store as pending sound for iOS audio unlock
    pendingKeySound = characterSound;
    
    // Try to play
    var audioContext = camera.userData.audioListener.context;
    if (audioContext.state === 'running') {
      characterSound.play();
      console.log('Character audio playing');
    } else {
      console.log('AudioContext not running, will play when resumed');
    }
  }, function(progress) {
    // Progress callback
  }, function(error) {
    console.error('Failed to load character audio:', error);
  });
  
  // Add sound to character group so it's positioned at the character
  characterGroup.add(characterSound);
}

/**
 * Setup the interactive subtitle system
 */
function setupSubtitleSystem() {
  subtitleElement = document.getElementById('subtitles');
  subtitleTextElement = document.getElementById('subtitleText');
  
  if (!subtitleElement || !subtitleTextElement) {
    console.warn('Subtitle elements not found in DOM');
    return;
  }
  
  // Make subtitle interactive (clickable to switch language)
  subtitleElement.style.pointerEvents = 'auto';
  subtitleElement.style.cursor = 'pointer';
  subtitleElement.style.touchAction = 'manipulation'; // Better touch handling
  
  // Add click handler for language toggle
  subtitleElement.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('Subtitle clicked');
    toggleSubtitleLanguage();
  });
  
  // Touch handler with better event handling
  subtitleElement.addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Subtitle touched');
    toggleSubtitleLanguage();
  }, { passive: false });
  
  console.log('Subtitle system ready');
}

/**
 * Toggle between French and Corsican subtitles
 */
function toggleSubtitleLanguage() {
  if (!characterData || !characterData.subtitles) return;
  
  // Switch language
  currentLanguage = (currentLanguage === 'fr') ? 'co' : 'fr';
  
  // Update display
  updateSubtitleText();
  
  console.log('Language switched to:', currentLanguage === 'fr' ? 'Français' : 'Corsu');
}

/**
 * Show subtitle with current language
 */
function showSubtitle(subtitleKey) {
  if (!characterData || !characterData.subtitles) return;
  if (!subtitleElement || !subtitleTextElement) return;
  
  currentSubtitleKey = subtitleKey || 'greeting';
  isSubtitleVisible = true;
  
  updateSubtitleText();
  subtitleElement.style.display = 'block';
}

/**
 * Update subtitle text based on current language
 */
function updateSubtitleText() {
  if (!characterData || !characterData.subtitles) return;
  if (!subtitleTextElement) return;
  
  var subtitleData = characterData.subtitles[currentSubtitleKey];
  if (subtitleData) {
    var text = subtitleData[currentLanguage] || subtitleData.fr;
    var langLabel = currentLanguage === 'fr' ? '🇫🇷' : '<img src="../assets/img/corsu.png" style="height:1em;vertical-align:middle;">';
    subtitleTextElement.innerHTML = langLabel + ' ' + text + '<br><small style="opacity: 0.7;">Touchez pour changer de langue</small>';
  }
}

/**
 * Hide subtitle
 */
function hideSubtitle() {
  if (subtitleElement) {
    subtitleElement.style.display = 'none';
  }
  isSubtitleVisible = false;
}

/**
 * Check proximity to character and trigger interactions
 */
function checkCharacterProximity() {
  if (!characterData || !characterGroup) return;
  
  var interaction = characterData.interaction || {};
  var subtitleDistance = interaction.subtitleTriggerDistance || 2.5;
  
  // Calculate distance from camera to character
  var characterPos = characterGroup.position;
  var cameraPos = camera.position;
  
  var dx = characterPos.x - cameraPos.x;
  var dz = characterPos.z - cameraPos.z;
  var distance = Math.sqrt(dx * dx + dz * dz);
  
  // Show/hide subtitles based on proximity
  if (distance < subtitleDistance) {
    if (!isSubtitleVisible) {
      showSubtitle('greeting');
    }
  } else {
    if (isSubtitleVisible) {
      hideSubtitle();
    }
  }
}

/**
 * Legacy function name for compatibility - calls setupCharacterScene
 */
function setupPuzzleScene() {
  // Load character data then setup scene
  loadCharacterData(function(err, data) {
    if (err) {
      console.error('Failed to load character:', err);
      updateStatus('Erreur de chargement', 'error');
      return;
    }
    setupCharacterScene();
  });
}

/**
 * Exit AR session
 */
function exitAR() {
  stopARSession();
}

/**
 * Place a 3D object
 */
function placeObject(matrix) {
  var modelPath = './assets/3D/' + selectedModel;
  var config = CONFIG.models[selectedModel];

  gltfLoader.load(
    modelPath,
    function(gltf) {
      var model = gltf.scene;
      var placementMatrix = matrix.clone();
      
      var position = new THREE.Vector3();
      var quaternion = new THREE.Quaternion();
      var matrixScale = new THREE.Vector3();
      placementMatrix.decompose(position, quaternion, matrixScale);
      
      model.position.copy(position);
      model.scale.setScalar(config.scale);
      
      model.traverse(function(child) {
        if (child.isMesh) {
          child.rotation.x = config.rotationX;
        }
      });
      
      scene.add(model);
      placedObjects.push(model);
      
      updateStatus('Placé : ' + selectedModel.replace('.glb', '') + ' (#' + placedObjects.length + ')', 'success');
      setTimeout(function() { updateStatus('Appuyez pour placer des objets'); }, 2000);
    },
    undefined,
    function(error) {
      console.error('Error loading model:', error);
      updateStatus('Échec du chargement', 'error');
    }
  );
}

/**
 * Handle window resize
 */
function onWindowResize() {
  // Don't resize while in XR session
  if (renderer.xr.isPresenting) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Update status message
 */
function updateStatus(message, type) {
  type = type || '';
  var statusBar = document.getElementById('status-bar');
  var statusText = document.getElementById('status-text');
  
  if (statusText) {
    statusText.textContent = message;
  }
  if (statusBar) {
    statusBar.className = 'status-bar ' + type;
  }
}

/**
 * Handle screen clicks (legacy key collection - now unused)
 */
function onScreenClick(event) {
  // Character demo doesn't use click-to-collect
  // This function kept for compatibility
}

/**
 * Handle touch events (legacy key collection - now unused)
 */
function onScreenTouch(event) {
  // Character demo doesn't use touch-to-collect
  // This function kept for compatibility
}

/**
 * Setup subtitle test
 */
function setupSubtitleTest() {
  var btn = document.getElementById('subtitleTestBtn');
  var subtitles = document.getElementById('subtitles');
  var subtitleText = document.getElementById('subtitleText');
  
  if (!btn || !subtitles || !subtitleText) return;
  
  var testSubtitles = [
    "Welcome to the Immersive AR World!",
    "Follow the sound to find the hidden key.",
    "Subtitles enhance accessibility.",
    "Clear text with high contrast.",
    "Explore and discover secrets!"
  ];
  
  var isPlaying = false;
  var currentIndex = 0;
  var intervalId = null;
  
  btn.addEventListener('click', function() {
    if (isPlaying) {
      isPlaying = false;
      clearInterval(intervalId);
      subtitles.style.display = 'none';
      btn.textContent = '💬 Test Subtitles';
    } else {
      isPlaying = true;
      currentIndex = 0;
      btn.textContent = '⏹️ Stop Subtitles';
      
      subtitleText.textContent = testSubtitles[currentIndex];
      subtitles.style.display = 'block';
      
      intervalId = setInterval(function() {
        currentIndex++;
        if (currentIndex >= testSubtitles.length) {
          currentIndex = 0;
        }
        subtitleText.textContent = testSubtitles[currentIndex];
      }, 3000);
    }
  });
}

/**
 * Check if WebXR VR is supported
 */
function checkVRSupport() {
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
      isVRSupported = supported;
      if (supported) {
        console.log('WebXR VR is supported!');
        var vrBtn = document.getElementById('start-vr-btn');
        var vrNote = document.getElementById('vr-note');
        if (vrBtn) vrBtn.style.display = 'block';
        if (vrNote) vrNote.style.display = 'block';
      }
    }).catch(function(err) {
      console.log('WebXR VR check failed:', err);
    });
  }
}

/**
 * Check if WebXR AR is supported (native AR - Android ARCore, etc.)
 * Note: iOS Safari does NOT support WebXR AR, only XRViewer app does
 */
function checkWebXRARSupport() {
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-ar').then(function(supported) {
      isWebXRARSupported = supported;
      if (supported) {
        console.log('WebXR AR is supported! (Native AR available)');
        var arBtn = document.getElementById('start-webxr-ar-btn');
        var arNote = document.getElementById('webxr-ar-note');
        if (arBtn) arBtn.style.display = 'block';
        if (arNote) arNote.style.display = 'block';
        
        // Update fallback button label
        var fallbackBtn = document.getElementById('start-btn');
        if (fallbackBtn) {
          fallbackBtn.innerHTML = '📱 Mode Gyroscope (Fallback)';
        }
      }
    }).catch(function(err) {
      console.log('WebXR AR check failed:', err);
    });
  }
}

/**
 * Start WebXR AR session (native AR with real tracking)
 */
function startWebXRAR() {
  if (!isWebXRARSupported) {
    alert('Le mode AR natif n\'est pas supporté sur cet appareil.\nUtilisez le mode Gyroscope à la place.');
    return;
  }
  
  console.log('Starting WebXR AR mode...');
  debugLog('Starting WebXR AR mode...');
  
  // Enable XR on renderer BEFORE requesting session
  renderer.xr.enabled = true;
  
  // Request AR session FIRST (must happen synchronously in user gesture)
  // Audio resume happens after session is established
  navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: [],
    optionalFeatures: ['hit-test', 'dom-overlay', 'local-floor', 'camera-access'],
    domOverlay: { root: document.getElementById('status-bar') }
  }).then(function(session) {
    // Resume audio AFTER session is established
    resumeAudioContext();
    onWebXRARSessionStarted(session);
  }).catch(function(err) {
    console.warn('Full AR session failed, trying minimal:', err);
    // Fallback to minimal session
    navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: [],
      optionalFeatures: ['local-floor', 'camera-access']
    }).then(function(session) {
      resumeAudioContext();
      onWebXRARSessionStarted(session);
    }).catch(function(fallbackErr) {
      console.error('Failed to start WebXR AR session:', fallbackErr);
      alert('Impossible de démarrer la session AR.\nErreur: ' + fallbackErr.message + '\n\nEssayez le mode Gyroscope.');
    });
  });
}

/**
 * WebXR AR session started
 */
function onWebXRARSessionStarted(session) {
  console.log('WebXR AR session started');
  webXRARSession = session;
  isARActive = true;
  
  // Handle session end
  session.addEventListener('end', onWebXRARSessionEnded);
  session.addEventListener('select', onWebXRARSelect);
  
  // Get native scale factor for higher resolution
  var nativeScaleFactor = 1.0;
  try {
    nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
    console.log('Native framebuffer scale factor:', nativeScaleFactor);
  } catch (e) {
    console.warn('Could not get native scale factor:', e);
  }
  
  // Use Three.js's framebuffer scale factor for higher resolution
  // This is the proper way to set resolution with Three.js XR
  var scaleFactor = Math.min(nativeScaleFactor * 1.5, 2.0);
  renderer.xr.setFramebufferScaleFactor(scaleFactor);
  console.log('Set framebuffer scale factor:', scaleFactor);
  
  // Enable XR and let Three.js handle the WebGL layer setup
  renderer.xr.enabled = true;
  renderer.xr.setSession(session).then(function() {
    console.log('XR session set up complete');
    
    // Log actual framebuffer size
    var baseLayer = session.renderState.baseLayer;
    if (baseLayer) {
      console.log('Framebuffer size:', baseLayer.framebufferWidth, 'x', baseLayer.framebufferHeight);
    }
    
    // Request LOCAL reference space - this keeps objects fixed in world space
    // 'local' means objects stay in place as user moves around
    session.requestReferenceSpace('local').then(function(localRefSpace) {
      console.log('Got LOCAL reference space - objects will stay fixed in world');
      
      // Store the reference space for Three.js to use
      renderer.xr.setReferenceSpace(localRefSpace);
      
      // Try hit test with viewer space (needed for hit testing)
      session.requestReferenceSpace('viewer').then(function(viewerSpace) {
        if (session.requestHitTestSource) {
          session.requestHitTestSource({ space: viewerSpace }).then(function(source) {
            hitTestSource = source;
            console.log('Hit test source ready');
          }).catch(function(err) {
            console.warn('Hit test not available:', err);
          });
        }
      }).catch(function(e) {
        console.warn('Viewer space for hit test failed:', e);
      });
      
    }).catch(function(err) {
      console.warn('Local reference space failed, trying local-floor:', err);
      // Fallback to local-floor
      session.requestReferenceSpace('local-floor').then(function(floorRefSpace) {
        console.log('Got local-floor reference space');
        renderer.xr.setReferenceSpace(floorRefSpace);
      }).catch(function(e) {
        console.warn('All reference spaces failed:', e);
      });
    });
    
    // Start the XR render loop
    session.requestAnimationFrame(onWebXRARFrame);
    
    // Load character data then setup scene
    setTimeout(function() {
      loadCharacterData(function(err, data) {
        if (err) {
          console.error('Failed to load character:', err);
          return;
        }
        setupCharacterScene();
        console.log('Character scene setup complete for WebXR AR');
      });
    }, 500);
    
  }).catch(function(err) {
    console.error('Failed to set XR session:', err);
  });
}

/**
 * Hide all UI elements for immersive AR
 */
function hideAllUI() {
  var elementsToHide = [
    'status-bar',
    'asset-menu',
    'subtitles',
    'subtitleTestBtn',
    'exit-ar-btn',
    'start-screen',
    'loading-screen',
    'debug-info'
  ];
  
  for (var i = 0; i < elementsToHide.length; i++) {
    var el = document.getElementById(elementsToHide[i]);
    if (el) {
      el.style.display = 'none';
    }
  }
  
  // Also hide by class
  var menus = document.querySelectorAll('.menu, .status-bar');
  for (var j = 0; j < menus.length; j++) {
    menus[j].style.display = 'none';
  }
}

/**
 * Show UI elements again
 */
function showAllUI() {
  var statusBar = document.getElementById('status-bar');
  if (statusBar) statusBar.style.display = '';
  
  var startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'block';
}

/**
 * Stop all audio and video
 */
function stopAllAudio() {
  if (characterSound && characterSound.isPlaying) {
    characterSound.stop();
    console.log('Character audio stopped');
  }
  
  // Stop all video layers
  for (var i = 0; i < videoTextures.length; i++) {
    var vt = videoTextures[i];
    if (vt.video) {
      vt.video.pause();
      console.log('Video layer paused');
    }
  }
  
  // Also suspend the audio context to ensure silence
  if (camera && camera.userData.audioListener) {
    var audioContext = camera.userData.audioListener.context;
    if (audioContext && audioContext.state === 'running') {
      audioContext.suspend();
      console.log('AudioContext suspended');
    }
  }
}

/**
 * WebXR AR session ended
 */
function onWebXRARSessionEnded() {
  console.log('WebXR AR session ended');
  isARActive = false;
  webXRARSession = null;
  hitTestSource = null;
  hitTestSourceRequested = false;
  
  // Stop audio when session ends
  stopAllAudio();
  
  // Show UI again
  showAllUI();
  
  renderer.xr.setSession(null);
  renderer.setAnimationLoop(null);
  
  // Show start screen again
  var startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'block';
}

/**
 * WebXR AR render loop - using XR session's requestAnimationFrame
 */
function onWebXRARFrame(time, frame) {
  var session = frame.session;
  
  // Request next frame FIRST
  session.requestAnimationFrame(onWebXRARFrame);
  
  // Handle hit test if available
  if (hitTestSource) {
    var referenceSpace = renderer.xr.getReferenceSpace();
    if (referenceSpace) {
      var hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        var hit = hitTestResults[0];
        var pose = hit.getPose(referenceSpace);
        if (pose && reticle) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        }
      } else if (reticle) {
        reticle.visible = false;
      }
    }
  }
  
  // Make layers face the camera (billboard effect like N64)
  updateBillboards();
  
  // Check proximity for subtitles
  checkCharacterProximity();
  
  // Update video textures
  updateVideoTextures();
  
  // Render inside XR frame callback
  renderer.render(scene, camera);
}

/**
 * Handle select event in WebXR AR
 */
function onWebXRARSelect(event) {
  // Character demo - select event unused
  // Could be used for interaction in future
}

/**
 * Start VR mode
 */
function startVR() {
  if (!isVRSupported) {
    alert('Le mode VR n\'est pas supporté sur cet appareil.');
    return;
  }
  
  console.log('Starting VR mode...');
  debugLog('Starting VR mode...');
  
  // Enable XR on renderer
  renderer.xr.enabled = true;
  
  // Request VR session
  navigator.xr.requestSession('immersive-vr', {
    optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
  }).then(onVRSessionStarted).catch(function(err) {
    console.error('Failed to start VR session:', err);
    alert('Impossible de démarrer la session VR.\nErreur: ' + err.message);
  });
}

/**
 * VR session started
 */
function onVRSessionStarted(session) {
  console.log('VR session started');
  vrSession = session;
  isVRActive = true;
  
  // Set up session
  renderer.xr.setSession(session);
  
  // Set up controllers
  setupVRControllers();
  
  // Set up VR scene (same puzzle as AR but with different environment)
  setupVRScene();
  
  // Handle session end
  session.addEventListener('end', onVRSessionEnded);
  
  // Start VR render loop
  renderer.setAnimationLoop(vrAnimate);
  
  updateStatus('Mode VR actif - Utilisez les manettes pour interagir');
}

/**
 * VR session ended
 */
function onVRSessionEnded() {
  console.log('VR session ended');
  isVRActive = false;
  vrSession = null;
  
  renderer.xr.setSession(null);
  renderer.setAnimationLoop(null);
  
  // Show start screen again
  var startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'block';
  
  updateStatus('Session VR terminée');
}

/**
 * Set up VR controllers
 */
function setupVRControllers() {
  // Controller 1
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onVRSelectStart);
  controller1.addEventListener('selectend', onVRSelectEnd);
  scene.add(controller1);
  
  // Controller 2
  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onVRSelectStart);
  controller2.addEventListener('selectend', onVRSelectEnd);
  scene.add(controller2);
  
  // Controller grips (for visual representation)
  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  
  // Add simple visual for controllers
  var controllerGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16);
  var controllerMaterial = new THREE.MeshStandardMaterial({ color: 0xece4cb });
  
  var controllerMesh1 = new THREE.Mesh(controllerGeometry, controllerMaterial);
  controllerMesh1.rotation.x = Math.PI / 2;
  controllerGrip1.add(controllerMesh1);
  
  var controllerMesh2 = new THREE.Mesh(controllerGeometry, controllerMaterial);
  controllerMesh2.rotation.x = Math.PI / 2;
  controllerGrip2.add(controllerMesh2);
  
  scene.add(controllerGrip1);
  scene.add(controllerGrip2);
  
  // Add ray pointer
  var rayGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -3)
  ]);
  var rayMaterial = new THREE.LineBasicMaterial({ color: 0x81cbd6 });
  
  var ray1 = new THREE.Line(rayGeometry, rayMaterial);
  controller1.add(ray1);
  
  var ray2 = new THREE.Line(rayGeometry, rayMaterial);
  controller2.add(ray2);
}

/**
 * VR select (trigger) pressed
 */
function onVRSelectStart(event) {
  var controller = event.target;
  
  // Raycast from controller
  var tempMatrix = new THREE.Matrix4();
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  
  var vrRaycaster = new THREE.Raycaster();
  vrRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  vrRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  
  // Check for key intersection
  if (keyObject && !hasKey) {
    var intersects = vrRaycaster.intersectObject(keyObject, true);
    if (intersects.length > 0) {
      collectKey();
    }
  }
}

/**
 * VR select (trigger) released
 */
function onVRSelectEnd(event) {
  // Not used currently
}

/**
 * Set up VR scene environment
 */
function setupVRScene() {
  // Clear any AR-specific elements
  if (videoElement) {
    videoElement.pause();
    if (videoElement.parentNode) {
      videoElement.parentNode.removeChild(videoElement);
    }
    videoElement = null;
  }
  
  // Set scene background for VR (dark forest atmosphere)
  scene.background = new THREE.Color(0x1a1812);
  
  // Add fog for atmosphere
  scene.fog = new THREE.Fog(0x1a1812, 2, 15);
  
  // Set up the puzzle scene if not already done
  if (!puzzleSetup) {
    setupPuzzleScene();
  }
  
  // Reset camera position
  camera.position.set(0, 1.6, 0);
  
  updateStatus('Trouvez la clé ! Écoutez le son et pointez avec la manette.');
}

/**
 * VR animation loop
 */
function vrAnimate() {
  if (!isVRActive) return;
  
  // Animate the key (bob and rotate)
  if (keyObject && !hasKey) {
    keyObject.rotation.z += 0.01;
    keyObject.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.05;
  }
  
  // Render
  renderer.render(scene, camera);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
