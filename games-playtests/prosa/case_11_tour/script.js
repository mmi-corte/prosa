const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cssVar = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();

let COLORS = {};

function updateColors() {
    COLORS = {
        bg: cssVar('--card'),
        primary: cssVar('--primary'),
        primaryDark: cssVar('--primary-dark'),
        accentRed: cssVar('--accent-red'),
        accentGreen: cssVar('--accent-green'),
        border: cssVar('--border'),
        muted: cssVar('--muted')
    };
}

function initLightMode() {
    const lightMode = localStorage.getItem('settingLightMode') === 'true';
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    
    if (lightMode) {
        htmlEl.classList.add('light-mode');
        bodyEl.classList.add('light-mode');
    } else {
        htmlEl.classList.remove('light-mode');
        bodyEl.classList.remove('light-mode');
    }
    updateColors();
}

function resize() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    updateColors();
}
window.addEventListener('resize', resize);

// --- MOTEUR DE JEU ---

const STATE = {
    MENU: 0,
    PLAYING: 1,
    FAIL: 2,
    WIN: 3
};

const GUARD_STATE = {
    SAFE: 0,
    WARN: 1,
    DANGER: 2
};

class Game {
    constructor() {
        initLightMode();
        resize();
        
        // Polling pour light mode
        setInterval(() => {
            initLightMode();
        }, 1000);
        
        this.state = STATE.MENU;
        
        this.player = {
            y: 0,
            speed: 0,
            maxSpeed: 0.005,
            acceleration: 0.00015,
            isMoving: false
        };

        this.guard = {
            state: GUARD_STATE.SAFE,
            timer: 0,
            nextSwitch: 240
        };

        this.maxTime = 60; // Secondes
        this.framesLeft = this.maxTime * 60;

        this.inputActive = false;
        
        this.bindInputs();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    bindInputs() {
        const container = document.getElementById('game-container');
        
        const startMove = (e) => {
            if(this.state !== STATE.PLAYING) return;
            e.preventDefault();
            this.inputActive = true;
        };

        const endMove = (e) => {
            e.preventDefault();
            this.inputActive = false;
        };

        container.addEventListener('touchstart', startMove, {passive: false});
        container.addEventListener('touchend', endMove);
        container.addEventListener('mousedown', startMove);
        container.addEventListener('mouseup', endMove);
        container.addEventListener('mouseleave', endMove);
    }

    start() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('progress-container').classList.remove('hidden');
        this.resetGameData();
        this.state = STATE.PLAYING;
    }

    goToMenu() {
        document.getElementById('fail-screen').classList.add('hidden');
        document.getElementById('win-screen').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('progress-container').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('alert-msg').style.opacity = 0;
        this.state = STATE.MENU;
    }

    resetGameData() {
        this.player.y = 0;
        this.player.speed = 0;
        this.inputActive = false;
        this.framesLeft = this.maxTime * 60;
        
        document.getElementById('alert-msg').style.opacity = 0;
        
        this.guard.state = GUARD_STATE.SAFE;
        this.guard.timer = 0;
        this.guard.nextSwitch = 120 + Math.random() * 120;
        this.updateGuardUI();
        this.updateTimerUI();
    }

    update() {
        if (this.state !== STATE.PLAYING) return;

        this.framesLeft--;
        if (this.framesLeft % 60 === 0) {
            this.updateTimerUI();
        }
        
        if (this.framesLeft <= 0) {
            this.triggerFail("Temps écoulé !", "Vous avez été trop lent.");
            return;
        }

        this.guard.timer++;
        if (this.guard.timer >= this.guard.nextSwitch) {
            this.switchGuardState();
        }

        if (this.inputActive) {
            this.player.speed = Math.min(this.player.speed + this.player.acceleration, this.player.maxSpeed);
        } else {
            this.player.speed = Math.max(this.player.speed - 0.0004, 0);
        }

        this.player.y += this.player.speed;

        if (this.guard.state === GUARD_STATE.DANGER && this.player.speed > 0.0005) {
            this.triggerFail("Repéré !", "Les gardes vous ont vu bouger.");
        }

        if (this.player.y >= 1) {
            this.player.y = 1;
            this.triggerWin();
        }

        document.getElementById('progress-fill').style.height = (this.player.y * 100) + '%';
    }

    updateTimerUI() {
        const seconds = Math.ceil(this.framesLeft / 60);
        const timerEl = document.getElementById('timer-display');
        timerEl.innerText = seconds;
        
        if (seconds <= 10) {
            timerEl.classList.add('low-time');
        } else {
            timerEl.classList.remove('low-time');
        }
    }

