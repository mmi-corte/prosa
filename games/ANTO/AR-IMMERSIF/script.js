/**
 * Immersive AR - Consolidated Script
 * Camera + Gyroscope AR with step detection and crouching
 */

// Debug helper
function debugLog(msg) {
  console.log(msg);
  var debugEl = document.getElementById('debug-info');
  if (debugEl) debugEl.textContent = msg;
}

// Global state
var scene, camera, renderer;
var gltfLoader, textureLoader, raycaster, mouse;

// Puzzle state
var keyObject = null;
var hasKey = false;

// User configuration
var groundOffset = -1.7;

// AR mode state
var isARActive = false;
var videoElement = null;
var deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
var initialOrientation = null;

// Position tracking (step detection)
var userPosition = { x: 0, y: 0, z: 0 };
var targetPosition = { x: 0, y: 0, z: 0 };
var positionSmoothing = 0.08;
var lastMotionTime = 0;
var isMoving = false;
var orientationSmoothing = 0.15;
var lastQuaternion = null;

// Step detection parameters
var stepLength = 0.65;
var stepThreshold = 12;
var stepCooldown = 300;
var lastStepTime = 0;
var accelHistory = [];
var accelHistorySize = 5;
var lastPeak = 0;
var inStep = false;

// Height tracking for crouching
var standingHeight = 1.7;
var currentHeight = 1.7;
var minCrouchHeight = 0.5;
var isCrouching = false;

debugLog('Script chargé, en attente du DOM...');

/**
 * Initialize the AR experience
 */
function init() {
  debugLog('Initialisation...');
  
  if (typeof THREE === 'undefined') {
    debugLog('ERREUR: THREE.js non chargé');
    alert('Erreur : Échec du chargement de Three.js.');
    return;
  }
  
  debugLog('THREE v' + THREE.REVISION + ' loaded');
  
  if (typeof THREE.GLTFLoader === 'undefined') {
    debugLog('ERREUR: GLTFLoader non chargé');
    alert('Erreur : Échec du chargement de GLTFLoader.');
    return;
  }
  
  gltfLoader = new THREE.GLTFLoader();
  textureLoader = new THREE.TextureLoader();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  // Create scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  
  // Add audio listener
  var listener = new THREE.AudioListener();
  camera.add(listener);
  camera.userData.audioListener = listener;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
  document.getElementById('container').appendChild(renderer.domElement);

  // Setup lighting
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 5, 2);
  scene.add(directionalLight);

  // Setup UI
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onScreenClick);
  window.addEventListener('touchstart', onScreenTouch);

  debugLog('Initialisation terminée !');
  
  // Wait for user tap on start screen to begin AR
  var loadingScreen = document.getElementById('loading-screen');
  
  function startOnTap(e) {
    e.preventDefault();
    loadingScreen.removeEventListener('touchstart', startOnTap);
    loadingScreen.removeEventListener('click', startOnTap);
    
    // Hide start screen
    if (loadingScreen) loadingScreen.style.display = 'none';
    
    updateStatus('Démarrage...');
    startAR();
  }
  
  loadingScreen.addEventListener('touchstart', startOnTap, { once: true });
  loadingScreen.addEventListener('click', startOnTap, { once: true });
}

/**
 * Request device orientation permission (iOS)
 */
function requestDeviceOrientationPermission() {
  return new Promise(function(resolve) {
    var promises = [];
    
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      promises.push(
        DeviceOrientationEvent.requestPermission()
          .then(function(state) { return state === 'granted'; })
          .catch(function() { return false; })
      );
    } else {
      promises.push(Promise.resolve(true));
    }
    
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      promises.push(
        DeviceMotionEvent.requestPermission()
          .then(function(state) { return state === 'granted'; })
          .catch(function() { return false; })
      );
    } else {
      promises.push(Promise.resolve(true));
    }
    
    Promise.all(promises).then(function(results) {
      resolve(results.every(function(r) { return r; }));
    });
  });
}

/**
 * Start AR session
 */
function startAR() {
  requestDeviceOrientationPermission().then(function() {
    startCameraAR();
  });
}

/**
 * Start AR mode using camera + gyroscope
 */
function startCameraAR() {
  debugLog('Démarrage de la caméra AR...');
  isARActive = true;
  
  userPosition = { x: 0, y: 0, z: 0 };
  targetPosition = { x: 0, y: 0, z: 0 };
  lastMotionTime = 0;
  initialOrientation = null;
  
  // Create video element for camera
  videoElement = document.createElement('video');
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('autoplay', '');
  videoElement.setAttribute('muted', '');
  videoElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;';
  document.body.insertBefore(videoElement, document.body.firstChild);
  
  // Request camera access
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
  }).then(function(stream) {
    videoElement.srcObject = stream;
    videoElement.play();
    debugLog('Caméra démarrée');
    
    setupDeviceOrientation();
    renderer.setClearColor(0x000000, 0);
    setupPuzzleScene();
    updateStatus('Trouvez la clé ! Suivez le son.');
    fallbackAnimate();
    
  }).catch(function(err) {
    console.error('Camera error:', err);
    alert('Erreur caméra: ' + err.message);
    isARActive = false;
  });
}

