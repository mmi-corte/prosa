// MOTEUR DE JEU - MODE CAUCHEMAR
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
let W, H;

// --- CONSTANTES MODIFIÉES POUR DIFFICULTÉ ---
const TILE_SIZE = 60;
const PLAYER_SPEED = 4.2; // Joueur plus rapide
const GHOST_SPEED_MOD = 1.2; // Bonus fantôme légèrement augmenté
const RUN_SPEED_MOD = 1.5;

// --- ÉTATS ---
let gameState = 'MENU';
let frames = 0;
let isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

// --- INPUTS ---
const keys = { up: false, down: false, left: false, right: false, space: false, shift: false };
let targetPos = null;  // Position vers laquelle aller
let wasDetected = false;  // Permet de savoir si on vient d'être détecté
let isPointerDown = false;  // Le doigt/souris est-il appuyé ?

// --- ENTITÉS ---
let camera = { x: 0, y: 0 };
let player = { 
    x: 0, y: 0, r: 15, 
    vx: 0, vy: 0,
    hp: 100, mana: 100, 
    ghost: false, noise: 0,
    hasTalisman: false,
    ghostOnCooldown: false  // Cooldown du fantôme
};
let map = [];
let floorTiles = [];
let guards = [];
let particles = [];
let talisman = { x: 0, y: 0, active: true };
let exitZone = { x: 0, y: 0, w: 100, h: 100 };
let spawnZone = { x: 0, y: 0, w: 0, h: 0 };

// --- LEVEL DESIGN ---
const LEVEL_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1], 
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,3,0,0,0,0,0,1,1,1,0,1,1,1,1], 
    [1,1,1,1,1,0,0,0,0,0,3,0,0,0,0,0,0,1], 
    [1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1], 
    [1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,1], 
    [1,0,0,0,0,0,1,0,1,0,3,0,0,1,0,0,0,1], 
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1]
];

// --- AUDIO ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let actx;

function initAudio() {
    if (!actx && AudioContext) {
        actx = new AudioContext();
    }
    if (actx && actx.state === 'suspended') {
        actx.resume();
    }
}

// --- FONCTIONS ---

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

window.startGame = function() {
    initAudio();
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    const objective = document.getElementById('objective-text');
    if (objective) objective.innerText = "RÉCUPÉREZ LE TALISMAN";
    let menu = document.getElementById('menu-screen');
    menu.style.opacity = 0;
    setTimeout(() => menu.style.display = 'none', 500);
    buildLevel();
    gameState = 'PLAYING';
    loop();
};

function buildLevel() {
    map = []; guards = []; floorTiles = []; particles = [];
    
    for(let y=0; y<LEVEL_MAP.length; y++) {
        for(let x=0; x<LEVEL_MAP[y].length; x++) {
            let type = LEVEL_MAP[y][x];
            let px = x * TILE_SIZE;
            let py = y * TILE_SIZE;

            if(type === 1) map.push({x: px, y: py, w: TILE_SIZE, h: TILE_SIZE, type: 'wall'});
            if(type === 3) map.push({x: px, y: py, w: TILE_SIZE, h: TILE_SIZE, type: 'gate'});
            if(type === 9) {
                talisman.x = px + TILE_SIZE/2; 
                talisman.y = py + TILE_SIZE/2;
            }
            if(type !== 1 && Math.random() > 0.7) {
                floorTiles.push({x: px + Math.random()*TILE_SIZE, y: py + Math.random()*TILE_SIZE, s: Math.random()*4+2});
            }
        }
    }

    player.x = 2 * TILE_SIZE; 
    player.y = 2 * TILE_SIZE;
    player.hp = 100;
    player.mana = 100;
    player.hasTalisman = false;
    player.ghostOnCooldown = false;
    
    spawnZone.x = 0;
    spawnZone.y = 0;
    spawnZone.w = 5 * TILE_SIZE;
    spawnZone.h = 4 * TILE_SIZE;
    
    exitZone.x = 1 * TILE_SIZE;
    exitZone.y = 1 * TILE_SIZE;

    createGuard(8 * TILE_SIZE, 5 * TILE_SIZE, false);
    createGuard(14 * TILE_SIZE, 5 * TILE_SIZE, false);
    createGuard(4 * TILE_SIZE, 3 * TILE_SIZE, false);
    createGuard(8 * TILE_SIZE, 8 * TILE_SIZE, false);
    
    let boss = createGuard(13 * TILE_SIZE, 8 * TILE_SIZE, true);
    boss.patrolRadius = 200;
}