    switchGuardState() {
        this.guard.timer = 0;
        const alertText = document.getElementById('alert-msg');

        switch (this.guard.state) {
            case GUARD_STATE.SAFE:
                this.guard.state = GUARD_STATE.WARN;
                this.guard.nextSwitch = 60 + Math.random() * 60;
                break;

            case GUARD_STATE.WARN:
                this.guard.state = GUARD_STATE.DANGER;
                this.guard.nextSwitch = 60 + Math.random() * 60;
                alertText.style.opacity = 1;
                break;

            case GUARD_STATE.DANGER:
                this.guard.state = GUARD_STATE.SAFE;
                this.guard.nextSwitch = 120 + Math.random() * 120;
                alertText.style.opacity = 0;
                break;
        }
        this.updateGuardUI();
    }

    updateGuardUI() {
        const eye = document.getElementById('eye');
        eye.className = 'status-indicator';
        
        if (this.guard.state === GUARD_STATE.SAFE) eye.classList.add('safe');
        if (this.guard.state === GUARD_STATE.WARN) eye.classList.add('warning');
        if (this.guard.state === GUARD_STATE.DANGER) eye.classList.add('danger');
    }

    triggerFail(title, desc) {
        this.state = STATE.FAIL;
        document.getElementById('fail-reason').innerText = title || "Échec";
        document.getElementById('fail-desc').innerText = desc || "Mission échouée.";
        document.getElementById('fail-screen').classList.remove('hidden');
        
        canvas.style.transform = "translate(5px, 5px)";
        setTimeout(() => canvas.style.transform = "translate(-5px, -5px)", 50);
        setTimeout(() => canvas.style.transform = "translate(0, 0)", 100);
    }

    triggerWin() {
        this.state = STATE.WIN;
        document.getElementById('win-screen').classList.remove('hidden');
    }

    draw() {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.2);
        ctx.moveTo(canvas.width, canvas.height);
        ctx.lineTo(canvas.width * 0.6, canvas.height * 0.2);
        ctx.stroke();

        const horizonY = canvas.height * 0.2;
        const doorW = canvas.width * 0.2;
        const doorX = (canvas.width - doorW) / 2;
        
        ctx.fillStyle = COLORS.primaryDark;
        ctx.fillRect(doorX - 20, horizonY - 40, doorW + 40, 40);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(doorX, horizonY - 30, doorW, 30);
        
        ctx.fillStyle = COLORS.accentGreen;
        ctx.fillRect(doorX + doorW/2 - 5, horizonY - 50, 10, 10);

        if (this.state === STATE.PLAYING || this.state === STATE.FAIL) {
            const progress = this.player.y;
            const visualY = canvas.height - 50 - (progress * (canvas.height - horizonY - 30));
            const scale = 1 - (progress * 0.6); 
            const size = 40 * scale;

            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(canvas.width/2, visualY + size, size, size/3, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = this.state === STATE.FAIL ? COLORS.accentRed : COLORS.primary;
            ctx.fillRect(canvas.width/2 - size/2, visualY, size, size);
            ctx.beginPath();
            ctx.arc(canvas.width/2, visualY - size/2, size/1.5, 0, Math.PI*2);
            ctx.fill();

            if (this.player.speed > 0.0005) {
                ctx.fillStyle = COLORS.border;
                const dustX = canvas.width/2 + (Math.random() - 0.5) * 20;
                ctx.fillRect(dustX, visualY + size - 5, 4, 4);
            }
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}

const game = new Game();

// Improve start button responsiveness on touchscreens
const startBtn = document.querySelector('#start-screen button');
if (startBtn) {
    const handleStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        game.start();
    };
    startBtn.addEventListener('touchend', handleStart, { passive: false });
    startBtn.addEventListener('pointerup', handleStart);
}

// Improve fail and win buttons responsiveness on touchscreens
const failBtn = document.querySelector('#fail-screen button');
if (failBtn) {
    const handleFail = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.finishGame) {
            window.finishGame(false);
        }
    };
    failBtn.addEventListener('touchend', handleFail, { passive: false });
    failBtn.addEventListener('pointerup', handleFail);
}

const winBtn = document.querySelector('#win-screen button');
if (winBtn) {
    const handleWin = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.finishGame) {
            window.finishGame(true);
        }
    };
    winBtn.addEventListener('touchend', handleWin, { passive: false });
    winBtn.addEventListener('pointerup', handleWin);
}
