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
var initialOrientation = null;

// Position tracking (step detection)
var userPosition = { x: 0, y: 0, z: 0 };
var targetPosition = { x: 0, y: 0, z: 0 }; // Target position for smooth interpolation
var positionSmoothing = 0.08; // Lower = smoother movement (0-1)
var lastMotionTime = 0;
var isMoving = false;
var orientationSmoothing = 0.15; // Lower = smoother orientation (0-1)
var lastQuaternion = null;

// Step detection parameters
var stepLength = 0.65; // Average step length in meters
var stepThreshold = 12; // Acceleration magnitude threshold for step detection
var stepCooldown = 300; // Minimum ms between steps
var lastStepTime = 0;
var accelHistory = [];
var accelHistorySize = 5; // Number of samples to average
var lastPeak = 0;
var inStep = false;

// Height tracking for crouching
var standingHeight = 1.7; // Standing eye height in meters
var currentHeight = 1.7; // Current eye height
var minCrouchHeight = 0.5; // Minimum crouch height (about kneeling)
var heightVelocity = 0;
var verticalAccelHistory = [];
var verticalHistorySize = 8;
var isCrouching = false;

debugLog('Script loaded, waiting for DOM...');

/**
 * Initialize the AR experience
 */
function init() {
  debugLog('Init starting...');
  
  // Check if THREE is loaded
  if (typeof THREE === 'undefined') {
    debugLog('ERROR: THREE.js not loaded');
    alert('Error: Three.js library failed to load.');
    return;
  }
  
  debugLog('THREE v' + THREE.REVISION + ' loaded');
  
  // Initialize loaders
  if (typeof THREE.GLTFLoader === 'undefined') {
    debugLog('ERROR: GLTFLoader not loaded');
    alert('Error: GLTFLoader failed to load.');
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

  // Hide loading screen
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }

  debugLog('Init complete!');
  updateStatus('Tap anywhere to start AR');
  
  // Wait for user tap to start AR (required for iOS permissions)
  function startOnTap(e) {
    e.preventDefault();
    document.removeEventListener('touchstart', startOnTap);
    document.removeEventListener('click', startOnTap);
    updateStatus('Starting AR...');
    startAR();
  }
  
  document.addEventListener('touchstart', startOnTap, { once: true, passive: false });
  document.addEventListener('click', startOnTap, { once: true });
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
        updateStatus('Selected: ' + btn.textContent.trim());
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

  // Exit AR button
  var exitBtn = document.getElementById('exit-ar-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      exitAR();
    });
  }
  
  // Placement mode toggle
  var placementCheckbox = document.getElementById('placement-mode');
  if (placementCheckbox) {
    placementCheckbox.addEventListener('change', function(e) {
      placementModeEnabled = e.target.checked;
      if (placementModeEnabled) {
        updateStatus('Placement mode enabled - Tap to place objects');
      } else {
        updateStatus('Placement mode disabled - Click objects to interact');
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
  updateStatus('All objects cleared', 'success');
  setTimeout(function() { updateStatus('Tap to place more objects'); }, 2000);
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
    
    // Show exit button
    document.getElementById('exit-ar-btn').classList.remove('hidden');
    
    // Make renderer transparent
    renderer.setClearColor(0x000000, 0);
    
    // Setup the puzzle scene with key and spatialized audio
    setupPuzzleScene();
    
    // Start fallback render loop
    updateStatus('Find the key! Listen for the sound.');
    fallbackAnimate();
    
  }).catch(function(err) {
    console.error('Camera access error:', err);
    debugLog('Camera error: ' + err.message);
    alert('Could not access camera.\nError: ' + err.message);
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
    if (!event.accelerationIncludingGravity) return;
    
    var now = Date.now();
    var dt = lastMotionTime > 0 ? (now - lastMotionTime) / 1000 : 0;
    lastMotionTime = now;
    
    if (dt <= 0 || dt > 0.5) return; // Skip invalid time deltas
    
    // Get acceleration including gravity (more reliable for step detection)
    var accel = event.accelerationIncludingGravity || event.acceleration || { x: 0, y: 0, z: 0 };
    
    // Calculate acceleration magnitude
    var ax = accel.x || 0;
    var ay = accel.y || 0;
    var az = accel.z || 0;
    var magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    
    // Add to history for smoothing
    accelHistory.push(magnitude);
    if (accelHistory.length > accelHistorySize) {
      accelHistory.shift();
    }
    
    // Calculate smoothed magnitude
    var smoothedMag = 0;
    for (var i = 0; i < accelHistory.length; i++) {
      smoothedMag += accelHistory[i];
    }
    smoothedMag /= accelHistory.length;
    
    // Step detection: look for peak above threshold followed by dip
    var now = Date.now();
    var timeSinceLastStep = now - lastStepTime;
    
    if (!inStep && smoothedMag > stepThreshold && timeSinceLastStep > stepCooldown) {
      // Detected upward acceleration (foot hitting ground)
      inStep = true;
      lastPeak = smoothedMag;
    } else if (inStep && smoothedMag < lastPeak - 2) {
      // Detected downward acceleration after peak - step complete!
      inStep = false;
      lastStepTime = now;
      isMoving = true;
      
      // Move forward in the direction the camera is facing
      var forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0; // Keep movement horizontal
      forward.normalize();
      
      // Update target position (camera will smoothly interpolate toward this)
      targetPosition.x += forward.x * stepLength;
      targetPosition.z += forward.z * stepLength;
      
      // Clamp target position to reasonable bounds (5 meter radius)
      var maxDist = 5;
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
  if (isMoving) posInfo += ' [WALK]';
  if (isCrouching) posInfo += ' [CROUCH]';
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
  
  // Hide UI
  document.getElementById('exit-ar-btn').classList.add('hidden');
  document.getElementById('instructions').classList.remove('hidden');
  
  // Clear placed objects
  clearAllObjects();
  
  debugLog('AR stopped');
  updateStatus('AR session ended');
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
      keySound.setBuffer(buffer);
      keySound.setRefDistance(0.5);
      keySound.setRolloffFactor(2);
      keySound.setVolume(0.05);
      keySound.setLoop(true);
      keySound.play();
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
  
  updateStatus('Puzzle scene loaded! Find the hidden key', 'success');
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
  
  updateStatus('🔑 Key collected! Puzzle solved!', 'success');
  
  setTimeout(function() {
    updateStatus('Great job! You found the hidden key!');
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
      
      updateStatus('Placed ' + selectedModel.replace('.glb', '') + ' (#' + placedObjects.length + ')', 'success');
      setTimeout(function() { updateStatus('Tap to place more objects'); }, 2000);
    },
    undefined,
    function(error) {
      console.error('Error loading model:', error);
      updateStatus('Failed to load model', 'error');
    }
  );
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
