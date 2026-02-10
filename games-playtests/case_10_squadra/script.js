// --- GAME ENGINE ---
const game = {
    state: {
        phase: 'INTRO',
        difficulty: 'NORMAL',
        hp: 100,
        enemyHp: 100,
        combo: 0,
        turn: 'IDLE', // IDLE, AIMING, ENEMY_CHARGING, ENEMY_ATTACKING
        cursorPos: 0,
        cursorDir: 1,
        qteTargets: [],
        qteNext: 1
    },

    elements: {},
    loops: { cursor: null, particle: null, qte: null },

    init: function() {
        // Cache DOM elements
        const ids = ['intro-screen', 'story-screen', 'choice-screen', 'combat-screen', 'end-screen', 'tutorial-overlay',
                     'story-text-container', 'story-dots', 'flash-overlay', 'game-container',
                     'player-hp', 'enemy-hp-fill', 'support-badge', 'messages-layer', 'qte-layer',
                     'btn-assault', 'precision-bar', 'state-defense', 'state-waiting', 'p-cursor',
                     'alert-box', 'enemy-visual', 'end-title', 'end-msg', 'end-btn', 'end-icon'];
        ids.forEach(id => this.elements[id] = document.getElementById(id));

        // Start Particles
        this.initParticles();
    },

    setPhase: function(phaseName) {
        this.state.phase = phaseName;
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));

        if(phaseName === 'INTRO') this.elements['intro-screen'].classList.add('active');
        if(phaseName === 'STORY') this.elements['story-screen'].classList.add('active');
        if(phaseName === 'CHOICE') this.elements['choice-screen'].classList.add('active');
        if(phaseName === 'COMBAT') this.elements['combat-screen'].classList.add('active');
        if(phaseName === 'END') this.elements['end-screen'].classList.add('active');
    },

    // --- NARRATION ---
    storySlides: [
        { t: "Place Padoue. Début de soirée.", s: "Le bruit régulier du métal, des pas et des souffles fatigués rythme l’endroit." },
        { t: "A Piazza à u Duca", s: "Des silhouettes courbées déplacent des caisses. D'autres rincent des outils, le regard vide." },
        { t: "La Menace", s: "Trois gardes de la Squadra d’Arozza surveillent la scène. Immobiles. L’arme en évidence." },
        { t: "Le Choix", s: "Vous devez récupérer des informations. Mais attention à qui vous parlez..." }
    ],
    storyIndex: 0,

    goToStory: function() {
        this.storyIndex = 0;
        this.setPhase('STORY');
        this.renderStory();
    },

    renderStory: function() {
        const slide = this.storySlides[this.storyIndex];
        this.elements['story-text-container'].innerHTML = `
            <div class="animate-fadeIn">
                <h2 style="color:var(--accent-red); border-left:4px solid var(--accent-red); padding-left:1rem; margin-bottom:1rem; text-transform:uppercase;">${slide.t}</h2>
                <p class="typewriter">${slide.s}</p>
            </div>
        `;
        this.elements['story-dots'].innerHTML = this.storySlides.map((_, i) =>
            `<div class="dot ${i === this.storyIndex ? 'active' : ''}"></div>`
        ).join('');
    },

    advanceStory: function() {
        if(this.storyIndex < this.storySlides.length - 1) {
            this.storyIndex++;
            this.renderStory();
        } else {
            this.setPhase('CHOICE');
        }
    },

    // --- COMBAT SETUP ---
    initCombat: function(mode) {
        this.state.difficulty = mode;
        this.state.hp = 100;
        this.state.enemyHp = mode === 'HARD' ? 150 : 100;
        this.state.combo = 0;
        this.state.turn = 'IDLE';

        this.updateHud();
        this.elements['support-badge'].style.display = mode === 'NORMAL' ? 'block' : 'none';

        this.elements['tutorial-overlay'].classList.add('active');
    },

    startCombat: function() {
        this.elements['tutorial-overlay'].classList.remove('active');
        this.setPhase('COMBAT');
        this.setTurnState('IDLE');
    },

    updateHud: function() {
        this.elements['player-hp'].innerText = Math.ceil(this.state.hp);
        this.elements['player-hp'].classList.toggle('hp-low', this.state.hp < 30);

        // Enemy HP Bar
        const maxHp = this.state.difficulty === 'HARD' ? 150 : 100;
        const pct = Math.max(0, (this.state.enemyHp / maxHp) * 100);
        this.elements['enemy-hp-fill'].style.width = pct + '%';
    },

    setTurnState: function(state) {
        this.state.turn = state;

        // Toggle UI Elements
        this.elements['btn-assault'].classList.toggle('active', state === 'IDLE');
        this.elements['precision-bar'].classList.toggle('active', state === 'AIMING');
        this.elements['state-defense'].classList.toggle('active', state === 'ENEMY_ATTACKING');
        this.elements['state-waiting'].style.display = state === 'ENEMY_CHARGING' ? 'flex' : 'none';

        // Effects
        this.elements['alert-box'].style.opacity = state === 'ENEMY_ATTACKING' ? 1 : 0;
        if(state === 'ENEMY_ATTACKING') this.elements['enemy-visual'].classList.add('attacking');
        else this.elements['enemy-visual'].classList.remove('attacking');

        if(state === 'AIMING') this.startCursorLoop();
        else this.stopCursorLoop();
    },

    // --- PLAYER ATTACK ---
    startAiming: function(e) {
        if(e && e.cancelable) e.preventDefault();
        if(this.state.turn === 'IDLE') this.setTurnState('AIMING');
    },

    startCursorLoop: function() {
        if(this.loops.cursor) cancelAnimationFrame(this.loops.cursor);
        this.state.cursorPos = 0;
        this.state.cursorDir = 1;

        const loop = () => {
            let speed = 1.5 + (this.state.combo * 0.2);
            this.state.cursorPos += speed * this.state.cursorDir;

            if(this.state.cursorPos >= 100 || this.state.cursorPos <= 0) {
                this.state.cursorDir *= -1;
                this.state.cursorPos = Math.max(0, Math.min(100, this.state.cursorPos));
            }

            this.elements['p-cursor'].style.left = this.state.cursorPos + '%';

            if(this.state.turn === 'AIMING') {
                this.loops.cursor = requestAnimationFrame(loop);
            }
        };
        loop();
    },

    stopCursorLoop: function() {
        if(this.loops.cursor) cancelAnimationFrame(this.loops.cursor);
    },

    executeAttack: function(e) {
        if(e && e.cancelable) e.preventDefault();
        if(this.state.turn !== 'AIMING') return;

        const pos = this.state.cursorPos;
        let dmg = 0;

        if(pos >= 45 && pos <= 55) {
            dmg = 25 + (this.state.combo * 3);
            this.spawnMsg("CRITIQUE!", 'crit');
            this.shakeScreen();
            this.state.combo++;
        } else if(pos >= 25 && pos <= 75) {
            dmg = 12;
            this.spawnMsg("TOUCHÉ", 'hit');
        } else {
            this.spawnMsg("RATÉ", 'miss');
            this.state.combo = 0;
        }

        if(dmg > 0) {
            this.state.enemyHp -= dmg;
            this.updateHud();

            if(this.state.difficulty === 'NORMAL') {
                setTimeout(() => {
                    this.state.enemyHp -= 5;
                    this.updateHud();
                    this.spawnMsg("+5 ALLIÉ", 'ally');
                }, 200);
            }
        }

        if(this.state.enemyHp <= 0) {
            setTimeout(() => this.endGame(true), 500);
        } else {
            this.setTurnState('ENEMY_CHARGING');
            setTimeout(() => this.startEnemyPhase(), 800);
        }
    },

    // --- ENEMY PHASE (QTE) ---
    startEnemyPhase: function() {
        this.setTurnState('ENEMY_ATTACKING');
        this.elements['qte-layer'].innerHTML = '';

        // Targets centered in upper area
        const targets = [
            {id: 1, x: 20 + Math.random()*20, y: 15 + Math.random()*15},
            {id: 2, x: 50 + Math.random()*10, y: 25 + Math.random()*15},
            {id: 3, x: 70 + Math.random()*10, y: 15 + Math.random()*15}
        ];

        this.state.qteNext = 1;

        targets.forEach(t => {
            const el = document.createElement('div');
            el.className = 'qte-target';
            if(t.id === 1) el.classList.add('active');
            el.innerText = t.id;
            el.style.left = t.x + '%';
            el.style.top = t.y + '%';

            const tapHandler = (e) => {
                if(e.cancelable) e.preventDefault();
                this.handleQte(t.id, el);
            };
            el.addEventListener('touchstart', tapHandler, {passive: false});
            el.addEventListener('mousedown', tapHandler);

            this.elements['qte-layer'].appendChild(el);
        });

        if(this.loops.qte) clearTimeout(this.loops.qte);
        this.loops.qte = setTimeout(() => this.resolveDefense(false), 2500);
    },

    handleQte: function(id, el) {
        if(this.state.turn !== 'ENEMY_ATTACKING') return;

        if(id === this.state.qteNext) {
            el.classList.add('hit');
            this.state.qteNext++;

            const targets = document.querySelectorAll('.qte-target');
            targets.forEach(t => {
                if(parseInt(t.innerText) === this.state.qteNext) t.classList.add('active');
            });

            if(id === 3) {
                clearTimeout(this.loops.qte);
                this.resolveDefense(true);
            }
        } else {
            this.shakeScreen();
        }
    },

    resolveDefense: function(success) {
        this.elements['qte-layer'].innerHTML = '';

        if(success) {
            this.spawnMsg("PARADE!", 'crit');
            this.flashScreen();
            this.shakeScreen();
            this.state.enemyHp = Math.max(0, this.state.enemyHp - 15);
            this.updateHud();
        } else {
            const dmg = this.state.difficulty === 'HARD' ? 25 : 15;
            this.state.hp -= dmg;
            this.updateHud();
            this.spawnMsg(`-${dmg} HP`, 'miss');
            this.shakeScreen();
        }

        if(this.state.hp <= 0) {
            setTimeout(() => this.endGame(false), 500);
        } else if (this.state.enemyHp <= 0) {
            setTimeout(() => this.endGame(true), 500);
        } else {
            setTimeout(() => this.setTurnState('IDLE'), 800);
        }
    },

    // --- END GAME ---
    endGame: function(victory) {
        this.setPhase('END');
        if(victory) {
            this.elements['end-title'].innerText = "ZONE SÉCURISÉE";
            this.elements['end-title'].style.color = "#fff";
            this.elements['end-msg'].innerText = "Le chemin vers Pascal Paoli est libre.";
            this.elements['end-btn'].innerText = "CONTINUER";
            this.elements['end-btn'].onclick = () => {
                if (window.finishGame) {
                    window.finishGame(true);
                }
            };
            this.elements['end-icon'].innerHTML = `<svg class="icon-xl" style="color:var(--accent-green);" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`;
        } else {
            this.elements['end-title'].innerText = "DÉSYNCHRONISATION";
            this.elements['end-title'].style.color = "var(--accent-red)";
            this.elements['end-msg'].innerText = "Sujet critique. Mémoire instable.";
            this.elements['end-btn'].innerText = "RECHARGER";
            this.elements['end-btn'].onclick = () => {
                if (window.finishGame) {
                    window.finishGame(false);
                }
            };
            this.elements['end-icon'].innerHTML = `<svg class="icon-xl animate-pulse" style="color:var(--accent-red);" viewBox="0 0 24 24"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`;
        }
    },

    // --- VFX ---
    spawnMsg: function(text, type) {
        const el = document.createElement('div');
        el.className = 'msg-float';
        el.innerText = text;

        if(type === 'crit') el.style.color = 'var(--accent-yellow)';
        else if(type === 'hit') el.style.color = '#fff';
        else if(type === 'ally') el.style.color = 'var(--accent-green)';
        else el.style.color = 'var(--accent-red)';

        this.elements['messages-layer'].appendChild(el);
        setTimeout(() => el.remove(), 600);
    },

    shakeScreen: function() {
        this.elements['game-container'].classList.add('shake');
        setTimeout(() => this.elements['game-container'].classList.remove('shake'), 400);
    },

    flashScreen: function() {
        this.elements['flash-overlay'].style.opacity = 0.5;
        setTimeout(() => this.elements['flash-overlay'].style.opacity = 0, 100);
    },

    initParticles: function() {
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();

        const pArray = Array.from({length: 40}, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1,
            op: Math.random() * 0.5
        }));

        const animate = () => {
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.fillStyle = '#ece4cb';
            pArray.forEach(p => {
                p.y -= p.speed;
                if(p.y < 0) p.y = canvas.height;
                ctx.globalAlpha = p.op;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
};

// Start
window.onload = () => game.init();