function createGuard(x, y, isBoss) {
    let g = {
        x: x, y: y, angle: 0,
        startX: x, startY: y,
        timer: Math.random() * 100,
        viewRadius: isBoss ? 240 : 180,
        fov: 1.0,
        speed: isBoss ? 2.0 : 1.6,
        isBoss: isBoss
    };
    guards.push(g);
    return g;
}

function loop() {
    if(gameState !== 'PLAYING') return;
    requestAnimationFrame(loop);
    frames++;
    try { update(); render(); } catch (e) {}
}

function update() {
    let dx = 0, dy = 0;
    
    // Système de pointage : le joueur se dirige vers le point touché/cliqué
    if(targetPos) {
        let distToTarget = Math.hypot(targetPos.x - player.x, targetPos.y - player.y);
        if(distToTarget > 10) {
            dx = (targetPos.x - player.x) / distToTarget;
            dy = (targetPos.y - player.y) / distToTarget;
        } else {
            targetPos = null;  // Arrive à destination
        }
    }

    if(dx > 1) dx = 1; if(dx < -1) dx = -1;
    if(dy > 1) dy = 1; if(dy < -1) dy = -1;

    // Mode fantôme AUTO activé si :
    // 1) Détecté par un garde
    // 2) Une gate/passage est devant le joueur
    let needsGhost = wasDetected;
    
    // Vérifier s'il y a une gate devant le joueur
    for(let w of map) {
        if(w.type === 'gate') {
            let distToGate = Math.hypot(player.x - (w.x + w.w/2), player.y - (w.y + w.h/2));
            if(distToGate < 100) {
                needsGhost = true;
                break;
            }
        }
    }
    
    let ghostActive = needsGhost;
    const btn = document.getElementById('ghost-btn');
    if (isMobile && btn && btn.classList.contains('is-active')) ghostActive = true;

    if(ghostActive && player.mana > 0 && !player.ghostOnCooldown) {
        player.ghost = true;
        player.mana -= 1.0;
        if(frames%5===0) spawnParticle(player.x, player.y, '#81cbd6');
        
        // Si mana atteint 0, activer le cooldown
        if(player.mana <= 0) {
            player.ghostOnCooldown = true;
            player.mana = 0;
        }
    } else {
        player.ghost = false;
        if(player.mana < 100) player.mana += 0.25;
        
        // Réduire le cooldown : une fois à 50%, on peut réutiliser
        if(player.ghostOnCooldown && player.mana >= 50) {
            player.ghostOnCooldown = false;
        }
    }

    let speed = PLAYER_SPEED;
    if(keys.shift) speed *= RUN_SPEED_MOD;
    if(player.ghost) speed *= GHOST_SPEED_MOD;

    if(dx !== 0 || dy !== 0) {
        let len = Math.hypot(dx, dy);
        if(len > 1) { dx /= len; dy /= len; }

        player.vx = dx * speed;
        player.vy = dy * speed;
        
        player.noise = (keys.shift && !player.ghost) ? 60 : 0;
        if(player.noise > 0 && frames % 15 === 0) {
            spawnPulse(player.x, player.y);
        }
    } else {
        player.vx = 0; player.vy = 0;
        player.noise = 0;
    }

    let nextX = player.x + player.vx;
    let nextY = player.y + player.vy;
    
    if(!checkWallCollision(nextX, player.y)) player.x = nextX;
    if(!checkWallCollision(player.x, nextY)) player.y = nextY;

    camera.x += (player.x - W/2 - camera.x) * 0.1;
    camera.y += (player.y - H/2 - camera.y) * 0.1;

    if(talisman.active && Math.hypot(player.x - talisman.x, player.y - talisman.y) < 30) {
        talisman.active = false;
        player.hasTalisman = true;
        document.getElementById('objective-text').innerText = "FUYEZ ! (ALARME)";
        guards.forEach(g => { g.speed *= 1.2; g.viewRadius = 320; });
    }

    if(player.hasTalisman && Math.hypot(player.x - exitZone.x, player.y - exitZone.y) < 60) {
        endGame(true);
    }

    let dangerLevel = 0;
    guards.forEach(g => {
        g.timer++;
        let targetX = g.startX + Math.sin(g.timer * 0.02) * 100;
        let targetY = g.startY;
        
        if(g.isBoss) {
            targetX = g.startX + Math.cos(g.timer * 0.015) * 120;
            targetY = g.startY + Math.sin(g.timer * 0.015) * 50;
        }

        let dist = Math.hypot(player.x - g.x, player.y - g.y);
        if(dist < 250 && player.noise > 0) {
            g.angle = Math.atan2(player.y - g.y, player.x - g.x);
        } else {
            let dx = targetX - g.x;
            let dy = targetY - g.y;
            if(Math.hypot(dx, dy) > 2) {
                g.angle = Math.atan2(dy, dx);
                g.x += Math.cos(g.angle) * g.speed;
                g.y += Math.sin(g.angle) * g.speed;
            }
        }

        if(!player.ghost) {
            if(dist < g.viewRadius) {
                let angleToPlayer = Math.atan2(player.y - g.y, player.x - g.x);
                let diff = angleToPlayer - g.angle;
                while(diff < -Math.PI) diff += Math.PI*2;
                while(diff > Math.PI) diff -= Math.PI*2;

                if(Math.abs(diff) < g.fov / 2) {
                    if(!raycast(g.x, g.y, player.x, player.y)) {
                        let inSpawnZone = player.x > spawnZone.x && player.x < spawnZone.x + spawnZone.w &&
                                          player.y > spawnZone.y && player.y < spawnZone.y + spawnZone.h;
                        if (!inSpawnZone) {
                            wasDetected = true;  // DÉTECTÉ - activate fantôme auto
                            player.hp -= 3;
                            dangerLevel = 1;
                            if(player.hp <= 0) endGame(false);
                            spawnParticle(player.x, player.y, '#c63032');
                        }
                    }
                }
            }
        }
    });

    let overlay = document.getElementById('pulse-overlay');
    if(dangerLevel > 0) overlay.classList.add('danger');
    else overlay.classList.remove('danger');

    document.getElementById('mana-bar').style.width = player.mana + '%';
    document.getElementById('health-bar').style.width = player.hp + '%';

    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.life--;
        p.x += p.vx; p.y += p.vy;
        p.size *= 0.95;
        if(p.life <= 0) particles.splice(i,1);
    }
}

