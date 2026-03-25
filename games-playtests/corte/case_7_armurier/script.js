// --- CONFIGURATION ---
const LEVELS = [
    {
        id: 1, name: "Entrée", time: 40, maxWeight: 35, traps: 1 / 6, rows: 3, cols: 4,
        msg: "SECTEUR CALME. CHAUFFEZ-VOUS.", crateClass: "zone-1-crate", icon: "fa-box", blackout: false
    },
    {
        id: 2, name: "Réserve", time: 30, maxWeight: 55, traps: 0.25, rows: 4, cols: 5,
        msg: "HAUTE DENSITÉ. ATTENTION AU POIDS.", crateClass: "zone-2-crate", icon: "fa-boxes-stacked", blackout: false
    },
    {
        id: 3, name: "Bunker", time: 25, maxWeight: 70, traps: 0.50, rows: 4, cols: 6,
        msg: "PANNE DE COURANT. UTILISEZ LA LAMPE.", crateClass: "zone-3-crate", icon: "fa-lock", blackout: true
    }
];

// Items dont les "Extensions" (poids = 0, type=upgrade)
// Utilisation d'icônes FA 6 standards et explicites
const lootTable = [
    { id: 'ext_bag', name: "Poche Molle", icon: "fa-briefcase", weight: 0, value: 50, type: "upgrade", bonus: 10, color: "text-pink-500" },
    { id: 'ext_tac', name: "Sac Tactique", icon: "fa-person-walking-luggage", weight: 0, value: 80, type: "upgrade", bonus: 15, color: "text-pink-400" },
    { id: 'medkit', name: "Kit Chirurgical", icon: "fa-suitcase-medical", weight: 3, value: 120, type: "item", color: "text-red-500" },
    { id: 'antibio', name: "Antibiotiques", icon: "fa-pills", weight: 0.5, value: 90, type: "item", color: "text-red-400" },
    { id: 'water', name: "Eau Pure", icon: "fa-bottle-water", weight: 10, value: 100, type: "item", color: "text-blue-500" },
    { id: 'food', name: "Rations", icon: "fa-bread-slice", weight: 8, value: 80, type: "item", color: "text-yellow-600" },
    { id: 'radio', name: "Radio", icon: "fa-walkie-talkie", weight: 1.5, value: 110, type: "item", color: "text-purple-400" },
    { id: 'battery', name: "Batterie Li-Ion", icon: "fa-car-battery", weight: 2, value: 60, type: "item", color: "text-yellow-400" },
    { id: 'fuel', name: "Essence", icon: "fa-oil-can", weight: 5, value: 75, type: "item", color: "text-orange-600" },
    { id: 'intel', name: "Disque Dur", icon: "fa-hard-drive", weight: 0.2, value: 200, type: "item", color: "text-cyan-400" },
    { id: 'junk', name: "Débris", icon: "fa-recycle", weight: 1, value: 0, type: "junk", color: "text-zinc-600" }
];

// --- GAME STATE ---
let gs = {
    levelIndex: 0,
    totalScore: 0,
    levelScore: 0,
    timeLeft: 0,
    maxWeight: 0,
    currentWeight: 0,
    combo: 1,
    maxComboLevel: 1,
    maxComboTotal: 1,
    comboTimeLeft: 0,
    COMBO_MAX_TIME: 30,
    scansLeft: 3,
    isActive: false,
    timerInterval: null
};

const DOM = {
    grid: document.getElementById('grid-container'),
    log: document.getElementById('log-area'),
    scanBtn: document.getElementById('btn-scan'),
    scanCount: document.getElementById('scan-count'),
    particles: document.getElementById('particles-container'),
    alarm: document.getElementById('alarm-overlay'),
    comboDisp: document.getElementById('combo-display'),
    comboBar: document.getElementById('combo-bar'),
    comboBox: document.getElementById('combo-box'),
    weightText: document.getElementById('weight-text'),
    weightBar: document.getElementById('weight-bar')
};

