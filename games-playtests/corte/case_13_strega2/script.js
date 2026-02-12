/** AUDIO ENGINE */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'blip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}

/** HELPERS MOBILE */
function bindTouch(element, callback) {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        callback(e);
    }, { passive: false });

    element.addEventListener('mousedown', (e) => {
        callback(e);
    });
}

/** GAME ENGINE */
const game = {
    isRunning: false,
    timerInterval: null,
    animationFrame: null,
    finishTimeout: null,
    hasFinished: false,
    hpPlayer: 100,
    hpBoss: 100,
    timeLeft: 0,
    maxTime: 0,
    currentType: null,

    ui: {
        screens: {
            start: document.getElementById('start-screen'),
            gameOver: document.getElementById('game-over-screen'),
            win: document.getElementById('win-screen')
        },
        instruction: document.getElementById('current-instruction'),
        timerBar: document.getElementById('timer-bar'),
        bossAvatar: document.getElementById('boss-avatar'),
        modules: document.querySelectorAll('.qte-module')
    },

    qteTypes: ['mash', 'sequence', 'timing', 'reflex', 'hold'],

    start: function () {
        this.isRunning = true;
        this.hpPlayer = 100;
        this.hpBoss = 100;
        this.updateHealthUI();
        this.ui.screens.start.classList.add('hidden');
        this.nextTurn();
    },

    nextTurn: function () {
        if (!this.isRunning) return;

        const type = this.qteTypes[Math.floor(Math.random() * this.qteTypes.length)];
        this.currentType = type;

        const diffMult = 1 + ((100 - this.hpBoss) / 250);

        let config = {};
        switch(type) {
            case 'mash':
                config = { type: 'mash', time: 4000, label: "FRAPPEZ !", target: 12 * diffMult };
                break;
            case 'sequence':
                config = { type: 'sequence', time: 5000, label: "CONTRE-SORT", length: 4 + Math.floor(diffMult - 1) };
                break;
            case 'timing':
                config = { type: 'timing', time: 3000, label: "PRÉCISION", speed: 1.8 * diffMult };
                break;
            case 'reflex':
                config = { type: 'reflex', time: 4000, label: "BLOQUEZ !", count: 4 };
                break;
            case 'hold':
                config = { type: 'hold', time: 5000, label: "MAINTENIR PRESSION", duration: 1500 };
                break;
        }

        this.startQTE(config);
    },

    startQTE: function(config) {
        this.ui.instruction.innerText = config.label;
        this.hideAllModules();
        this.startTimer(config.time);

        switch (config.type) {
            case 'mash': qteMash.init(config); break;
            case 'sequence': qteSequence.init(config); break;
            case 'timing': qteTiming.init(config); break;
            case 'reflex': qteReflex.init(config); break;
            case 'hold': qteHold.init(config); break;
        }
    },

    hideAllModules: function () {
        this.ui.modules.forEach(m => m.style.display = 'none');
    },

    startTimer: function (ms) {
        clearInterval(this.timerInterval);
        this.maxTime = ms;
        this.timeLeft = ms;
        this.updateTimerBar();

        const startTime = Date.now();
        this.timerInterval = setInterval(() => {
            if (!this.isRunning) return;
            const elapsed = Date.now() - startTime;
            this.timeLeft = Math.max(0, this.maxTime - elapsed);
            this.updateTimerBar();

            if (this.timeLeft <= 0) {
                this.fail("Trop lent !");
            }
        }, 16);
    },

    updateTimerBar: function () {
        const pct = (this.timeLeft / this.maxTime) * 100;
        this.ui.timerBar.style.width = `${pct}%`;
        this.ui.timerBar.style.background = pct < 30 ? 'var(--danger)' : 'var(--success)';
        if(pct < 30) this.ui.timerBar.style.boxShadow = '0 0 10px var(--danger)';
        else this.ui.timerBar.style.boxShadow = '0 0 10px var(--success)';
    },

    success: function () {
        if (!this.isRunning) return;
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.animationFrame);
        playSound('success');

        const dmg = 15 + Math.floor(Math.random() * 10);
        this.hpBoss = Math.max(0, this.hpBoss - dmg);
        this.showFloater(this.ui.bossAvatar, `-${dmg}`, 'var(--accent-red)');

        this.ui.bossAvatar.classList.add('hit');
        setTimeout(() => this.ui.bossAvatar.classList.remove('hit'), 200);

        this.updateHealthUI();

        if (this.hpBoss <= 0) {
            this.win();
        } else {
            setTimeout(() => this.nextTurn(), 800);
        }
    },

    fail: function (reason) {
        if (!this.isRunning) return;
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.animationFrame);
        playSound('fail');

        const dmg = 20;
        this.hpPlayer = Math.max(0, this.hpPlayer - dmg);
        this.showFloater(document.querySelector('.hp-player'), `-${dmg}`, 'var(--accent-red)');
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);

        this.updateHealthUI();

        if (this.hpPlayer <= 0) {
            this.isRunning = false;
            document.getElementById('fail-reason').innerText = reason;
            this.ui.screens.gameOver.classList.remove('hidden');
            this.queueFinish(false);
        } else {
            setTimeout(() => this.nextTurn(), 1200);
        }
    },

    win: function () {
        this.isRunning = false;
        this.ui.screens.win.classList.remove('hidden');
        this.queueFinish(true);
    },

    queueFinish: function (win) {
        if (this.hasFinished) return;
        this.hasFinished = true;
        clearTimeout(this.finishTimeout);
        this.finishTimeout = setTimeout(() => {
            if (window.finishGame) {
                window.finishGame(win);
            }
        }, 1500);
    },

    exit: function (win) {
        clearTimeout(this.finishTimeout);
        if (this.hasFinished) return;
        this.hasFinished = true;
        if (window.finishGame) {
            window.finishGame(win);
        }
    },

    updateHealthUI: function() {
        document.getElementById('boss-hp').style.width = `${this.hpBoss}%`;
        document.getElementById('player-hp').style.width = `${this.hpPlayer}%`;
    },

    showFloater: function(target, text, color) {
        const el = document.createElement('div');
        el.className = 'floater';
        el.innerText = text;
        el.style.color = color;
        const rect = target.getBoundingClientRect();
        el.style.left = (rect.left + rect.width/2 - 20) + 'px';
        el.style.top = (rect.top + 20) + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }
};