/**
 * Setup device orientation tracking
 */
function setupDeviceOrientation() {
  // Orientation tracking
  window.addEventListener('deviceorientation', function(event) {
    if (event.alpha !== null) {
      if (initialOrientation === null) {
        initialOrientation = { alpha: event.alpha, beta: event.beta, gamma: event.gamma };
      }
      deviceOrientation.alpha = event.alpha;
      deviceOrientation.beta = event.beta;
      deviceOrientation.gamma = event.gamma;
    }
  }, true);
  
  // Motion tracking for steps
  window.addEventListener('devicemotion', function(event) {
    if (!event.accelerationIncludingGravity) return;
    
    var now = Date.now();
    var dt = lastMotionTime > 0 ? (now - lastMotionTime) / 1000 : 0;
    lastMotionTime = now;
    
    if (dt <= 0 || dt > 0.5) return;
    
    var accel = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    var ax = accel.x || 0, ay = accel.y || 0, az = accel.z || 0;
    var magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    
    accelHistory.push(magnitude);
    if (accelHistory.length > accelHistorySize) accelHistory.shift();
    
    var smoothedMag = accelHistory.reduce(function(a, b) { return a + b; }, 0) / accelHistory.length;
    var timeSinceLastStep = now - lastStepTime;
    
    if (!inStep && smoothedMag > stepThreshold && timeSinceLastStep > stepCooldown) {
      inStep = true;
      lastPeak = smoothedMag;
    } else if (inStep && smoothedMag < lastPeak - 2) {
      inStep = false;
      lastStepTime = now;
      isMoving = true;
      
      var forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      
      targetPosition.x += forward.x * stepLength;
      targetPosition.z += forward.z * stepLength;
      
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
  
  // Crouch detection
  window.addEventListener('deviceorientation', function(event) {
    if (!isARActive) return;
    
    var beta = event.beta || 0;
    var gamma = event.gamma || 0;
    var screenOrientation = window.orientation || 0;
    var lookDownAngle;
    
    if (screenOrientation === 0) {
      lookDownAngle = 90 - beta;
      if (beta < 0) lookDownAngle = 90 + Math.abs(beta);
    } else if (screenOrientation === 90) {
      lookDownAngle = -gamma;
      if (Math.abs(beta) < 30) lookDownAngle = 90 - Math.abs(gamma);
    } else if (screenOrientation === -90 || screenOrientation === 270) {
      lookDownAngle = gamma;
      if (Math.abs(beta) < 30) lookDownAngle = 90 - Math.abs(gamma);
    } else {
      lookDownAngle = 90 - beta;
    }
    
    var isLandscape = Math.abs(screenOrientation) === 90 || screenOrientation === 270;
    var crouchStartAngle = isLandscape ? 35 : 20;
    var maxCrouchAngle = 80;
    
    if (lookDownAngle > crouchStartAngle) {
      var crouchAmount = Math.min(1, Math.max(0, (lookDownAngle - crouchStartAngle) / (maxCrouchAngle - crouchStartAngle)));
      var targetHeight = standingHeight - (standingHeight - minCrouchHeight) * crouchAmount;
      currentHeight += (targetHeight - currentHeight) * 0.1;
    } else {
      currentHeight += (standingHeight - currentHeight) * 0.05;
    }
    
    currentHeight = Math.max(minCrouchHeight, Math.min(standingHeight, currentHeight));
    isCrouching = currentHeight < standingHeight - 0.3;
  }, true);
}

/**
 * Animation loop
 */
function fallbackAnimate() {
  if (!isARActive) return;
  requestAnimationFrame(fallbackAnimate);
  
  if (deviceOrientation.alpha !== null) {
    var alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha);
    var beta = THREE.MathUtils.degToRad(deviceOrientation.beta);
    var gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma);
    var orient = THREE.MathUtils.degToRad(window.orientation || 0);
    
    var quaternion = new THREE.Quaternion();
    var euler = new THREE.Euler();
    euler.set(beta, alpha, -gamma, 'YXZ');
    quaternion.setFromEuler(euler);
    
    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    quaternion.multiply(q1);
    var q2 = new THREE.Quaternion(0, 0, Math.sin(-orient / 2), Math.cos(-orient / 2));
    quaternion.multiply(q2);
    
    if (lastQuaternion === null) {
      lastQuaternion = quaternion.clone();
    } else {
      lastQuaternion.slerp(quaternion, orientationSmoothing);
      quaternion.copy(lastQuaternion);
    }
    
    camera.quaternion.copy(quaternion);
  }
  
  userPosition.x += (targetPosition.x - userPosition.x) * positionSmoothing;
  userPosition.z += (targetPosition.z - userPosition.z) * positionSmoothing;
  
  camera.position.set(userPosition.x, currentHeight, userPosition.z);
  
  var posInfo = 'Pos: ' + userPosition.x.toFixed(2) + ', ' + userPosition.z.toFixed(2) + ' H:' + currentHeight.toFixed(2);
  if (isMoving) posInfo += ' [MARCHE]';
  if (isCrouching) posInfo += ' [ACCROUPI]';
  updateStatus(posInfo);
  
  if (keyObject && !hasKey) {
    keyObject.rotation.z += 0.01;
    keyObject.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.05;
  }
  
  renderer.render(scene, camera);
}

/**
 * Setup puzzle scene
 */
function setupPuzzleScene() {
  camera.position.y = 1.7;
  
  // Background
  var bgGeometry = new THREE.CylinderGeometry(8, 8, 6, 32, 1, true);
  var bgTexture = textureLoader.load('./assets/img/ciel.png');
  bgTexture.wrapS = THREE.RepeatWrapping;
  bgTexture.repeat.x = 4;
  var background = new THREE.Mesh(bgGeometry, new THREE.MeshBasicMaterial({ map: bgTexture, side: THREE.BackSide }));
  background.position.set(0, 3, 0);
  scene.add(background);
  
  // Ground
  var groundTexture = textureLoader.load('./assets/img/ground.jpg');
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(4, 4);
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ map: groundTexture })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  
  // Rocks
  var rockPositions = [
    { x: 1.5, z: -2.0 }, { x: -1.8, z: -1.5 }, { x: 2.2, z: 0.5 },
    { x: -0.8, z: 2.0 }, { x: 0.5, z: -2.5 }, { x: -2.5, z: 0.8 }, { x: 1.2, z: 1.8 }
  ];
  
  rockPositions.forEach(function(pos) {
    gltfLoader.load('./assets/3D/stone.glb', function(gltf) {
      var rock = gltf.scene.clone();
      rock.scale.setScalar(0.3 + Math.random() * 0.2);
      rock.position.set(pos.x, 0, pos.z);
      rock.rotation.y = Math.random() * Math.PI * 2;
      scene.add(rock);
    });
  });
  
  // Trees
  var treePositions = [
    { x: -2.0, z: -2.5 }, { x: 2.8, z: -1.2 }, { x: -1.2, z: 2.5 },
    { x: 1.8, z: 2.2 }, { x: -3.0, z: 0.0 }
  ];
  
  treePositions.forEach(function(pos) {
    gltfLoader.load('./assets/3D/conifer_tree.glb', function(gltf) {
      var tree = gltf.scene.clone();
      tree.scale.setScalar(1.5 + Math.random() * 0.6);
      tree.position.set(pos.x, 0, pos.z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);
    });
  });
  
  // Key
  gltfLoader.load('./assets/3D/key.glb', function(gltf) {
    keyObject = gltf.scene;
    keyObject.scale.setScalar(0.1);
    keyObject.position.set(3, 0.5, 1.1);
    keyObject.traverse(function(child) {
      if (child.isMesh) {
        child.rotation.x = Math.PI / 2;
        child.userData.isKey = true;
      }
    });
    scene.add(keyObject);
    
    // Spatial audio
    var keySound = new THREE.PositionalAudio(camera.userData.audioListener);
    new THREE.AudioLoader().load('./assets/sound/SON1.mp3', function(buffer) {
      keySound.setBuffer(buffer);
      keySound.setRefDistance(0.5);
      keySound.setRolloffFactor(2);
      keySound.setVolume(0.05);
      keySound.setLoop(true);
      keySound.play();
    });
    keyObject.add(keySound);
    keyObject.userData.sound = keySound;
  });
}