function startGame() {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('game-ui').classList.add('flex');
    gs.levelIndex = 0;
    gs.totalScore = 0;
    gs.scansLeft = 3;
    gs.maxComboTotal = 1;
    startLevel(0);
}

function startLevel(idx) {
    const config = LEVELS[idx];
    gs.timeLeft = config.time;
    gs.maxWeight = config.maxWeight;
    gs.currentWeight = 0;
    gs.levelScore = 0;
    gs.combo = 1;
    gs.isActive = true;

    if (config.blackout) { DOM.alarm.classList.remove('hidden'); DOM.grid.classList.add('zone-3-bg'); }
    else { DOM.alarm.classList.add('hidden'); DOM.grid.classList.remove('zone-3-bg'); }

    document.getElementById('zone-display').innerText = idx + 1;
    DOM.scanCount.innerText = gs.scansLeft;
    updateScanButton();
    updateHUD();
    updateComboUI();
    log(`/// ${config.msg} ///`, "text-white");
    generateGrid(config);

    if (gs.timerInterval) clearInterval(gs.timerInterval);
    gs.timerInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    if (!gs.isActive) return;
    gs.timeLeft -= 0.1;
    if (gs.timeLeft <= 0) { gs.timeLeft = 0; endLevel("TEMPS ÉCOULÉ"); }

    if (gs.combo > 1) {
        gs.comboTimeLeft--;
        let width = (gs.comboTimeLeft / gs.COMBO_MAX_TIME) * 100;
        DOM.comboBar.style.width = `${width}%`;
        if (gs.comboTimeLeft <= 0) resetCombo();
    } else { DOM.comboBar.style.width = '0%'; }
    updateHUD();
}

function increaseCombo() {
    gs.combo++;
    if (gs.combo > gs.maxComboLevel) gs.maxComboLevel = gs.combo;
    if (gs.combo > gs.maxComboTotal) gs.maxComboTotal = gs.combo;
    gs.comboTimeLeft = gs.COMBO_MAX_TIME;
    DOM.comboBox.classList.remove('combo-pulse');
    void DOM.comboBox.offsetWidth;
    DOM.comboBox.classList.add('combo-pulse');
    updateComboUI();
}

function resetCombo() {
    if (gs.combo > 1) spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, "COMBO PERDU", "text-red-500 font-black text-3xl fixed z-50");
    gs.combo = 1;
    updateComboUI();
}

function updateComboUI() {
    DOM.comboDisp.innerText = `x${gs.combo}`;
    if (gs.combo >= 5) DOM.comboDisp.className = "text-5xl font-bold text-red-500 title-font italic drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]";
    else if (gs.combo >= 3) DOM.comboDisp.className = "text-5xl font-bold text-orange-400 title-font italic drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]";
    else DOM.comboDisp.className = "text-5xl font-bold text-yellow-400 title-font italic drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]";
}

function updateHUD() {
    const config = LEVELS[gs.levelIndex];
    document.getElementById('time-text').innerText = gs.timeLeft.toFixed(1) + "s";
    const timePct = (gs.timeLeft / config.time) * 100;
    const bar = document.getElementById('timer-bar');
    bar.style.width = `${Math.min(timePct, 100)}%`;
    bar.className = gs.timeLeft < 10 ? "h-full w-full bg-red-600 animate-pulse" : "bg-gradient-to-r from-red-600 to-orange-500 h-full w-full";

    document.getElementById('score-display').innerText = gs.totalScore + gs.levelScore;

    // Dynamic Weight Handling
    DOM.weightText.innerHTML = `${gs.currentWeight.toFixed(1)} <span class="text-sm text-zinc-500">/ ${gs.maxWeight}</span>`;
    const wPct = (gs.currentWeight / gs.maxWeight) * 100;
    DOM.weightBar.style.width = `${Math.min(wPct, 100)}%`;
    DOM.weightBar.className = wPct >= 100 ? "bg-red-500 h-full w-full" : "bg-cyan-500 h-full w-full";
}

