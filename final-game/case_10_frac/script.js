// Theme handling
function applyTheme() {
    const theme = (window.PROSA_SETTINGS && window.PROSA_SETTINGS.theme) || 'dark';
    const root = document.documentElement;
    root.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
}

applyTheme();

// Configuration
const CONFIG = {
    laneWidth: 3.5,
    speedBase: 0.8,
    speedMax: 2.5,
    speedInc: 0.0005,
    goalDistance: 250, // Distance réduite à 250m
    colors: {
        bg: 0x1a1812,
        player: 0x81cbd6,
        ground: 0x252218,
        obstacle: 0x626247,
        coin: 0xffdb2c,
        danger: 0xc63032
    }
};

// State
let state = {
    playing: false,
    speed: CONFIG.speedBase,
    distance: 0,
    coins: 0,
    lane: 1, // 0: Left, 1: Center, 2: Right
    guardDistance: 0, // 0 to 100
    shake: 0
};

// Three.js Globals
let scene, camera, renderer;
let player, ground;
let objects = []; // Obstacles & Coins
let particles = [];
let frameId;

// Inputs
let targetX = 0;
let touchStart = 0;

// --- INIT THREE.JS ---
function initThree() {
    const container = document.getElementById('game-container');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.bg);
    scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.035);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, -10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // SpotLight from Player (Flashlight effect)
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 5, 2);
    spotLight.target.position.set(0, 0, -10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Red Light from behind (The Guard)
    const dangerLight = new THREE.PointLight(CONFIG.colors.danger, 0, 20);
    dangerLight.position.set(0, 2, 5);
    scene.add(dangerLight);
    state.dangerLight = dangerLight;

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 200);
    const groundMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.ground,
        roughness: 0.8,
        metalness: 0.2
    });
    ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -50;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Helper (Artistic Touch)
    const gridHelper = new THREE.GridHelper(100, 40, CONFIG.colors.primary, 0x111111);
    gridHelper.position.y = 0.05;
    gridHelper.position.z = -50;
    scene.add(gridHelper);

    // Player (Capsule/Robot)
    const playerGeo = new THREE.BoxGeometry(0.8, 1.5, 0.8);
    const playerMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.player,
        emissive: CONFIG.colors.player,
        emissiveIntensity: 0.5
    });
    player = new THREE.Mesh(playerGeo, playerMat);
    player.position.set(0, 0.75, 0); // Fixed height, no jumping
    player.castShadow = true;
    scene.add(player);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', handleKey, false);
    document.addEventListener('touchstart', e => touchStart = e.touches[0].clientX, { passive: false });
    document.addEventListener('touchend', handleTouch, { passive: false });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- GAMEPLAY LOGIC ---

function initGame() {
    if (!scene) initThree();

    // Reset State
    state.playing = true;
    state.speed = CONFIG.speedBase;
    state.distance = 0;
    state.coins = 0;
    state.lane = 1;
    targetX = 0;
    state.guardDistance = 0;
    state.shake = 0;

    // Reset Objects
    objects.forEach(obj => scene.remove(obj.mesh));
    objects = [];

    // Player Pos
    player.position.x = 0;

    // UI
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('hint-text').classList.remove('hidden');
    setTimeout(() => document.getElementById('hint-text').classList.add('hidden'), 3000);

    animate();
}

function resetGame() {
    cancelAnimationFrame(frameId);
    initGame();
}

function nextStep() {
    window.parent.postMessage({ type: 'game_complete', game: 'frac_runner' }, '*');
}

function spawnObject() {
    const zPos = -100; // Spawn far away
    const laneIdx = Math.floor(Math.random() * 3);
    const xPos = (laneIdx - 1) * CONFIG.laneWidth;

    const type = Math.random();

    if (type < 0.2) {
        // COIN (Fragment)
        const geo = new THREE.OctahedronGeometry(0.4);
        const mat = new THREE.MeshPhongMaterial({
            color: CONFIG.colors.coin,
            emissive: CONFIG.colors.coin,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xPos, 1, zPos);
        scene.add(mesh);
        objects.push({ mesh, type: 'coin', active: true });

    } else if (type < 0.8) {
        // OBSTACLE (Crate/Pillar)
        const isTall = Math.random() > 0.5;
        const height = isTall ? 4 : 1.5;
        const geo = new THREE.BoxGeometry(2, height, 2);
        const mat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.obstacle });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xPos, height / 2, zPos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        objects.push({ mesh, type: 'obstacle', active: true });
    }
}

