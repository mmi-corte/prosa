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
var hitTestSource = null;
var hitTestSourceRequested = false;
var selectedModel = 'character.glb';
var placedObjects = [];
var gltfLoader;
var textureLoader;

// Puzzle state
var puzzleSetup = false;
var keyObject = null;
var hasKey = false;
var placementModeEnabled = false;
var raycaster;
var mouse;

// User configuration
var userHeight = 170;
var playstyle = 'standing';
var groundOffset = -1.5;

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
  renderer.xr.enabled = true;
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
  
  // Handle clicks
  window.addEventListener('click', onScreenClick);

  // Hide loading screen
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }

  debugLog('Init complete!');
  updateStatus('Tap "Start AR Experience" to begin');
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
 * Start AR session
 */
function startAR() {
  console.log('Starting AR...');
  
  // Check if WebXR is available
  if (!navigator.xr) {
    updateStatus('WebXR not supported on this browser', 'error');
    alert('WebXR is not supported on this browser.\n\nAlternatives:\n- Use the marker-based AR\n- Use Chrome on Android\n- Use WebXR Viewer app on iOS');
    return;
  }
  
  // Check if immersive-ar is supported
  navigator.xr.isSessionSupported('immersive-ar').then(function(isARSupported) {
    if (!isARSupported) {
      updateStatus('Immersive AR not supported', 'error');
      alert('Immersive AR is not supported on this device/browser.');
      return;
    }
    
    // Get user configuration
    var heightInput = document.getElementById('user-height');
    var playstyleInput = document.getElementById('playstyle');
    
    userHeight = heightInput ? parseInt(heightInput.value) || 170 : 170;
    playstyle = playstyleInput ? playstyleInput.value : 'standing';
    
    // Calculate ground offset
    var eyeLevelRatio = playstyle === 'standing' ? 0.93 : 0.65;
    var eyeLevel = (userHeight / 100) * eyeLevelRatio;
    groundOffset = -eyeLevel;
    
    console.log('User config: ' + userHeight + 'cm, ' + playstyle + ', ground offset: ' + groundOffset.toFixed(2) + 'm');

    // Hide instructions
    document.getElementById('instructions').classList.add('hidden');

    // Request AR session - try with features first
    navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: [],
      optionalFeatures: ['hit-test', 'dom-overlay', 'local-floor'],
      domOverlay: { root: document.body }
    }).then(function(session) {
      onSessionStarted(session);
    }).catch(function(err) {
      console.warn('Full session failed, trying minimal:', err);
      // Fallback to minimal session
      navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: [],
        optionalFeatures: ['local-floor']
      }).then(function(session) {
        onSessionStarted(session);
      }).catch(function(fallbackErr) {
        console.error('Session creation error:', fallbackErr);
        updateStatus('AR mode not available on this device', 'error');
        document.getElementById('instructions').classList.remove('hidden');
      });
    });
    
  }).catch(function(err) {
    console.error('AR support check failed:', err);
    updateStatus('Failed to check AR support', 'error');
  });
}

/**
 * Handle AR session start
 */
function onSessionStarted(session) {
  console.log('AR Session started');
  
  renderer.xr.session = session;
  
  session.addEventListener('end', onSessionEnded);
  session.addEventListener('select', onSelect);
  
  // Show exit button
  document.getElementById('exit-ar-btn').classList.remove('hidden');

  renderer.xr.setSession(session).then(function() {
    // Try to request hit test source
    session.requestReferenceSpace('viewer').then(function(referenceSpace) {
      session.requestHitTestSource({ space: referenceSpace }).then(function(source) {
        hitTestSource = source;
        updateStatus('Hit test ready - Move device to find surfaces', 'success');
      }).catch(function(err) {
        console.warn('Hit test source not available:', err);
        updateStatus('Hit test unavailable - Manual placement mode', 'warning');
      });
    }).catch(function(err) {
      console.warn('Reference space not available:', err);
    });

    session.requestAnimationFrame(onXRFrame);
    
    // Setup puzzle scene after delay
    setTimeout(function() {
      if (!puzzleSetup) {
        setupPuzzleScene();
        puzzleSetup = true;
      }
    }, 1000);
    
    updateStatus('AR Session Started - Tap to place objects', 'success');
  }).catch(function(err) {
    console.error('Session setup error:', err);
    updateStatus('Failed to initialize AR session', 'error');
  });
}

/**
 * Setup the puzzle scene
 */
