// ===== ÉPREUVE DE FORCE - L'ORCU =====

// Configuration du jeu
const CONFIG = {
    gameDuration: 14000,        // 14 secondes
    targetTaps: 50,            // Nombre de taps pour gagner
    tapDecay: 0.3,             // Pourcentage de décroissance par seconde
    winThreshold: 100          // Pourcentage pour gagner
};

// État du jeu
const gameState = {
    isRunning: false,
    timeLeft: CONFIG.gameDuration,
    progress: 0,
    tapCount: 0,
    timerInterval: null,
    decayInterval: null,
    firstTapDone: false
};

// Éléments DOM
let rulesModal, victoryModal, failModal, gameContainer;
let startGameBtn, continueBtn, retryBtn;
let timerDisplay, progressBar, progressValue, tapCounter;
let tapZone, tapRipple;

// Initialisation du mode clair
function initializeLightMode() {
    const gameBody = document.getElementById('gameBody');
    if (!gameBody) return;
    
    const settingLightMode = localStorage.getItem('settingLightMode');
    if (settingLightMode === 'true') {
        gameBody.classList.add('light-mode');
    }
    
    // Vérifier périodiquement les changements
    setInterval(() => {
        const isLightMode = localStorage.getItem('settingLightMode') === 'true';
        const hasLightClass = gameBody.classList.contains('light-mode');
        
        if (isLightMode && !hasLightClass) {
            gameBody.classList.add('light-mode');
        } else if (!isLightMode && hasLightClass) {
            gameBody.classList.remove('light-mode');
        }
    }, 1000);
}

// Initialisation des éléments DOM
function initializeDOM() {
    rulesModal = document.getElementById('rulesModal');
    victoryModal = document.getElementById('victoryModal');
    failModal = document.getElementById('failModal');
    gameContainer = document.getElementById('gameContainer');
    
    startGameBtn = document.getElementById('startGameBtn');
    continueBtn = document.getElementById('continueBtn');
    retryBtn = document.getElementById('retryBtn');
    
    timerDisplay = document.getElementById('timerDisplay');
    progressBar = document.getElementById('progressBar');
    progressValue = document.getElementById('progressValue');
    tapCounter = document.getElementById('tapCounter');
    
    tapZone = document.getElementById('tapZone');
    tapRipple = document.getElementById('tapRipple');
    
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    continueBtn.addEventListener('click', handleVictory);
    retryBtn.addEventListener('click', handleRetry);
    
    // Tap zone events (touch + click)
    tapZone.addEventListener('touchstart', handleTap, { passive: false });
    tapZone.addEventListener('mousedown', handleTap);
    
    // Empêcher le comportement par défaut sur touch
    tapZone.addEventListener('touchend', (e) => e.preventDefault());
}

// Démarrer le jeu
function startGame() {
    rulesModal.style.display = 'none';
    gameContainer.style.display = 'flex';
    
    // Réinitialiser l'état
    gameState.isRunning = true;
    gameState.firstTapDone = false;
    gameState.timeLeft = CONFIG.gameDuration;
    gameState.progress = 0;
    gameState.tapCount = 0;
    
    updateUI();
}

// Lancer le timer (appelé au premier tap)
function startTimer() {
    // Timer principal
    const startTime = Date.now();
    gameState.timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        gameState.timeLeft = Math.max(0, CONFIG.gameDuration - elapsed);
        
        // Mettre à jour l'affichage du timer
        const seconds = (gameState.timeLeft / 1000).toFixed(1);
        timerDisplay.textContent = seconds;
        
        // Classes d'alerte
        timerDisplay.classList.remove('warning', 'danger');
        if (gameState.timeLeft <= 2000 && gameState.timeLeft > 1000) {
            timerDisplay.classList.add('warning');
        } else if (gameState.timeLeft <= 1000) {
            timerDisplay.classList.add('danger');
        }
        
        // Fin du temps
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 50);
    
    // Décroissance de la jauge
    gameState.decayInterval = setInterval(() => {
        if (gameState.isRunning && gameState.progress > 0) {
            gameState.progress = Math.max(0, gameState.progress - (CONFIG.tapDecay * 2));
            updateProgressBar();
        }
    }, 100);
}

// Gérer un tap
function handleTap(e) {
    e.preventDefault();
    
    if (!gameState.isRunning) return;
    
    // Lancer le timer au premier tap
    if (!gameState.firstTapDone) {
        gameState.firstTapDone = true;
        startTimer();
    }
    
    // Incrémenter le compteur
    gameState.tapCount++;
    tapCounter.textContent = gameState.tapCount;
    
    // Augmenter la progression
    const tapValue = 100 / CONFIG.targetTaps;
    gameState.progress = Math.min(100, gameState.progress + tapValue);
    
    updateProgressBar();
    
    // Animation de tap
    tapZone.classList.add('tapped');
    setTimeout(() => tapZone.classList.remove('tapped'), 100);
    
    // Animation ripple
    tapRipple.classList.remove('active');
    void tapRipple.offsetWidth; // Force reflow
    tapRipple.classList.add('active');
    
    // Vérifier la victoire
    if (gameState.progress >= CONFIG.winThreshold) {
        endGame(true);
    }
}

// Mettre à jour la barre de progression
function updateProgressBar() {
    progressBar.style.width = `${gameState.progress}%`;
    progressValue.textContent = `${Math.round(gameState.progress)}%`;
    
    // Couleur selon le progrès
    if (gameState.progress >= 80) {
        progressValue.style.color = 'var(--accent-green)';
    } else if (gameState.progress >= 50) {
        progressValue.style.color = 'var(--yellow)';
    } else {
        progressValue.style.color = 'var(--accent-red)';
    }
}

// Mettre à jour l'UI
function updateUI() {
    timerDisplay.textContent = (gameState.timeLeft / 1000).toFixed(1);
    timerDisplay.classList.remove('warning', 'danger');
    progressBar.style.width = '0%';
    progressValue.textContent = '0%';
    progressValue.style.color = 'var(--accent-red)';
    tapCounter.textContent = '0';
}

// Fin du jeu
function endGame(victory = false) {
    gameState.isRunning = false;
    
    // Arrêter les timers
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.decayInterval);
    
    // Afficher le résultat
    setTimeout(() => {
        gameContainer.style.display = 'none';
        
        if (victory || gameState.progress >= CONFIG.winThreshold) {
            document.getElementById('finalScore').textContent = Math.round(gameState.progress);
            victoryModal.style.display = 'flex';
        } else {
            failModal.style.display = 'flex';
        }
    }, 300);
}

// Gérer la victoire
function handleVictory() {
    victoryModal.style.display = 'none';
    console.log('Victoire ! Le joueur continue son aventure.');
    // Finish game with success
    if (window.finishGame) {
        window.finishGame(true);
    }
}

// Gérer le retry après échec
function handleRetry() {
    failModal.style.display = 'none';
    rulesModal.style.display = 'flex';
    // Finish game with failure
    if (window.finishGame) {
        window.finishGame(false);
    }
}

// Initialisation au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDOM();
        initializeLightMode();
    });
} else {
    initializeDOM();
    initializeLightMode();
}
