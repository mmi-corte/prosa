/**
 * Immersive AR World - Markerless AR with Tap-to-Place
 * ES5 Compatible for WebXR Viewer on iOS
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
  models: {
    'character.glb': { scale: 0.2, rotationX: Math.PI / 2 },
    'conifer_tree.glb': { scale: 0.3, rotationX: 0 },
    'stone.glb': { scale: 0.15, rotationX: 0 },
    'key.glb': { scale: 0.05, rotationX: 0 }
  }
};

// Global state
var scene, camera, renderer;
var reticle;
var selectedModel = 'character.glb';
var placedObjects = [];
var gltfLoader;
var textureLoader;

// Puzzle state
var puzzleSetup = false;
var keyObject = null;
var hasKey = false;
var raycaster;
var mouse;

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
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  
  // Add audio listener
  var listener = new THREE.AudioListener();
  camera.add(listener);
  camera.userData.audioListener = listener;

  debugLog('Creating renderer...');
  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.zIndex = '1';
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
  
  // Check for WebXR VR and AR support
  checkVRSupport();
  checkWebXRARSupport();
  
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
      startScreen.style.display = 'none';
      updateStatus('Démarrage AR natif...');
      startWebXRAR();
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
  
  // Animate the key (bob and rotate)
  if (keyObject && !hasKey) {
    keyObject.rotation.z += 0.01;
    keyObject.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.05;
  }
  
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
 * Setup the puzzle scene
 */
function setupPuzzleScene() {
  // Position scene at origin - camera will be at eye level looking into scene
  // Fixed camera height at 1.7m (170cm)
  
  // Set camera height
  camera.position.y = 1.7;
  
  // Create cylindrical background centered around origin
  var bgGeometry = new THREE.CylinderGeometry(8, 8, 6, 32, 1, true);
  var bgTexture = textureLoader.load('./assets/img/ciel.png');
  bgTexture.wrapS = THREE.RepeatWrapping;
  bgTexture.repeat.x = 4;
  var bgMaterial = new THREE.MeshBasicMaterial({ 
    map: bgTexture, 
    side: THREE.BackSide 
  });
  var background = new THREE.Mesh(bgGeometry, bgMaterial);
  background.position.set(0, 3, 0); // Center it vertically
  scene.add(background);
  
  // Create ground at Y=0
  var groundGeometry = new THREE.PlaneGeometry(20, 20);
  var groundTexture = textureLoader.load('./assets/img/ground.jpg');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(4, 4);
  var groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
  var ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 0);
  scene.add(ground);
  
  // Place rocks at ground level (Y=0)
  var rockPositions = [
    { x: 1.5, z: -2.0 },
    { x: -1.8, z: -1.5 },
    { x: 2.2, z: 0.5 },
    { x: -0.8, z: 2.0 },
    { x: 0.5, z: -2.5 },
    { x: -2.5, z: 0.8 },
    { x: 1.2, z: 1.8 }
  ];
  
  for (var i = 0; i < rockPositions.length; i++) {
    (function(pos) {
      gltfLoader.load('./assets/3D/stone.glb', function(gltf) {
        var rock = gltf.scene.clone();
        var scale = 0.3 + Math.random() * 0.2;
        rock.scale.setScalar(scale);
        rock.position.set(pos.x, 0, pos.z);
        rock.rotation.y = Math.random() * Math.PI * 2;
        scene.add(rock);
      });
    })(rockPositions[i]);
  }
  
  // Place trees at ground level (Y=0)
  var treePositions = [
    { x: -2.0, z: -2.5 },
    { x: 2.8, z: -1.2 },
    { x: -1.2, z: 2.5 },
    { x: 1.8, z: 2.2 },
    { x: -3.0, z: 0.0 }
  ];
  
  for (var j = 0; j < treePositions.length; j++) {
    (function(pos) {
      gltfLoader.load('./assets/3D/conifer_tree.glb', function(gltf) {
        var tree = gltf.scene.clone();
        var scale = 1.5 + Math.random() * 0.6;
        tree.scale.setScalar(scale);
        tree.position.set(pos.x, 0, pos.z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        scene.add(tree);
      });
    })(treePositions[j]);
  }
  
  // Place key floating above a rock
  var keyRockPos = { x: 2.2, z: 0.5 };
  gltfLoader.load('./assets/3D/key.glb', function(gltf) {
    keyObject = gltf.scene;
    keyObject.scale.setScalar(0.1);
    keyObject.position.set(
      keyRockPos.x + 0.8, 
      0.5,  // Floating above ground
      keyRockPos.z + 0.6
    );
    keyObject.traverse(function(child) {
      if (child.isMesh) {
        child.rotation.x = Math.PI / 2;
        child.userData.isKey = true;
      }
    });
    scene.add(keyObject);
    
    // Add spatial audio
    var audioLoader = new THREE.AudioLoader();
    var keySound = new THREE.PositionalAudio(camera.userData.audioListener);
    audioLoader.load('./assets/sound/SON1.mp3', function(buffer) {
      console.log('Audio loaded successfully');
      keySound.setBuffer(buffer);
      keySound.setRefDistance(0.5);
      keySound.setRolloffFactor(2);
      keySound.setVolume(0.15);
      keySound.setLoop(true);
      
      // Store reference for pending play
      pendingKeySound = keySound;
      
      // Try to play - if AudioContext is suspended (iOS), it will be played when resumed
      var audioContext = camera.userData.audioListener.context;
      if (audioContext.state === 'running') {
        keySound.play();
        console.log('Audio playing:', keySound.isPlaying);
      } else {
        console.log('AudioContext not running yet, sound will play when resumed. State:', audioContext.state);
        // Try to resume again (user may have already tapped)
        resumeAudioContext();
      }
    }, function(progress) {
      // Progress callback
    }, function(error) {
      console.error('Error loading audio:', error);
    });
    keyObject.add(keySound);
    keyObject.userData.sound = keySound;
    
    // Floating animation - key stays at fixed height above ground
    function animateKey() {
      if (keyObject && !hasKey) {
        keyObject.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.05;
        keyObject.rotation.z += 0.01;
      }
      requestAnimationFrame(animateKey);
    }
    animateKey();
  });
  
  updateStatus('Scène chargée ! Trouvez la clé cachée', 'success');
}