function generateGrid(config) {
    DOM.grid.innerHTML = '';
    DOM.grid.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
    const totalCrates = config.rows * config.cols;
    for (let i = 0; i < totalCrates; i++) {
        const crate = document.createElement('div');
        crate.className = `crate ${config.crateClass} rounded h-24 flex flex-col items-center justify-center relative select-none`;
        crate.innerHTML = `<div class="absolute inset-0 bg-black opacity-20 pointer-events-none"></div><i class="fas ${config.icon} text-3xl text-white/30 mb-1 relative z-10 transition-all duration-300"></i><span class="text-[9px] text-white/30 font-mono relative z-10 font-bold tracking-widest">BX-${100 + i}</span>`;
        const rand = Math.random();
        let type = 'loot';
        if (rand < config.traps) type = 'trap';
        else if (rand < config.traps + 0.1) type = 'junk';
        crate.dataset.type = type;
        crate.dataset.opened = "false";
        crate.onclick = (e) => handleCrateClick(crate, e);
        DOM.grid.appendChild(crate);
    }
}

function handleCrateClick(crate, event) {
    if (crate.dataset.opened === "true" || !gs.isActive) return;
    const type = crate.dataset.type;
    const x = event.clientX;
    const y = event.clientY;
    openCrateVisuals(crate, type);
    spawnParticles(x, y, type === 'trap' ? '#ef4444' : '#fbbf24');
    if (type === 'trap') triggerTrap(x, y);
    else if (type === 'junk') { log("VIDE...", "text-zinc-500"); resetCombo(); }
    else triggerLoot(x, y);
    checkLevelComplete();
}

function openCrateVisuals(crate, type) {
    crate.dataset.opened = "true";
    crate.classList.add('opened');
    crate.classList.remove('zone-1-crate', 'zone-2-crate', 'zone-3-crate', 'scanned-safe', 'scanned-trap');
    crate.style.opacity = "1";
    crate.style.background = "#18181b";
    crate.style.border = "1px solid #27272a";
    if (type === 'trap') {
        crate.classList.add('shake-element');
        crate.style.background = "#450a0a";
        crate.style.borderColor = "#ef4444";
        crate.innerHTML = `<i class="fas fa-radiation text-4xl text-red-500 animate-spin-slow"></i>`;
    } else if (type === 'junk') {
        crate.innerHTML = `<span class="text-xs text-zinc-700 font-mono font-bold">NÉANT</span>`;
    }
}

function triggerTrap(x, y) {
    const penalty = 5;
    gs.timeLeft -= penalty;
    spawnFloatingText(x, y, `-${penalty}s`, 'text-red-600 text-3xl font-black absolute z-50');
    log("ALERTE ! PIÈGE !", "text-red-500");
    resetCombo();
    document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
    setTimeout(() => document.body.style.transform = 'none', 100);
}

