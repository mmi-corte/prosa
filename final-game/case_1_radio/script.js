// ===== WAVE SYNCHRONIZATION GAME - COMPLETE REWRITE =====

// Global game state
const gameState = {
    isRunning: false,
    timeLeft: 50,
    successCount: 0,
    syncHoldTime: 0,
    targetPhase: 0,
    targetAmplitude: 60,
    targetDrift: 0,
    playerPhase: Math.PI,
    playerAmplitude: 60,
    animationFrame: null,
    timerInterval: null,
    lastSyncCheck: Date.now()
};

const FREQUENCY = 8;
const PHASE_TOLERANCE = 0.08;
const AMPLITUDE_TOLERANCE = 6;
const SYNC_HOLD_DURATION = 500;

// Canvas and context - will be initialized after DOM load
let canvas = null;
let ctx = null;

// DOM elements - will be initialized after DOM load
let timerDisplay, startBtn, phaseStatus, amplitudeStatus, successCountDisplay;
let tuningSliderPhase, tuningSliderAmplitude, needlePhase, needleAmplitude;
let gameContainer, rulesModal, radioModal, radioMessageDiv, skipRadioBtn, continueFromRadioBtn, closeModalBtn;

// Initialize all DOM elements
function initializeDOM() {
    canvas = document.getElementById('waveCanvas');
    ctx = canvas.getContext('2d');
    
    timerDisplay = document.getElementById('timer');
    startBtn = document.getElementById('startBtn');
    phaseStatus = document.getElementById('phaseStatus');
    amplitudeStatus = document.getElementById('amplitudeStatus');
    successCountDisplay = document.getElementById('successCount');
    tuningSliderPhase = document.getElementById('tuningSliderPhase');
    tuningSliderAmplitude = document.getElementById('tuningSliderAmplitude');
    needlePhase = document.getElementById('needlePhase');
    needleAmplitude = document.getElementById('needleAmplitude');
    gameContainer = document.getElementById('gameContainer');
    rulesModal = document.getElementById('rulesModal');
    radioModal = document.getElementById('radioModal');
    radioMessageDiv = document.getElementById('radioMessage');
    skipRadioBtn = document.getElementById('skipRadio');
    continueFromRadioBtn = document.getElementById('continueFromRadio');
    closeModalBtn = document.getElementById('closeModal');
    
    // Setup event listeners
    startBtn.addEventListener('click', startGame);
    
    closeModalBtn.addEventListener('click', function() {
        rulesModal.style.display = 'none';
        gameContainer.style.display = 'block';
        
        // Initialize canvas after showing the container
        requestAnimationFrame(() => {
            initializeCanvas();
            drawWaves();
            updateNeedles();
            // Auto-start the game
            setTimeout(() => startGame(), 100);
        });
    });
    
    tuningSliderPhase.addEventListener('input', function() {
        if (gameState.isRunning) {
            gameState.playerPhase = parseFloat(this.value) / 100;
            drawWaves();
            updateNeedles();
            checkSynchronization();
        }
    });
    
    tuningSliderAmplitude.addEventListener('input', function() {
        if (gameState.isRunning) {
            gameState.playerAmplitude = parseFloat(this.value);
            drawWaves();
            updateNeedles();
            checkSynchronization();
        }
    });
    
    skipRadioBtn.addEventListener('click', function() {
        if (isTyping) {
            typingIndex = radioMessage.length;
            radioMessageDiv.innerHTML = radioMessage;
            radioMessageDiv.classList.remove('typing-cursor');
            isTyping = false;
            continueFromRadioBtn.style.display = 'block';
            skipRadioBtn.style.display = 'none';
        }
    });
    
    continueFromRadioBtn.addEventListener('click', function() {
        radioModal.style.display = 'none';
        console.log('Mission terminée - Transition vers le prochain niveau');
    });
}