function createExplosion(pos, color) {
    // Simple visual pop using multiple small cubes
    for (let i = 0; i < 8; i++) {
        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.position.x += (Math.random() - 0.5);
        mesh.position.y += (Math.random() - 0.5);

        // Random velocity attached to mesh userdata
        mesh.userData.vel = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );

        scene.add(mesh);
        particles.push({ mesh, life: 1.0 });
    }
}

function update() {
    if (!state.playing) return;

    // Move Player visual (Lerp)
    player.position.x += (targetX - player.position.x) * 0.15;
    // No jumping/bouncing on place anymore
    player.position.y = 0.75;

    // Tilt effect when moving
    player.rotation.z = -(targetX - player.position.x) * 0.1;

    // Increase Speed
    if (state.speed < CONFIG.speedMax) state.speed += CONFIG.speedInc;

    // Spawn Objects
    if (Math.random() < 0.05 * state.speed) spawnObject();

    // Move Objects & Collision
    for (let i = objects.length - 1; i >= 0; i--) {
        let obj = objects[i];
        obj.mesh.position.z += state.speed;

        // Collision Detection
        if (obj.active) {
            // Check Z proximity
            if (obj.mesh.position.z > -1 && obj.mesh.position.z < 1) {
                // Check X proximity (Lane)
                // Simple distance check as we are grid aligned mostly
                if (Math.abs(obj.mesh.position.x - player.position.x) < 1.0) {

                    if (obj.type === 'coin') {
                        // Collect
                        state.coins++;
                        createExplosion(obj.mesh.position, CONFIG.colors.coin);
                        scene.remove(obj.mesh);
                        obj.active = false;

                        // Heal Guard Distance
                        state.guardDistance = Math.max(0, state.guardDistance - 5);

                    } else if (obj.type === 'obstacle') {
                        // Hit
                        state.guardDistance += 35;
                        state.shake = 20; // Camera shake intensity
                        createExplosion(player.position, CONFIG.colors.danger);

                        // Slow down momentarily
                        state.speed = CONFIG.speedBase;

                        scene.remove(obj.mesh);
                        obj.active = false; // Prevent double hit
                    }
                }
            }
        }

        // Cleanup
        if (obj.mesh.position.z > 10) {
            scene.remove(obj.mesh);
            objects.splice(i, 1);
        }

        // Rotate Coins
        if (obj.type === 'coin') {
            obj.mesh.rotation.y += 0.05;
            obj.mesh.rotation.x += 0.02;
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.mesh.position.add(p.mesh.userData.vel);
        p.life -= 0.05;
        p.mesh.scale.setScalar(p.life);
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }

    // Score & Distance
    state.distance += state.speed * 0.1;

    // Guard Mechanic
    if (state.guardDistance > 0) state.guardDistance -= 0.05; // Recover slowly
    if (state.guardDistance >= 100) gameOver();

    // WIN Check
    if (state.distance >= CONFIG.goalDistance) gameWin();

    // Visuals updates based on Guard Distance
    state.dangerLight.intensity = (state.guardDistance / 100) * 2; // Red light gets brighter
    document.getElementById('vignette').style.opacity = state.guardDistance / 100;

    // UI Updates
    const remaining = Math.max(0, Math.floor(CONFIG.goalDistance - state.distance));
    document.getElementById('score-display').innerText = remaining + "m";
    document.getElementById('coin-display').innerText = state.coins;
    document.getElementById('danger-bar').style.width = Math.min(100, state.guardDistance) + "%";

    // Camera Shake
    if (state.shake > 0) {
        camera.position.x = (Math.random() - 0.5) * (state.shake * 0.02);
        camera.position.y = 4 + (Math.random() - 0.5) * (state.shake * 0.02);
        state.shake *= 0.9; // Damping
    } else {
        camera.position.set(0, 4, 8);
    }
}

function gameOver() {
    state.playing = false;
    document.getElementById('gameover-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
}

function gameWin() {
    state.playing = false;
    document.getElementById('win-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
}

function animate() {
    frameId = requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// --- CONTROLS ---

function changeLane(dir) {
    if (!state.playing) return;
    state.lane = Math.max(0, Math.min(2, state.lane + dir));
    targetX = (state.lane - 1) * CONFIG.laneWidth;
}

function handleKey(e) {
    if (e.code === 'Space') e.preventDefault(); // Bloque le scroll si espace est pressé
    if (e.key === 'ArrowLeft' || e.key === 'q') changeLane(-1);
    if (e.key === 'ArrowRight' || e.key === 'd') changeLane(1);
}

function handleTouch(e) {
    const end = e.changedTouches[0].clientX;
    const diff = end - touchStart;
    if (Math.abs(diff) > 30) {
        if (diff > 0) changeLane(1);
        else changeLane(-1);
    }
}

// Init Scene on load (don't start game yet)
window.onload = initThree;
