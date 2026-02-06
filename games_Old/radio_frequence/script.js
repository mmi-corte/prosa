(function() {
// ===== WAVE SYNCHRONIZATION GAME =====

// Get the minigame wrapper for scoped queries
const minigameWrapper = document.querySelector('.minigame-wrapper');

// Canvas Setup (scoped to wrapper)
const canvas = minigameWrapper.querySelector('#waveCanvas');
const ctx = canvas.getContext('2d');

// Game State
let timeLeft = 50;
let gameIsRunning = false;
let timerInterval = null;
let animationFrame = null;
let successCount = 0;
let targetDrift = 0; // Pour l'animation de dérive de l'onde cible

// Wave Parameters
const FREQUENCY = 8;
const PHASE_TOLERANCE = 0.05;
const AMPLITUDE_TOLERANCE = 5;

let targetPhase = 0;
let targetAmplitude = 60;
let playerPhase = Math.PI;
let playerAmplitude = 60;

let syncHoldTime = 0;
const SYNC_HOLD_DURATION = 600; // 0.6 seconde de maintien pour valider

// DOM Elements - Game (scoped to wrapper)
const timerDisplay = minigameWrapper.querySelector('#timer');
const messageText = minigameWrapper.querySelector('#messageText');
const startBtn = minigameWrapper.querySelector('#startBtn');
const phaseStatus = minigameWrapper.querySelector('#phaseStatus');
const amplitudeStatus = minigameWrapper.querySelector('#amplitudeStatus');
const successCountDisplay = minigameWrapper.querySelector('#successCount');
const tuningSliderPhase = minigameWrapper.querySelector('#tuningSliderPhase');
const tuningSliderAmplitude = minigameWrapper.querySelector('#tuningSliderAmplitude');
const needlePhase = minigameWrapper.querySelector('#needlePhase');
const needleAmplitude = minigameWrapper.querySelector('#needleAmplitude');
const minigameContainer = minigameWrapper.querySelector('#minigameContainer');

// DOM Elements - Modals (scoped to wrapper)
const rulesModal = minigameWrapper.querySelector('#rulesModal');
const closeModalBtn = minigameWrapper.querySelector('#closeModal');

// ===== MODAL FUNCTIONS =====

closeModalBtn.addEventListener('click', function() {
    rulesModal.style.display = 'none';
    minigameContainer.style.display = 'block';
});

// ===== WAVE GENERATION =====

function generateRandomTarget() {
    targetPhase = Math.random() * Math.PI * 2;
    targetAmplitude = 10 + Math.random() * 50; // Entre 10 et 60
    targetDrift = 0;
}

// ===== WAVE DRAWING FUNCTIONS =====

function drawWave(phase, amplitude, color, lineWidth, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        const t = (x / canvas.width) * Math.PI * 4;
        const y = canvas.height / 2 + Math.sin(FREQUENCY * t + phase) * amplitude;
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.font = '12px "Courier New"';
    ctx.fillText(label, 10, label === 'CIBLE' ? 20 : 40);
}

function drawWaves() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Center line
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Draw waves avec dérive de la cible
    drawWave(targetPhase + targetDrift, targetAmplitude, '#00ff00', 3, 'CIBLE');
    drawWave(playerPhase, playerAmplitude, '#00ffff', 2, 'JOUEUR');
}

// ===== NEEDLE POSITION =====

function updateNeedles() {
    // Phase needle
    const phaseDiff = Math.abs(playerPhase - (targetPhase + targetDrift));
    const normalizedPhaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
    const phaseSyncPercentage = 1 - (normalizedPhaseDiff / Math.PI);
    
    const phaseDeviation = (1 - phaseSyncPercentage) * 40;
    const phaseDirection = playerPhase > (targetPhase + targetDrift) ? 1 : -1;
    const phasePosition = 50 + (phaseDeviation * phaseDirection);
    needlePhase.style.left = `${Math.max(5, Math.min(95, phasePosition))}%`;
    
    // Amplitude needle
    const ampDiff = Math.abs(playerAmplitude - targetAmplitude);
    const ampSyncPercentage = 1 - Math.min(ampDiff / 60, 1);
    
    const ampDeviation = (1 - ampSyncPercentage) * 40;
    const ampDirection = playerAmplitude > targetAmplitude ? 1 : -1;
    const ampPosition = 50 + (ampDeviation * ampDirection);
    needleAmplitude.style.left = `${Math.max(5, Math.min(95, ampPosition))}%`;
}

// ===== TUNING CONTROLS =====

tuningSliderPhase.addEventListener('input', function() {
    if (gameIsRunning) {
        playerPhase = parseFloat(this.value) / 100;
        drawWaves();
        updateNeedles();
        checkSynchronization();
    }
});

tuningSliderAmplitude.addEventListener('input', function() {
    if (gameIsRunning) {
        playerAmplitude = parseFloat(this.value);
        drawWaves();
        updateNeedles();
        checkSynchronization();
    }
});

// ===== SYNCHRONIZATION CHECK =====

function checkSynchronization() {
    const phaseDiff = Math.abs(playerPhase - (targetPhase + targetDrift));
    const normalizedPhaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
    const ampDiff = Math.abs(playerAmplitude - targetAmplitude);
    
    const phaseSynced = normalizedPhaseDiff < PHASE_TOLERANCE;
    const ampSynced = ampDiff < AMPLITUDE_TOLERANCE;
    
    // Update status displays
    if (phaseSynced) {
        phaseStatus.textContent = 'SYNC OK';
        phaseStatus.style.color = '#00ffff';
    } else if (normalizedPhaseDiff < PHASE_TOLERANCE * 2) {
        phaseStatus.textContent = 'PROCHE';
        phaseStatus.style.color = '#ffff00';
    } else {
        phaseStatus.textContent = 'DÉSYNC';
        phaseStatus.style.color = '#00ff00';
    }
    
    if (ampSynced) {
        amplitudeStatus.textContent = 'SYNC OK';
        amplitudeStatus.style.color = '#00ffff';
    } else if (ampDiff < AMPLITUDE_TOLERANCE * 2) {
        amplitudeStatus.textContent = 'PROCHE';
        amplitudeStatus.style.color = '#ffff00';
    } else {
        amplitudeStatus.textContent = 'DÉSYNC';
        amplitudeStatus.style.color = '#00ff00';
    }
    
    return phaseSynced && ampSynced;
}

// ===== GAME LOOP =====

let lastSyncCheck = Date.now();

function gameLoop() {
    if (!gameIsRunning) return;
    
    // Drift de l'onde cible
    targetDrift += 0.002;
    
    drawWaves();
    updateNeedles();
    
    const now = Date.now();
    if (now - lastSyncCheck > 100) {
        const isSynced = checkSynchronization();
        
        if (isSynced) {
            syncHoldTime += (now - lastSyncCheck);
            
            if (syncHoldTime >= SYNC_HOLD_DURATION) {
                // Synchronisation validée !
                successCount++;
                successCountDisplay.textContent = `${successCount}/3`;
                syncHoldTime = 0;
                
                if (successCount >= 3) {
                    endGame(true);
                    return;
                } else {
                    // Nouvelle cible
                    messageText.className = 'status-content partial';
                    messageText.innerHTML = `<span class="prompt">&gt;</span> SIGNAL ${successCount}/3 VERROUILLÉ ! Préparation du prochain signal...`;
                    
                    setTimeout(() => {
                        generateRandomTarget();
                        messageText.className = 'status-content';
                        messageText.innerHTML = `<span class="prompt">&gt;</span> Nouveau signal détecté. Synchronisation requise...`;
                    }, 1500);
                }
            } else {
                // En cours de maintien
                const progress = Math.floor((syncHoldTime / SYNC_HOLD_DURATION) * 100);
                messageText.className = 'status-content partial';
                messageText.innerHTML = `<span class="prompt">&gt;</span> Maintien de la synchronisation... ${progress}%`;
            }
        } else {
            syncHoldTime = 0;
            if (successCount === 0) {
                messageText.className = 'status-content';
                messageText.innerHTML = `<span class="prompt">&gt;</span> Ajustez la phase ET l'amplitude pour synchroniser le signal...`;
            }
        }
        
        lastSyncCheck = now;
    }
    
    animationFrame = requestAnimationFrame(gameLoop);
}

// ===== GAME LOGIC =====

function startGame() {
    if (gameIsRunning) return;
    
    gameIsRunning = true;
    timeLeft = 50;
    successCount = 0;
    syncHoldTime = 0;
    successCountDisplay.textContent = '0/3';
    
    generateRandomTarget();
    
    playerPhase = Math.PI;
    playerAmplitude = 60;
    tuningSliderPhase.value = 314;
    tuningSliderAmplitude.value = 60;
    
    startBtn.disabled = true;
    startBtn.textContent = '> EN COURS...';
    messageText.className = 'status-content';
    messageText.innerHTML = '<span class="prompt">&gt;</span> Synchronisation en cours... Ajustez la phase ET l\'amplitude.';
    
    phaseStatus.textContent = 'DÉSYNC';
    phaseStatus.style.color = '#00ff00';
    amplitudeStatus.textContent = 'DÉSYNC';
    amplitudeStatus.style.color = '#00ff00';
    
    drawWaves();
    updateNeedles();
    
    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
    
    lastSyncCheck = Date.now();
    gameLoop();
}

function endGame(victory) {
    gameIsRunning = false;
    clearInterval(timerInterval);
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    startBtn.disabled = true;
    
    if (victory) {
        messageText.className = 'status-content synced';
        messageText.innerHTML = '<span class="prompt">&gt;</span> SIGNAL ACQUIS. TRANSMISSION ÉTABLIE.<br><br>Tous les signaux ont été synchronisés.';
        phaseStatus.textContent = 'VERROUILLÉ';
        phaseStatus.style.color = '#00ffff';
        amplitudeStatus.textContent = 'VERROUILLÉ';
        amplitudeStatus.style.color = '#00ffff';
        
        // Dispatch win event after a short delay
        setTimeout(function() {
            window.dispatchEvent(new CustomEvent('minigame-complete', {
                detail: { gameFinished: true, success: true }
            }));
        }, 2000);
    } else {
        messageText.className = 'status-content failed';
        messageText.innerHTML = `<span class="prompt">&gt;</span> PERTE DE SIGNAL. TROP LENT.<br><br>Signaux synchronisés: ${successCount}/3. Le signal s'est dissipé avant synchronisation complète.`;
        phaseStatus.textContent = 'ÉCHEC';
        phaseStatus.style.color = '#ff0000';
        amplitudeStatus.textContent = 'ÉCHEC';
        amplitudeStatus.style.color = '#ff0000';
        
        // Dispatch fail event after a short delay
        setTimeout(function() {
            console.log('Dispatching minigame-complete event with success: false');
            window.dispatchEvent(new CustomEvent('minigame-complete', {
                detail: { gameFinished: true, success: false }
            }));
        }, 2000);
    }
}

// ===== EVENT LISTENERS =====

startBtn.addEventListener('click', startGame);

// ===== INITIALIZATION =====

drawWaves();
updateNeedles();

})(); // End of IIFE