function triggerLoot(x, y) {
    let item = getRandomLootItem();
    const config = LEVELS[gs.levelIndex];

    // GESTION UPGRADE SAC
    if (item.type === 'upgrade') {
        gs.maxWeight += item.bonus;
        gs.levelScore += item.value;
        spawnFloatingText(x, y, `+${item.bonus}KG CAPACITÉ`, "text-pink-500 text-xl font-bold absolute z-50");
        log(`SAC AMÉLIORÉ !`, "text-pink-500");

        const crates = document.querySelectorAll('.crate.opened');
        const lastCrate = crates[crates.length - 1];
        if (lastCrate) {
            lastCrate.style.borderColor = "#ec4899";
            lastCrate.innerHTML = `<i class="fas ${item.icon} text-3xl text-pink-500 mb-1 reveal"></i><span class="text-[9px] text-white font-bold">UPGRADE</span>`;
        }
        return;
    }

    if (gs.currentWeight + item.weight > gs.maxWeight) {
        spawnFloatingText(x, y, "TROP LOURD", "text-zinc-500 text-xl font-bold absolute z-50");
        log(`Laissé : ${item.name}`, "text-orange-500");
        const crates = document.querySelectorAll('.crate.opened');
        const lastCrate = crates[crates.length - 1];
        if (lastCrate) lastCrate.innerHTML = `<i class="fas ${item.icon} text-2xl text-zinc-600 opacity-50"></i><span class="text-[8px] text-red-500 font-bold">LOURD</span>`;
        return;
    }

    let finalValue = item.value * gs.combo;
    gs.currentWeight += item.weight;
    gs.levelScore += finalValue;

    spawnFloatingText(x, y, `+${finalValue}`, "text-green-400 text-2xl font-bold absolute z-50");
    increaseCombo();
    log(`+ ${item.name}`, "text-green-400");

    const crates = document.querySelectorAll('.crate.opened');
    const lastCrate = crates[crates.length - 1];
    if (lastCrate && !lastCrate.querySelector('.fa-radiation')) {
        lastCrate.style.borderColor = "#22c55e";
        lastCrate.innerHTML = `<i class="fas ${item.icon} text-3xl ${item.color} mb-1 reveal"></i><div class="flex flex-col items-center leading-none"><span class="text-[9px] text-white font-bold mb-1 tracking-tighter">${item.name}</span></div>`;
    }
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = x + 'px'; p.style.top = y + 'px';
        p.style.width = (Math.random() * 6 + 2) + 'px'; p.style.height = p.style.width;
        p.style.backgroundColor = color;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 60 + 20;
        p.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
        DOM.particles.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

function useScanner() {
    if (gs.scansLeft <= 0 || !gs.isActive) return;
    gs.scansLeft--;
    updateScanButton();
    DOM.scanCount.innerText = gs.scansLeft;
    log("SCAN TACTIQUE...", "text-cyan-400");
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-cyan-500/10 pointer-events-none z-50';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 200);

    const closedCrates = Array.from(document.querySelectorAll('.crate:not(.opened)'));
    const traps = closedCrates.filter(c => c.dataset.type === 'trap');
    const safe = closedCrates.filter(c => c.dataset.type !== 'trap');
    const shuffledTraps = traps.sort(() => 0.5 - Math.random());
    const shuffledSafe = safe.sort(() => 0.5 - Math.random());
    let toScan = [...shuffledTraps.slice(0, 2), ...shuffledSafe].slice(0, 3);
    if (toScan.length < 3) toScan = closedCrates.slice(0, 3);

    const activeIndicators = [];
    toScan.forEach(crate => {
        const type = crate.dataset.type;
        const ind = document.createElement('div');
        ind.className = "absolute inset-0 z-20 flex items-center justify-center bg-black/70 scan-indicator animate-pulse";
        if (type === 'trap') {
            crate.style.borderColor = "#ef4444";
            ind.classList.add("border-4", "border-red-600");
            ind.innerHTML = `<i class="fas fa-bomb text-red-500 text-4xl drop-shadow-[0_0_10px_red]"></i>`;
        } else {
            crate.style.borderColor = "#4ade80";
            ind.classList.add("border-4", "border-green-500");
            ind.innerHTML = `<i class="fas fa-check text-green-500 text-4xl opacity-80"></i>`;
        }
        crate.appendChild(ind);
        activeIndicators.push({ crate, ind });
    });
    setTimeout(() => { activeIndicators.forEach(obj => { obj.ind.remove(); obj.crate.style.borderColor = ""; }); }, 1500);
}

function manualExtraction() {
    if (!gs.isActive) return;
    endLevel("EXTRACTION RAPIDE");
}

function updateScanButton() {
    if (gs.scansLeft <= 0) { DOM.scanBtn.disabled = true; DOM.scanBtn.classList.add('opacity-30', 'grayscale'); }
}

function getRandomLootItem() {
    const r = Math.random();
    const pool = lootTable.filter(i => i.id !== 'junk');

    if (gs.currentWeight > gs.maxWeight * 0.8 && Math.random() < 0.3) {
        return pool.find(i => i.type === 'upgrade') || pool[0];
    }

    if (Math.random() < 0.05) return pool.find(i => i.type === 'upgrade') || pool[0];
    if (gs.levelIndex === 2 && r < 0.4) return pool.find(i => i.id === 'intel') || pool[0];
    if (r < 0.3) return pool.filter(i => i.value > 100 && i.type !== 'upgrade')[0] || pool[0];
    return pool.filter(i => i.value <= 100 && i.type !== 'upgrade')[Math.floor(Math.random() * pool.filter(i => i.value <= 100 && i.type !== 'upgrade').length)] || pool[0];
}

function spawnFloatingText(x, y, text, classes) {
    const el = document.createElement('div');
    el.className = `floating-text ${classes}`;
    el.innerHTML = text;
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function checkLevelComplete() {
    const unopened = document.querySelectorAll('.crate:not(.opened)').length;
    if (unopened === 0) endLevel("ZONE NETTOYÉE");
}

function endLevel(reason) {
    gs.isActive = false;
    clearInterval(gs.timerInterval);
    gs.totalScore += gs.levelScore;
    if (gs.levelIndex < LEVELS.length - 1) {
        const screen = document.getElementById('level-screen');
        document.getElementById('level-title').innerText = reason === "TEMPS ÉCOULÉ" ? "ÉVACUATION D'URGENCE" : "EXTRACTION RÉUSSIE";
        if (reason === "TEMPS ÉCOULÉ") document.getElementById('level-title').classList.replace('text-green-400', 'text-yellow-500');

        screen.classList.remove('hidden'); screen.classList.add('flex');
        document.getElementById('level-score-disp').innerText = gs.levelScore;
        document.getElementById('level-combo-disp').innerText = `x${gs.maxComboLevel}`;
        document.getElementById('total-score-disp').innerText = gs.totalScore;
    } else { endGame(); }
}

function nextLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    gs.levelIndex++;
    startLevel(gs.levelIndex);
}

function endGame() {
    const screen = document.getElementById('end-screen');
    screen.classList.remove('hidden'); screen.classList.add('flex');
    document.getElementById('final-score').innerText = gs.totalScore;
    document.getElementById('final-max-combo').innerText = `x${gs.maxComboTotal}`;
    let rank = 'D'; let color = 'text-zinc-500'; let msg = "Mission Échouée.";
    if (gs.totalScore > 8000) { rank = 'S'; color = 'text-yellow-400'; msg = "LÉGENDAIRE !"; }
    else if (gs.totalScore > 5000) { rank = 'A'; color = 'text-green-400'; msg = "Excellent travail."; }
    else if (gs.totalScore > 3000) { rank = 'B'; color = 'text-blue-400'; msg = "Bonne récolte."; }
    else if (gs.totalScore > 1000) { rank = 'C'; color = 'text-orange-400'; msg = "Juste assez..."; }
    const rankEl = document.getElementById('rank-stamp');
    rankEl.innerText = rank;
    rankEl.className = `absolute top-10 right-10 border-8 ${color} ${color} font-bold text-9xl p-2 rotate-12 opacity-0 scale-150 transition-all duration-500 title-font shadow-[0_0_50px_currentColor]`;
    document.getElementById('end-message').innerText = msg;
    document.getElementById('end-message').className = `italic text-lg mb-10 ${color}`;
    setTimeout(() => { rankEl.style.opacity = '1'; rankEl.style.transform = 'rotate(12deg) scale(1)'; }, 500);
    
    // Show continue or abandon button based on result (S, A, B = win, C, D = lose)
    const isWin = gs.totalScore > 3000;
    const btnContinue = document.getElementById('btn-continue');
    const btnAbandon = document.getElementById('btn-abandon');
    if (isWin) {
        if (btnContinue) btnContinue.classList.remove('hidden');
    } else {
        if (btnAbandon) btnAbandon.classList.remove('hidden');
    }
}

function log(msg, color) { DOM.log.innerHTML = `<span class="${color}">${msg}</span>`; }