/**
 * Exit AR session
 */
function exitAR() {
  isARActive = false;
  
  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(function(track) { track.stop(); });
    videoElement.srcObject = null;
  }
  if (videoElement && videoElement.parentNode) {
    videoElement.parentNode.removeChild(videoElement);
  }
  videoElement = null;
  initialOrientation = null;
  
  updateStatus('Session AR terminée');
}

/**
 * Collect the key
 */
function collectKey() {
  hasKey = true;
  if (keyObject.userData.sound) keyObject.userData.sound.stop();
  scene.remove(keyObject);
  keyObject = null;
  updateStatus('🔑 Clé récupérée ! Bravo !', 'success');
  
  // Trigger next step
  onKeyCollected();
}

/**
 * Placeholder - Called after key is collected
 * TODO: Implement next puzzle step or scene transition
 */
function onKeyCollected() {
  console.log('Clé récupérée - prochaine étape à implémenter');
  
  // Add your logic here:
  // - Load next scene
  // - Show dialog
  // - Trigger animation
  // - etc.
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateStatus(message, type) {
  var statusText = document.getElementById('status-text');
  var statusBar = document.getElementById('status-bar');
  if (statusText) statusText.textContent = message;
  if (statusBar) statusBar.className = 'status-bar ' + (type || '');
}

function onScreenClick(event) {
  if (!keyObject || hasKey) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  if (raycaster.intersectObject(keyObject, true).length > 0) collectKey();
}

function onScreenTouch(event) {
  if (!keyObject || hasKey || !event.touches[0]) return;
  var touch = event.touches[0];
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  if (raycaster.intersectObject(keyObject, true).length > 0) {
    collectKey();
    event.preventDefault();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