/**
 * Exit AR session
 */
function exitAR() {
  stopARSession();
}

/**
 * Collect the key
 */
function collectKey() {
  hasKey = true;
  
  // Stop the audio
  if (keyObject.userData.sound) {
    keyObject.userData.sound.stop();
  }
  
  scene.remove(keyObject);
  keyObject = null;
  
  updateStatus('🔑 Clé récupérée ! Énigme résolue !', 'success');
  
  setTimeout(function() {
    updateStatus('Bravo ! Vous avez trouvé la clé cachée !');
  }, 2000);
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
 * Handle screen clicks for key collection
 */
function onScreenClick(event) {
  // Skip if no key or already collected
  if (!keyObject || hasKey) return;
  
  // Calculate mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Raycast to detect key click
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObject(keyObject, true);
  
  if (intersects.length > 0) {
    debugLog('Key clicked!');
    collectKey();
  }
}

/**
 * Handle touch events for key collection on mobile
 */
function onScreenTouch(event) {
  // Skip if no key or already collected
  if (!keyObject || hasKey) return;
  
  // Get first touch
  var touch = event.touches[0];
  if (!touch) return;
  
  // Calculate touch position
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  
  // Raycast to detect key touch
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObject(keyObject, true);
  
  if (intersects.length > 0) {
    debugLog('Key touched!');
    collectKey();
    event.preventDefault(); // Prevent click from firing too
  }
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
  
  // Resume AudioContext
  resumeAudioContext();
  
  // Enable XR on renderer
  renderer.xr.enabled = true;
  
  // Request AR session with hit-test for ground detection
  navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['local-floor'],
    optionalFeatures: ['hit-test', 'dom-overlay'],
    domOverlay: { root: document.getElementById('status-bar') }
  }).then(onWebXRARSessionStarted).catch(function(err) {
    console.error('Failed to start WebXR AR session:', err);
    alert('Impossible de démarrer la session AR.\nErreur: ' + err.message + '\n\nEssayez le mode Gyroscope.');
  });
}

/**
 * WebXR AR session started
 */
function onWebXRARSessionStarted(session) {
  console.log('WebXR AR session started');
  webXRARSession = session;
  isARActive = true;
  
  // Set up session
  renderer.xr.setSession(session);
  renderer.xr.setReferenceSpaceType('local-floor');
  
  // Make renderer transparent for AR passthrough
  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  
  // Setup the puzzle scene
  setupPuzzleScene();
  
  // Handle session end
  session.addEventListener('end', onWebXRARSessionEnded);
  
  // Start WebXR render loop
  renderer.setAnimationLoop(webXRARAnimate);
  
  updateStatus('AR Natif actif - Marchez pour explorer !');
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
  
  renderer.xr.setSession(null);
  renderer.setAnimationLoop(null);
  
  // Show start screen again
  var startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'block';
}

/**
 * WebXR AR render loop
 */
function webXRARAnimate(time, frame) {
  if (!isARActive || !webXRARSession) return;
  
  // Get XR camera pose
  if (frame) {
    var referenceSpace = renderer.xr.getReferenceSpace();
    
    if (referenceSpace) {
      var pose = frame.getViewerPose(referenceSpace);
      
      if (pose) {
        // Get camera position from pose transform
        var position = pose.transform.position;
        
        // Check for key proximity and pickup
        if (keyObject && !hasKey) {
          var keyPos = keyObject.position;
          var distance = Math.sqrt(
            Math.pow(keyPos.x - position.x, 2) +
            Math.pow(keyPos.y - position.y, 2) +
            Math.pow(keyPos.z - position.z, 2)
          );
          
          // Auto-pickup when very close
          if (distance < 0.5) {
            pickupKey();
          }
        }
      }
    }
  }
  
  // Rotate key
  if (keyObject && !hasKey) {
    keyObject.rotation.y += 0.02;
  }
  
  // Render - WebXR handles the camera automatically
  renderer.render(scene, camera);
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