function render() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    floorTiles.forEach(t => {
        ctx.fillStyle = '#222';
        ctx.fillRect(t.x, t.y, t.s, t.s);
    });

    // Draw spawn safe zone
    ctx.fillStyle = 'rgba(129, 203, 214, 0.06)';
    ctx.fillRect(spawnZone.x, spawnZone.y, spawnZone.w, spawnZone.h);
    ctx.strokeStyle = 'rgba(129, 203, 214, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(spawnZone.x, spawnZone.y, spawnZone.w, spawnZone.h);
    ctx.setLineDash([]);

    // Draw guard danger zones
    guards.forEach(g => {
        let grad = ctx.createRadialGradient(g.x, g.y, 10, g.x, g.y, g.viewRadius);
        grad.addColorStop(0, g.isBoss ? 'rgba(255,0,100,0.2)' : 'rgba(255,80,80,0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.viewRadius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.strokeStyle = '#444'; ctx.lineWidth = 3;
    ctx.strokeRect(exitZone.x, exitZone.y, exitZone.w, exitZone.h);
    
    map.forEach(w => {
        if(w.type === 'gate') {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            ctx.beginPath();
            for(let i=10; i<w.w; i+=15) {
                ctx.moveTo(w.x+i, w.y); ctx.lineTo(w.x+i, w.y+w.h);
            }
            ctx.stroke();
        } else {
            let roofH = 15;
            ctx.fillStyle = '#222';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.fillStyle = '#333';
            ctx.fillRect(w.x, w.y - roofH, w.w, w.h);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(w.x, w.y+w.h, w.w, 10);
        }
    });

    if(talisman.active) {
        ctx.shadowBlur = 30; ctx.shadowColor = '#ffd700';
        ctx.fillStyle = '#ffd700';
        let float = Math.sin(frames*0.05)*5;
        ctx.beginPath(); ctx.arc(talisman.x, talisman.y + float, 10, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    }

    if (talisman.active) {
        drawGuidance(talisman.x, talisman.y, '#ffd700');
    } else {
        drawGuidance(exitZone.x + exitZone.w / 2, exitZone.y + exitZone.h / 2, '#81cbd6');
    }

    guards.forEach(g => {
        let grad = ctx.createRadialGradient(g.x, g.y, 10, g.x, g.y, g.viewRadius);
        grad.addColorStop(0, g.isBoss ? 'rgba(255,0,100,0.4)' : 'rgba(255,50,50,0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(g.x, g.y);
        ctx.arc(g.x, g.y, g.viewRadius, g.angle - g.fov/2, g.angle + g.fov/2);
        ctx.fill();

        ctx.fillStyle = g.isBoss ? '#ff0066' : '#cc2222';
        ctx.beginPath(); ctx.arc(g.x, g.y, 14, 0, Math.PI*2); ctx.fill();
        
        let eyeX = g.x + Math.cos(g.angle)*10;
        let eyeY = g.y + Math.sin(g.angle)*10;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(eyeX, eyeY, 4, 0, Math.PI*2); ctx.fill();
    });

    if(player.ghost) {
        ctx.shadowBlur = 20; ctx.shadowColor = '#81cbd6';
        ctx.fillStyle = '#81cbd6';
        ctx.globalAlpha = 0.6;
    } else {
        ctx.shadowBlur = 10; ctx.shadowColor = player.hasTalisman ? '#ffd700' : '#3a5c7a';
        ctx.fillStyle = player.hasTalisman ? '#ffd700' : '#3a5c7a';
        ctx.globalAlpha = 1;
    }
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    particles.forEach(p => {
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    ctx.restore();
}

function checkWallCollision(x, y) {
    let r = player.r;
    for(let w of map) {
        if(player.ghost && w.type === 'gate') continue;
        if(x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) return true;
    }
    return false;
}

function raycast(x1, y1, x2, y2) {
    let steps = 10;
    for(let i=1; i<steps; i++) {
        let t = i/steps;
        let cx = x1 + (x2-x1)*t;
        let cy = y1 + (y2-y1)*t;
        for(let w of map) {
            if(w.type === 'wall' && cx > w.x && cx < w.x+w.w && cy > w.y && cy < w.y+w.h) return true;
        }
    }
    return false;
}

function spawnParticle(x, y, c) {
    particles.push({
        x:x, y:y, c:c,
        vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2,
        life: 20, size: 3
    });
}

function spawnPulse(x, y) {
    spawnParticle(x, y, '#ffffff');
}

function drawGuidance(tx, ty, color) {
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const gx = player.x + (tx - player.x) * t;
        const gy = player.y + (ty - player.y) * t;
        const pulse = 2 + Math.sin(frames * 0.1 + i) * 1.5;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(gx, gy, pulse, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function handleKey(code, state) {
    if(code==='KeyW'||code==='ArrowUp'||code==='KeyZ') keys.up = state;
    if(code==='KeyS'||code==='ArrowDown') keys.down = state;
    if(code==='KeyA'||code==='ArrowLeft'||code==='KeyQ') keys.left = state;
    if(code==='KeyD'||code==='ArrowRight') keys.right = state;
    if(code==='Space') keys.space = state;
    if(code==='ShiftLeft') keys.shift = state;
}

function setupKeyboardControls() {
    window.addEventListener('keydown', e => handleKey(e.code, true));
    window.addEventListener('keyup', e => handleKey(e.code, false));
}

function setupTouchControls() {
    // Système simple : maintenir le doigt/souris pour se déplacer
    document.addEventListener('touchstart', e => {
        if(gameState !== 'PLAYING') return;
        e.preventDefault();
        isPointerDown = true;
        let t = e.touches[0];
        targetPos = { x: t.clientX + camera.x, y: t.clientY + camera.y };
    }, {passive:false});

    document.addEventListener('touchmove', e => {
        if(!isPointerDown || gameState !== 'PLAYING') return;
        e.preventDefault();
        let t = e.touches[0];
        targetPos = { x: t.clientX + camera.x, y: t.clientY + camera.y };
    }, {passive:false});

    document.addEventListener('touchend', e => {
        isPointerDown = false;
        targetPos = null;
    }, {passive:false});

    document.addEventListener('touchcancel', e => {
        isPointerDown = false;
        targetPos = null;
    }, {passive:false});

    // Mouse controls
    document.addEventListener('mousedown', e => {
        if(gameState !== 'PLAYING') return;
        isPointerDown = true;
        targetPos = { x: e.clientX + camera.x, y: e.clientY + camera.y };
    });

    document.addEventListener('mousemove', e => {
        if(!isPointerDown || gameState !== 'PLAYING') return;
        targetPos = { x: e.clientX + camera.x, y: e.clientY + camera.y };
    });

    document.addEventListener('mouseup', e => {
        isPointerDown = false;
        targetPos = null;
    });

    document.addEventListener('mouseleave', e => {
        isPointerDown = false;
        targetPos = null;
    });
}

function endGame(win) {
    gameState = 'END';
    let sc = document.getElementById('end-screen');
    sc.style.display = 'flex';
    setTimeout(() => sc.style.opacity = 1, 10);
    document.getElementById('end-title').innerText = win ? "VICTOIRE" : "ÉCHEC";
    document.getElementById('end-title').style.color = win ? "#ffd700" : "#c63032";
    document.getElementById('end-reason').innerText = win ? "Le Talisman est à vous." : "Vous perdez un tour avant de retenter votre chance.";
    
    // Finish game after a short delay
    setTimeout(() => {
        if (window.finishGame) {
            window.finishGame(win);
        }
    }, 2000);
}

window.addEventListener('load', () => {
    resize();
    setupKeyboardControls();
    setupTouchControls();
});