function setupPuzzleScene() {
  var cameraPos = camera.position.clone();
  
  // Create cylindrical background
  var bgGeometry = new THREE.CylinderGeometry(5, 5, 4, 32, 1, true);
  var bgTexture = textureLoader.load('./assets/img/ciel.png');
  bgTexture.wrapS = THREE.RepeatWrapping;
  bgTexture.repeat.x = 4;
  var bgMaterial = new THREE.MeshBasicMaterial({ 
    map: bgTexture, 
    side: THREE.BackSide 
  });
  var background = new THREE.Mesh(bgGeometry, bgMaterial);
  background.position.set(cameraPos.x, cameraPos.y + groundOffset + 2, cameraPos.z);
  scene.add(background);
  
  // Create ground
  var groundGeometry = new THREE.PlaneGeometry(20, 20);
  var groundTexture = textureLoader.load('./assets/img/ground.jpg');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(1, 1);
  var groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
  var ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(cameraPos.x, cameraPos.y + groundOffset, cameraPos.z);
  scene.add(ground);
  
  // Place rocks
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
        rock.position.set(
          cameraPos.x + pos.x, 
          cameraPos.y + groundOffset, 
          cameraPos.z + pos.z
        );
        rock.rotation.y = Math.random() * Math.PI * 2;
        scene.add(rock);
      });
    })(rockPositions[i]);
  }
  
  // Place trees
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
        tree.position.set(
          cameraPos.x + pos.x,
          cameraPos.y + groundOffset,
          cameraPos.z + pos.z
        );
        tree.rotation.y = Math.random() * Math.PI * 2;
        scene.add(tree);
      });
    })(treePositions[j]);
  }
  
  // Place key
  var keyRockPos = { x: 2.2, z: 0.5 };
  gltfLoader.load('./assets/3D/key.glb', function(gltf) {
    keyObject = gltf.scene;
    keyObject.scale.setScalar(0.1);
    keyObject.position.set(
      cameraPos.x + keyRockPos.x + 0.8, 
      cameraPos.y + groundOffset + 0.3, 
      cameraPos.z + keyRockPos.z + 0.6
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
    
    // Floating animation
    function animateKey() {
      if (keyObject && !hasKey) {
        keyObject.position.y = cameraPos.y + groundOffset + 0.3 + Math.sin(Date.now() * 0.003) * 0.05;
        keyObject.rotation.z += 0.01;
      }
      requestAnimationFrame(animateKey);
    }
    animateKey();
  });
  
  updateStatus('Puzzle scene loaded! Find the hidden key', 'success');
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
  var session = renderer.xr.getSession();
  if (session) {
    session.end();
    updateStatus('Exiting AR...', 'warning');
  }
}

/**
 * Handle tap/select event
 */
function onSelect(event) {
  // First, try to collect the key if it exists
  if (keyObject && !hasKey) {
    // Check distance to key - if close enough, collect it
    var keyPosition = new THREE.Vector3();
    keyObject.getWorldPosition(keyPosition);
    var distanceToKey = camera.position.distanceTo(keyPosition);
    
    // If within 2 meters, collect the key (proximity-based)
    if (distanceToKey < 2) {
      collectKey();
      return;
    }
    
    // Also try raycast with a wider cone (multiple rays)
    var collected = false;
    var offsets = [
      {x: 0, y: 0},      // center
      {x: 0.1, y: 0},    // right
      {x: -0.1, y: 0},   // left
      {x: 0, y: 0.1},    // up
      {x: 0, y: -0.1},   // down
      {x: 0.07, y: 0.07},  // diagonals
      {x: -0.07, y: 0.07},
      {x: 0.07, y: -0.07},
      {x: -0.07, y: -0.07}
    ];
    
    for (var i = 0; i < offsets.length; i++) {
      var tempRaycaster = new THREE.Raycaster();
      var direction = new THREE.Vector3(offsets[i].x, offsets[i].y, -1);
      direction.normalize();
      direction.applyQuaternion(camera.quaternion);
      tempRaycaster.set(camera.position, direction);
      
      var intersects = tempRaycaster.intersectObject(keyObject, true);
      
      if (intersects.length > 0 && intersects[0].distance < 5) {
        collectKey();
        collected = true;
        break;
      }
    }
    
    if (collected) return;
  }
  
  // If not collecting key, check placement mode
  if (!placementModeEnabled) {
    return;
  }
  
  if (reticle.visible) {
    placeObject(reticle.matrix);
  } else {
    var matrix = new THREE.Matrix4();
    matrix.makeTranslation(0, 0, -1.5);
    matrix.premultiply(camera.matrixWorld);
    placeObject(matrix);
  }
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
 * XR Frame update loop
 */
function onXRFrame(time, frame) {
  var session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  if (hitTestSource) {
    var referenceSpace = renderer.xr.getReferenceSpace();
    var hitTestResults = frame.getHitTestResults(hitTestSource);

    if (hitTestResults.length > 0) {
      var hit = hitTestResults[0];
      var pose = hit.getPose(referenceSpace);

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
  if (!keyObject || hasKey) return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  var intersects = raycaster.intersectObject(keyObject, true);
  
  if (intersects.length > 0) {
    collectKey();
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