/** QTE MODULES */

// 1. MASH (Bourrinage)
const qteMash = {
    clicks: 0, target: 0,
    el: document.getElementById('qte-mash'),
    btn: document.getElementById('mash-btn'),
    bar: document.getElementById('mash-progress'),
    init: function (c) {
        this.el.style.display = 'flex';
        this.clicks = 0; this.target = c.target;
        this.bar.style.width = '0%';
        this.btn.replaceWith(this.btn.cloneNode(true));
        this.btn = document.getElementById('mash-btn');
        bindTouch(this.btn, () => this.mash());
    },
    mash: function () {
        this.clicks++;
        playSound('blip');
        this.bar.style.width = `${Math.min(100, (this.clicks/this.target)*100)}%`;
        if (this.clicks >= this.target) { game.success(); }
    }
};

// 2. SEQUENCE (Simon Says)
const qteSequence = {
    el: document.getElementById('qte-sequence'),
    seq: [], idx: 0,
    keys: ['Up', 'Down', 'Left', 'Right'],
    init: function (c) {
        this.el.style.display = 'flex';
        this.seq = []; this.idx = 0;
        const display = document.getElementById('seq-display');
        display.innerHTML = '';

        for(let i=0; i<c.length; i++) {
            const k = this.keys[Math.floor(Math.random()*4)];
            this.seq.push(k);
            const span = document.createElement('span');
            span.innerText = k === 'Up' ? '▲' : k === 'Down' ? '▼' : k === 'Left' ? '◀' : '▶';
            span.style.color = '#555'; span.id = `seq-${i}`;
            display.appendChild(span);
        }
        document.getElementById('seq-0').style.color = '#fff';

        ['key-up','key-down','key-left','key-right'].forEach(id => {
            const btn = document.getElementById(id);
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            const dir = id.replace('key-', '');
            const keyName = dir.charAt(0).toUpperCase() + dir.slice(1);
            bindTouch(newBtn, () => this.check(keyName, newBtn));
        });
    },
    check: function(key, btnEl) {
        btnEl.classList.add('active');
        setTimeout(() => btnEl.classList.remove('active'), 100);

        if(key === this.seq[this.idx]) {
            playSound('blip');
            document.getElementById(`seq-${this.idx}`).style.color = 'var(--success)';
            this.idx++;
            if(this.idx >= this.seq.length) game.success();
            else document.getElementById(`seq-${this.idx}`).style.color = '#fff';
        } else {
            game.fail("Erreur !");
        }
    }
};