// Light mode initialization
function initializeLightMode() {
    const gameBody = document.getElementById('gameBody');
    if (!gameBody) return;

    const applyLightModeState = (isLightMode) => {
        gameBody.classList.toggle('light-mode', isLightMode);
    };

    const readSetting = () => localStorage.getItem('settingLightMode') === 'true';

    // Initial sync from stored settings
    applyLightModeState(readSetting());

    // Sync when settings page toggles class on the main document
    const rootObserver = new MutationObserver(() => {
        const rootHasLight = document.documentElement.classList.contains('light-mode');
        applyLightModeState(rootHasLight || readSetting());
    });

    rootObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Sync when settings are saved
    window.addEventListener('storage', (event) => {
        if (event.key === 'settingLightMode') {
            applyLightModeState(event.newValue === 'true');
        }
    });

    // Fallback polling for same-tab changes
    setInterval(() => {
        applyLightModeState(readSetting());
    }, 1000);
}

// Get color palette based on light mode
function getColors() {
    const styles = getComputedStyle(document.body);
    const readVar = (name, fallback) => {
        const value = styles.getPropertyValue(name).trim();
        return value || fallback;
    };

    const hexToRgb = (hex) => {
        const normalized = hex.replace('#', '');
        if (normalized.length !== 6) return [98, 98, 71];
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        return [r, g, b];
    };

    const primary = readVar('--primary', '#626247');
    const [pr, pg, pb] = hexToRgb(primary);

    return {
        primary,
        accent: readVar('--accent', '#81cbd6'),
        warning: readVar('--warning', '#ffdb2c'),
        danger: readVar('--danger', '#c63032'),
        bg: readVar('--bg', '#1a1812'),
        grid: `rgba(${pr}, ${pg}, ${pb}, 0.1)`,
        gridCenter: `rgba(${pr}, ${pg}, ${pb}, 0.2)`
    };
}

// Canvas initialization and sizing
function initializeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const width = Math.max(rect.width || 300, 100);
    const height = Math.max(rect.height || 120, 60);
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    return { width, height };
}

// Draw a single wave
function drawWave(phase, amplitude, color, lineWidth, label, canvasWidth, canvasHeight) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    
    ctx.beginPath();
    
    for (let x = 0; x < canvasWidth; x++) {
        const t = (x / canvasWidth) * Math.PI * 4;
        const y = canvasHeight / 2 + Math.sin(FREQUENCY * t + phase) * (amplitude * canvasHeight / 200);
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Draw label
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.font = 'bold 11px "Courier New"';
    ctx.fillText(label, 8, label === 'CIBLE' ? 16 : 30);
}

