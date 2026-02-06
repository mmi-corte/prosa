const apiKey = ""; // API Key auto-injected

const game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: null,
    dpr: window.devicePixelRatio || 1, // Retina support

    conf: {
        totalDist: 1200,
        speedBase: 6,
        spawnRate: 40 // Frames
    },

    state: {
        active: false,
        ended: false,
        distance: 0,
        alert: 0,
        frame: 0,
        shake: 0,
        boat: { x: 0.5, targetX: 0.5, yRatio: 0.8, tilt: 0 }, // x is 0-1 ratio
        lights: [],
        obstacles: [],
        particles: [],
        rain: [],
        flash: 0 // Lightning
    },

    init() {
        this.ctx = this.canvas.getContext('2d');

        // Resize & Retina setup
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.canvas.width = w * this.dpr;
            this.canvas.height = h * this.dpr;
            this.canvas.style.width = `${w}px`;
            this.canvas.style.height = `${h}px`;
            this.ctx.scale(this.dpr, this.dpr);
            this.width = w;
            this.height = h;
        };
        window.addEventListener('resize', resize);
        resize();

        // Inputs Tactiles & Souris Unifies
        const handleInput = (x) => {
            if (!this.state.active || this.state.ended) return;
            // Conversion pixel -> ratio 0-1
            let ratio = x / this.width;
            this.state.boat.targetX = Math.max(0.05, Math.min(0.95, ratio));
        };

        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            handleInput(e.touches[0].clientX);
        }, { passive: false });

        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            handleInput(e.touches[0].clientX);
        }, { passive: false });

        this.canvas.addEventListener('mousemove', e => {
            handleInput(e.clientX);
        });

        // Loop demarrage fond
        this.loop();
    },

    start() {
        document.getElementById('modal-start').classList.remove('active');
        document.getElementById('tutorial-ui').style.opacity = '1';

        this.state = {
            active: true,
            ended: false,
            distance: this.conf.totalDist,
            alert: 0,
            frame: 0,
            shake: 0,
            boat: { x: 0.5, targetX: 0.5, yRatio: 0.85, tilt: 0 },
            // UNE SEULE LUMIERE, balayage large
            lights: [
                { xRatio: 0.5, phase: 0, speed: 0.012, on: true, opacity: 1, timer: 180 }
            ],
            obstacles: [],
            particles: [],
            rain: Array(50).fill().map(() => ({ 
                x: Math.random(), 
                y: Math.random(), 
                speed: 15 + Math.random() * 10 
            })),
            flash: 0
        };

        // Cache tuto apres 3s
        setTimeout(() => {
            document.getElementById('tutorial-ui').style.opacity = '0';
        }, 3500);
    },

    update() {
        const s = this.state;
        const w = this.width;
        const h = this.height;

        s.frame++;
        s.distance -= (this.conf.speedBase / 10); // Progression

        // --- BATEAU (Lissage mouvement) ---
        const boatSpeed = 0.1;
        s.boat.x += (s.boat.targetX - s.boat.x) * boatSpeed;
        s.boat.tilt = (s.boat.targetX - s.boat.x) * -40; // Inclinaison

        // --- OBSTACLES ---
        if (s.frame % this.conf.spawnRate === 0) {
            const type = Math.random() > 0.65 ? 'mine' : 'rock';
            s.obstacles.push({
                xRatio: 0.1 + Math.random() * 0.8,
                y: -100,
                type: type,
                rot: Math.random() * Math.PI,
                size: type === 'mine' ? 20 : 35
            });
        }

        for (let i = s.obstacles.length - 1; i >= 0; i--) {
            let o = s.obstacles[i];
            o.y += this.conf.speedBase;
            o.rot += 0.02;

            // Collision (Hitbox circulaire simple)
            const boatPx = s.boat.x * w;
            const boatPy = s.boat.yRatio * h;
            const obsPx = o.xRatio * w;

            const dx = boatPx - obsPx;
            const dy = boatPy - o.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < (20 + o.size)) {
                this.hit(o.type === 'mine' ? 30 : 15);
                s.obstacles.splice(i, 1);
                continue;
            }

            if (o.y > h + 50) s.obstacles.splice(i, 1);
        }

        // --- LUMIERES (Logique ON/OFF) ---
        s.lights.forEach(l => {
            l.phase += l.speed;
            // Balayage LARGE (0.4 de chaque cote = 80% ecran)
            const sweep = Math.sin(l.phase) * 0.4;
            l.currentXRatio = 0.5 + sweep;

            // Cycle Timer
            l.timer--;
            if (l.timer <= 0) {
                l.on = !l.on;
                // Temps aleatoire ON/OFF
                l.timer = l.on ? (180 + Math.random()*120) : (80 + Math.random()*80);
            }

            // Transition Opacite
            const target = l.on ? 1 : 0;
            l.opacity += (target - l.opacity) * 0.05;

            // Detection
            if (l.opacity > 0.2) {
                const lightX = l.currentXRatio * w;
                const boatX = s.boat.x * w;
                // Rayon de detection large qui correspond visuellement au faisceau
                if (Math.abs(lightX - boatX) < (120 + (l.opacity * 20))) {
                    s.alert += 0.5 * l.opacity;
                }
            }
        });

        // --- ALERTE ---
        s.alert = Math.max(0, Math.min(100, s.alert - 0.05)); // Baisse naturelle lente
        if (s.alert >= 100) this.end(false, "Repéré par les gardes !");
        if (s.distance <= 0) this.end(true, "Terre atteinte !");

        // --- EFFETS ---
        // Pluie
        s.rain.forEach(r => {
            r.y += r.speed / h; // ratio movement
            r.x -= 0.002; // vent
            if (r.y > 1) { r.y = -0.1; r.x = Math.random(); }
        });

        // Eclairs
        if (Math.random() > 0.995) s.flash = 10;
        if (s.flash > 0) s.flash--;

        // Shake decay
        if (s.shake > 0) s.shake *= 0.9;
    },

    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.state;

        ctx.clearRect(0, 0, w, h);

        // -- Shake Camera --
        ctx.save();
        if (s.shake > 0.5) {
            ctx.translate((Math.random()-0.5)*s.shake, (Math.random()-0.5)*s.shake);
        }

        // 1. Ocean & Vagues
        const seaGrad = ctx.createLinearGradient(0, 0, 0, h);
        seaGrad.addColorStop(0, '#080808');
        seaGrad.addColorStop(1, '#1a1d21');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(0, 0, w, h);

        // Vagues
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        const waveOffset = (s.frame * this.conf.speedBase) % 100;
        for (let y = -100; y < h + 100; y+=80) {
            const vy = y + waveOffset;
            ctx.beginPath();
            ctx.moveTo(0, vy);
            ctx.bezierCurveTo(w/3, vy-20, w*2/3, vy+20, w, vy);
            ctx.stroke();
        }

        // 2. Sillage
        if (s.active && s.frame % 3 === 0) {
            s.particles.push({x: s.boat.x, y: s.boat.yRatio, age: 1});
        }
        ctx.fillStyle = 'rgba(129, 203, 214, 0.3)';
        for (let i = s.particles.length-1; i>=0; i--) {
            let p = s.particles[i];
            p.y += 0.01;
            p.age -= 0.03;
            if (p.age <= 0) s.particles.splice(i,1);
            else {
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, 2 + (1-p.age)*10, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // 3. Obstacles
        s.obstacles.forEach(o => {
            const ox = o.xRatio * w;
            ctx.save();
            ctx.translate(ox, o.y);
            ctx.rotate(o.rot);

            if (o.type === 'mine') {
                ctx.fillStyle = '#222';
                ctx.beginPath(); ctx.arc(0,0, o.size/2, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
                for(let k=0; k<4; k++) { ctx.rotate(Math.PI/2); ctx.beginPath(); ctx.moveTo(0, o.size/2); ctx.lineTo(0, o.size); ctx.stroke(); }
                ctx.fillStyle = (Math.floor(s.frame/10)%2===0) ? '#ff0000' : '#440000';
                ctx.beginPath(); ctx.arc(0,0, 4, 0, Math.PI*2); ctx.fill();
            } else {
                ctx.fillStyle = '#3a3830';
                ctx.beginPath();
                ctx.moveTo(-o.size/2, -o.size/3);
                ctx.lineTo(o.size/2, -o.size/4);
                ctx.lineTo(o.size/3, o.size/2);
                ctx.lineTo(-o.size/2, o.size/3);
                ctx.fill();
            }
            ctx.restore();
        });

        // 4. Bateau (Joueur)
        const bx = s.boat.x * w;
        const by = s.boat.yRatio * h;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(s.boat.tilt * Math.PI / 180);

        ctx.fillStyle = '#111';
        ctx.shadowBlur = 20; ctx.shadowColor = 'black';
        ctx.beginPath(); ctx.ellipse(0, 0, 15, 40, 0, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ece4cb'; ctx.beginPath(); ctx.arc(0, 10, 6, 0, Math.PI*2); ctx.fill(); // Joueur
        ctx.fillStyle = '#626247'; ctx.beginPath(); ctx.arc(0, -15, 9, 0, Math.PI*2); ctx.fill(); // Orcu

        ctx.restore();

        // 5. Projecteurs (REWORKED FOR VISIBILITY)
        ctx.save();
        s.lights.forEach(l => {
            if (l.opacity <= 0.01) return;
            const lx = l.currentXRatio * w;

            const isDanger = Math.abs(lx - bx) < 120;
            const r = isDanger ? 255 : 255;
            const g = isDanger ? 50 : 255;
            const b = isDanger ? 50 : 200;

            // Core Beam (Opaque & Visible)
            // Utilisation de source-over pour etre sur que ca peint par dessus l'eau sombre
            ctx.globalCompositeOperation = 'source-over';

            const beamGrad = ctx.createLinearGradient(0, -100, 0, h);
            beamGrad.addColorStop(0, `rgba(${r},${g},${b}, ${l.opacity * 0.9})`); // Quasi opaque en haut
            beamGrad.addColorStop(0.8, `rgba(${r},${g},${b}, ${l.opacity * 0.2})`);
            beamGrad.addColorStop(1, `rgba(${r},${g},${b}, 0)`);

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(lx, -100);
            ctx.lineTo(lx + w*0.45, h + 100); // Tres large en bas
            ctx.lineTo(lx - w*0.45, h + 100);
            ctx.fill();

            // Bordures nettes (Traits de lumiere)
            ctx.strokeStyle = `rgba(${r},${g},${b}, ${l.opacity * 0.6})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lx, -50);
            ctx.lineTo(lx + w*0.45, h + 100);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(lx, -50);
            ctx.lineTo(lx - w*0.45, h + 100);
            ctx.stroke();

            // Halo a la source
            ctx.globalCompositeOperation = 'screen';
            const glare = ctx.createRadialGradient(lx, 0, 0, lx, 0, 200);
            glare.addColorStop(0, `rgba(255,255,255, ${l.opacity})`);
            glare.addColorStop(1, 'rgba(255,255,255, 0)');
            ctx.fillStyle = glare;
            ctx.beginPath();
            ctx.arc(lx, 0, 200, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.restore();

        // 6. Eclairs
        if (s.flash > 0) {
            ctx.fillStyle = `rgba(255,255,255, ${s.flash/20})`;
            ctx.fillRect(0,0,w,h);
        }

        // 7. Pluie
        ctx.strokeStyle = 'rgba(200,200,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        s.rain.forEach(r => {
            const rx = r.x * w;
            const ry = r.y * h;
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 5, ry + 15);
        });
        ctx.stroke();

        ctx.restore(); // Fin Shake

        this.updateUI();
    },

    updateUI() {
        if (!this.state.active) return;
        const distEl = document.getElementById('dist-txt');
        const barEl = document.getElementById('alert-bar');

        const d = Math.max(0, Math.floor(this.state.distance));
        distEl.innerText = d + "m";

        const pct = this.state.alert;
        barEl.style.width = pct + "%";

        if (pct > 80 && this.state.frame % 10 < 5) {
            barEl.style.backgroundColor = '#fff';
        } else {
            barEl.style.backgroundColor = '#c63032';
        }
    },

    hit(dmg) {
        this.state.alert += dmg;
        this.state.shake = 20;

        const flash = document.getElementById('damage-overlay');
        flash.style.opacity = 0.6;
        setTimeout(() => flash.style.opacity = 0, 150);

        if (navigator.vibrate) navigator.vibrate(200);
    },

    loop() {
        if (this.state.active && !this.state.ended) {
            this.update();
        }
        this.draw();
        requestAnimationFrame(() => this.loop());
    },

    async end(win, reason) {
        this.state.ended = true;
        const modal = document.getElementById('modal-end');
        modal.classList.add('active');

        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-msg');
        const poem = document.getElementById('end-poem');

        if (win) {
            title.innerText = "TRIOMPHE";
            title.style.color = "#81cbd6";
            msg.innerText = "L'ombre de l'Orcu vous a caché aux yeux de l'ennemi. Prosa est atteinte.";
        } else {
            title.innerText = "CAPTIVÉ";
            title.style.color = "#c63032";
            msg.innerText = reason;
        }

        poem.innerText = "L'Orcu écoute...";

        // Notify parent app after a short delay
        setTimeout(() => {
            if (window.finishGame) {
                window.finishGame(win);
            }
        }, 2000);

        if (apiKey) {
            try {
                const prompt = `Contexte: Jeu mobile aventure corse sombre. Issue: ${win ? 'Victoire' : 'Défaite'}. Génère un quatrain mystique en français.`;
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if(text) poem.innerText = text;
            } catch(e) { poem.innerText = "Le vent emporte les mots..."; }
        }
    }
};

window.onload = () => game.init();