// 3. TIMING (Sniper)
const qteTiming = {
    el: document.getElementById('qte-timing'),
    cursor: document.getElementById('timing-cursor'),
    target: document.getElementById('timing-target'),
    btn: document.getElementById('timing-btn'),
    pos: 0, dir: 1, speed: 1, targetLeft: 0, targetW: 15,
    init: function (c) {
        this.el.style.display = 'flex';
        this.pos = 0; this.dir = 1; this.speed = c.speed;
        this.targetLeft = 20 + Math.random() * 60;
        this.target.style.left = `${this.targetLeft}%`;
        this.target.style.width = `${this.targetW}%`;
        this.btn.replaceWith(this.btn.cloneNode(true));
        this.btn = document.getElementById('timing-btn');
        bindTouch(this.btn, () => this.stop());
        this.loop();
    },
    loop: function () {
        if (!game.isRunning || game.currentType !== 'timing') return;
        this.pos += this.speed * this.dir;
        if (this.pos >= 100 || this.pos <= 0) this.dir *= -1;
        this.cursor.style.left = `${this.pos}%`;
        game.animationFrame = requestAnimationFrame(() => this.loop());
    },
    stop: function () {
        if (!game.isRunning) return;
        if (this.pos >= this.targetLeft && this.pos <= (this.targetLeft + this.targetW)) game.success();
        else game.fail("Raté !");
    }
};

// 4. REFLEX (Whack-a-mole) - OPTIMIZED
const qteReflex = {
    el: document.getElementById('qte-reflex'),
    container: document.getElementById('reflex-container'),
    left: 0,
    init: function (c) {
        this.el.style.display = 'flex'; // Use Flex to center content
        this.left = c.count;
        this.container.innerHTML = '';
        for(let i=0; i<9; i++) {
            const cell = document.createElement('div');
            cell.className = 'reflex-cell';
            bindTouch(cell, () => this.hit(cell));
            this.container.appendChild(cell);
        }
        this.spawn();
    },
    spawn: function () {
        document.querySelectorAll('.reflex-target').forEach(e => e.classList.remove('reflex-target'));
        const cells = document.querySelectorAll('.reflex-cell');
        cells[Math.floor(Math.random()*cells.length)].classList.add('reflex-target');
        playSound('blip');
    },
    hit: function (el) {
        if (el.classList.contains('reflex-target')) {
            this.left--;
            if (this.left <= 0) game.success();
            else this.spawn();
        } else {
            game.fail("Mauvaise cible !");
        }
    }
};

// 5. HOLD (Stabilize)
const qteHold = {
    el: document.getElementById('qte-hold'),
    btn: document.getElementById('hold-btn'),
    fill: document.getElementById('hold-gauge-fill'),
    zone: document.getElementById('hold-target-zone'),
    level: 0, holding: false, heldTime: 0, needed: 0,
    min: 60, max: 80,
    init: function (c) {
        this.el.style.display = 'flex';
        this.level = 0; this.heldTime = 0; this.needed = c.duration; this.holding = false;
        this.zone.style.bottom = `${this.min}%`;
        this.zone.style.height = `${this.max - this.min}%`;

        this.btn.replaceWith(this.btn.cloneNode(true));
        this.btn = document.getElementById('hold-btn');

        this.btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.startHold(); }, { passive: false });
        this.btn.addEventListener('touchend', (e) => { e.preventDefault(); this.endHold(); });
        this.btn.addEventListener('mousedown', () => this.startHold());
        this.btn.addEventListener('mouseup', () => this.endHold());
        this.btn.addEventListener('mouseleave', () => this.endHold());

        this.loop();
    },
    startHold: function() { this.holding = true; this.btn.classList.add('holding'); },
    endHold: function() { this.holding = false; this.btn.classList.remove('holding'); },

    loop: function () {
        if (!game.isRunning || game.currentType !== 'hold') return;
        this.level += this.holding ? 1.5 : -1.0;
        if(this.level < 0) this.level = 0; if(this.level > 100) this.level = 100;
        this.fill.style.height = `${this.level}%`;

        if (this.level >= this.min && this.level <= this.max) {
            this.fill.style.background = 'var(--success)';
            this.heldTime += 16;
        } else {
            this.fill.style.background = this.level > this.max ? 'var(--danger)' : 'var(--primary)';
        }
        if (this.heldTime >= this.needed) game.success();
        else game.animationFrame = requestAnimationFrame(() => this.loop());
    }
};

const failBtn = document.querySelector('#game-over-screen button');
if (failBtn) {
    failBtn.addEventListener('click', () => game.exit(false));
}

const winBtn = document.querySelector('#win-screen button');
if (winBtn) {
    winBtn.addEventListener('click', () => game.exit(true));
}