// Main drawing function
function drawWaves() {
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = Math.max(rect.width || 300, 100);
    const canvasHeight = Math.max(rect.height || 120, 60);
    const colors = getColors();
    
    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    
    // Horizontal grid lines
    const hSpacing = canvasHeight / 5;
    for (let y = hSpacing; y < canvasHeight; y += hSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    const vSpacing = canvasWidth / 10;
    for (let x = vSpacing; x < canvasWidth; x += vSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    
    // Center line
    ctx.strokeStyle = colors.gridCenter;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
    
    // Draw both waves
    drawWave(gameState.targetPhase + gameState.targetDrift, gameState.targetAmplitude, colors.primary, 2.5, 'CIBLE', canvasWidth, canvasHeight);
    drawWave(gameState.playerPhase, gameState.playerAmplitude, colors.accent, 2, 'JOUEUR', canvasWidth, canvasHeight);
}

// Update needle positions
function updateNeedles() {
    const phaseDiff = Math.abs(gameState.playerPhase - (gameState.targetPhase + gameState.targetDrift));
    const normalizedPhaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
    const phaseSyncPercentage = 1 - (normalizedPhaseDiff / Math.PI);
    
    const phaseDeviation = (1 - phaseSyncPercentage) * 40;
    const phaseDirection = gameState.playerPhase > (gameState.targetPhase + gameState.targetDrift) ? 1 : -1;
    const phasePosition = 50 + (phaseDeviation * phaseDirection);
    needlePhase.style.left = `${Math.max(5, Math.min(95, phasePosition))}%`;
    
    // Amplitude needle
    const ampDiff = Math.abs(gameState.playerAmplitude - gameState.targetAmplitude);
    const ampSyncPercentage = 1 - Math.min(ampDiff / 60, 1);
    
    const ampDeviation = (1 - ampSyncPercentage) * 40;
    const ampDirection = gameState.playerAmplitude > gameState.targetAmplitude ? 1 : -1;
    const ampPosition = 50 + (ampDeviation * ampDirection);
    needleAmplitude.style.left = `${Math.max(5, Math.min(95, ampPosition))}%`;
}

// Check if signals are synchronized
function checkSynchronization() {
    const colors = getColors();
    const phaseDiff = Math.abs(gameState.playerPhase - (gameState.targetPhase + gameState.targetDrift));
    const normalizedPhaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
    const ampDiff = Math.abs(gameState.playerAmplitude - gameState.targetAmplitude);
    
    const phaseSynced = normalizedPhaseDiff < PHASE_TOLERANCE;
    const ampSynced = ampDiff < AMPLITUDE_TOLERANCE;
    
    // Update status displays
    if (phaseSynced) {
        phaseStatus.textContent = 'SYNC OK';
        phaseStatus.style.color = colors.accent;
    } else if (normalizedPhaseDiff < PHASE_TOLERANCE * 2) {
        phaseStatus.textContent = 'PROCHE';
        phaseStatus.style.color = colors.warning;
    } else {
        phaseStatus.textContent = 'DÉSYNC';
        phaseStatus.style.color = colors.primary;
    }
    
    if (ampSynced) {
        amplitudeStatus.textContent = 'SYNC OK';
        amplitudeStatus.style.color = colors.accent;
    } else if (ampDiff < AMPLITUDE_TOLERANCE * 2) {
        amplitudeStatus.textContent = 'PROCHE';
        amplitudeStatus.style.color = colors.warning;
    } else {
        amplitudeStatus.textContent = 'DÉSYNC';
        amplitudeStatus.style.color = colors.primary;
    }
    
    return phaseSynced && ampSynced;
}

// Game loop
function gameLoop() {
    if (!gameState.isRunning) return;
    
    gameState.targetDrift += 0.0008;  // Réduit la dérive
    
    drawWaves();
    updateNeedles();
    
    const now = Date.now();
    if (now - gameState.lastSyncCheck > 100) {
        const isSynced = checkSynchronization();
        
        if (isSynced) {
            gameState.syncHoldTime += (now - gameState.lastSyncCheck);
            
            if (gameState.syncHoldTime >= SYNC_HOLD_DURATION) {
                gameState.successCount++;
                successCountDisplay.textContent = `${gameState.successCount}/3`;
                gameState.syncHoldTime = 0;
                
                if (gameState.successCount >= 3) {
                    endGame(true);
                    return;
                } else {
                    generateRandomTarget();
                }
            }
        } else {
            gameState.syncHoldTime = 0;
        }
        
        gameState.lastSyncCheck = now;
    }
    
    gameState.animationFrame = requestAnimationFrame(gameLoop);
}

// Generate new random target
function generateRandomTarget() {
    gameState.targetPhase = Math.random() * Math.PI * 2;
    gameState.targetAmplitude = 10 + Math.random() * 50;
    gameState.targetDrift = 0;
}

// Start the game
function startGame() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    gameState.timeLeft = 50;
    gameState.successCount = 0;
    gameState.syncHoldTime = 0;
    successCountDisplay.textContent = '0/3';
    
    generateRandomTarget();
    
    gameState.playerPhase = Math.PI;
    gameState.playerAmplitude = 60;
    tuningSliderPhase.value = 314;
    tuningSliderAmplitude.value = 60;
    
    startBtn.disabled = true;
    startBtn.textContent = '> EN COURS...';
    
    phaseStatus.textContent = 'DÉSYNC';
    phaseStatus.style.color = '#626247';
    amplitudeStatus.textContent = 'DÉSYNC';
    amplitudeStatus.style.color = '#626247';
    
    drawWaves();
    updateNeedles();
    
    gameState.timerInterval = setInterval(function() {
        gameState.timeLeft--;
        timerDisplay.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
    
    gameState.lastSyncCheck = Date.now();
    gameLoop();
}

// End the game
function endGame(victory) {
    const colors = getColors();
    gameState.isRunning = false;
    clearInterval(gameState.timerInterval);
    if (gameState.animationFrame) {
        cancelAnimationFrame(gameState.animationFrame);
    }
    startBtn.disabled = true;
    
    if (victory) {
        phaseStatus.textContent = 'VERROUILLÉ';
        phaseStatus.style.color = colors.accent;
        amplitudeStatus.textContent = 'VERROUILLÉ';
        amplitudeStatus.style.color = colors.accent;
        
        setTimeout(function() {
            showRadioModal();
        }, 2000);
    } else {
        phaseStatus.textContent = 'ÉCHEC';
        phaseStatus.style.color = colors.danger;
        amplitudeStatus.textContent = 'ÉCHEC';
        amplitudeStatus.style.color = colors.danger;
        
        startBtn.disabled = false;
        startBtn.textContent = '> RÉESSAYER';
    }
}

// Radio modal
let typingIndex = 0;
let typingSpeed = 30;
let isTyping = false;

const radioMessage = `<p><span class="emphasis">[GRÉSILLEMENT... SIGNAL FAIBLE...]</span></p>

<p>...si quelqu'un... peut... entendre...</p>

<p>Je m'appelle... peu importe qui je suis. Ce qui compte, c'est ce que j'ai vu.</p>

<p>Il existe un endroit... <span class="location">une île, quelque part entre Toulon et Corte</span>... épargnée par <span class="emphasis">La Ruina</span>.</p>

<p>Pendant que vous survivez dans les décombres, <span class="emphasis">eux</span> vivent dans l'abondance. Eau potable. Nourriture. Électricité. Tout ce que le monde a perdu.</p>

<p>Mais ils ne partagent rien. Ils nous regardent mourir depuis leurs tours d'ivoire.</p>

<p>J'ai vécu parmi eux. J'ai profité de leur confort pendant que des gens comme vous... comme moi autrefois... mouraient de faim dans les ruines.</p>

<p><span class="emphasis">Je ne peux plus.</span></p>

<p>J'ai essayé de les affronter. J'ai échoué. Maintenant je suis... emprisonné. Mais même d'ici, je peux encore lancer cet appel.</p>

<p><span class="emphasis">Rejoignez-moi. Finissez ce que j'ai commencé.</span></p>

<p>Cette île doit tomber. Ses ressources doivent être partagées. Le monde mérite mieux qu'une dictature égoïste.</p>

<p>Si vous m'entendez... si vous avez encore la force de vous battre...</p>

<p><span class="location">Trouvez l'île. Trouvez-moi. Ensemble, nous pouvons encore changer les choses.</span></p>

<p><span class="emphasis">[SIGNAL PERDU... TRANSMISSION TERMINÉE]</span></p>`;

function typeMessage() {
    isTyping = true;
    radioMessageDiv.classList.add('typing-cursor');
    
    function typeChar() {
        if (typingIndex < radioMessage.length) {
            radioMessageDiv.innerHTML = radioMessage.substring(0, typingIndex + 1);
            typingIndex++;
            setTimeout(typeChar, typingSpeed);
        } else {
            radioMessageDiv.classList.remove('typing-cursor');
            isTyping = false;
            continueFromRadioBtn.style.display = 'block';
            skipRadioBtn.style.display = 'none';
        }
    }
    
    typeChar();
}

function showRadioModal() {
    radioModal.style.display = 'flex';
    typingIndex = 0;
    radioMessageDiv.innerHTML = '';
    continueFromRadioBtn.style.display = 'none';
    skipRadioBtn.style.display = 'block';
    typeMessage();
}

// Window resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (canvas && ctx) {
            initializeCanvas();
            drawWaves();
            updateNeedles();
        }
    }, 100);
});

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDOM();
        initializeLightMode();
        requestAnimationFrame(() => {
            initializeCanvas();
            drawWaves();
            updateNeedles();
        });
    });
} else {
    initializeDOM();
    initializeLightMode();
    requestAnimationFrame(() => {
        initializeCanvas();
        drawWaves();
        updateNeedles();
    });
}
