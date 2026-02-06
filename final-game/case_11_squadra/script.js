import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Hammer, Shovel, Users, Shield, Sword, Skull, Target, ChevronRight, Play, SkipForward } from 'lucide-react';
import './styles.css';

// --- COMPOSANT PARTICULES ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    const particles = Array.from({length: 40}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2, speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5
    }));

    const render = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#ece4cb';
      particles.forEach(p => {
        p.y -= p.speed; if(p.y < 0) p.y = canvas.height;
        ctx.globalAlpha = p.opacity; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      });
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frameId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen" />;
};

// --- DATA NARRATION ---
const STORY_SLIDES = [
  {
    text: "Place Padoue. Début de soirée.",
    sub: "Le bruit régulier du métal, des pas et des souffles fatigués rythme l’endroit."
  },
  {
    text: "A Piazza à u Duca",
    sub: "Des silhouettes courbées déplacent des caisses. D'autres rincent des outils, le regard vide."
  },
  {
    text: "La Menace",
    sub: "Trois gardes de la Squadra d’Arozza (Les Revenants) surveillent la scène. Immobiles. L’arme en évidence."
  },
  {
    text: "Le Choix",
    sub: "Vous devez récupérer des informations. Mais attention à qui vous parlez..."
  }
];

function App() {
  // Phases: INTRO -> STORY -> CHOICE -> COMBAT -> END
  const [phase, setPhase] = useState('INTRO');
  const [storyIndex, setStoryIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('NORMAL');
  const [showTutorial, setShowTutorial] = useState(false);

  // Stats
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [combo, setCombo] = useState(0);

  // Combat Logic
  const [turnState, setTurnState] = useState('PLAYER_IDLE');
  const turnStateRef = useRef('PLAYER_IDLE');
  const [qteTargets, setQteTargets] = useState([]);
  const [qteNextIndex, setQteNextIndex] = useState(1);
  const qteTimerRef = useRef(null);
  const [cursorPos, setCursorPos] = useState(0);
  const [cursorDir, setCursorDir] = useState(1);
  const requestRef = useRef();

  // UX
  const [messages, setMessages] = useState([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => { turnStateRef.current = turnState; }, [turnState]);

  // --- HELPERS ---
  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 300); };
  const addMessage = (text, type) => {
    const id = Date.now();
    setMessages(prev => [...prev, {id, text, type}]);
    setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 800);
  };
  const handleTouch = (cb, arg) => (e) => {
    if(e.cancelable && e.type === 'touchstart') e.preventDefault();
    e.stopPropagation(); cb(arg);
  };

  // --- NARRATION LOGIC ---
  const advanceStory = () => {
    if (storyIndex < STORY_SLIDES.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else {
      setPhase('CHOICE');
    }
  };

  // --- COMBAT LOOP ---
  const updateCursor = useCallback(() => {
    if (turnStateRef.current === 'PLAYER_AIMING') {
      setCursorPos(prev => {
        let next = prev + (1.5 + combo * 0.2) * cursorDir;
        if (next >= 100 || next <= 0) { setCursorDir(d => -d); next = next >= 100 ? 100 : 0; }
        return next;
      });
      requestRef.current = requestAnimationFrame(updateCursor);
    }
  }, [cursorDir, combo]);

  useEffect(() => {
    if (turnState === 'PLAYER_AIMING') requestRef.current = requestAnimationFrame(updateCursor);
    else cancelAnimationFrame(requestRef.current);
    return () => cancelAnimationFrame(requestRef.current);
  }, [turnState, updateCursor]);

  // --- COMBAT ACTIONS ---
  const initCombat = (mode) => {
    setDifficulty(mode); setPlayerHp(100); setEnemyHp(mode === 'HARD' ? 150 : 100);
    setTurnState('PLAYER_IDLE'); setCombo(0); setShowTutorial(true);
  };

  const startCombat = () => { setShowTutorial(false); setPhase('COMBAT'); };

  const playerAttack = () => {
    if(turnStateRef.current !== 'PLAYER_AIMING') return;
    const pos = cursorPos; let dmg = 0;

    if(pos >= 45 && pos <= 55) { dmg = 25 + combo*3; addMessage("CRITIQUE!", 'crit'); setCombo(c=>c+1); triggerShake(); }
    else if(pos >= 25 && pos <= 75) { dmg = 12; addMessage("TOUCHÉ", 'hit'); }
    else { addMessage("RATÉ", 'miss'); setCombo(0); }

    if(dmg > 0) {
      setEnemyHp(h => {
        const next = h - dmg;
        if(next <= 0) setTimeout(() => setPhase('VICTORY'), 500);
        return next;
      });
      if(difficulty === 'NORMAL' && dmg > 0) setTimeout(() => { setEnemyHp(h=>Math.max(0, h-5)); addMessage("+5 ALLIÉ", 'ally'); }, 200);
    }
    setTurnState('ENEMY_CHARGING');
    setTimeout(() => { if(enemyHp > 0) startEnemyPhase(); }, 800);
  };

  const startEnemyPhase = () => {
    setTurnState('ENEMY_ATTACKING');
    // Cibles centrées dans la zone haute (Arena) pour éviter le bas
    const targets = [
      { id: 1, x: 20 + Math.random()*20, y: 20 + Math.random()*20, hit: false },
      { id: 2, x: 50 + Math.random()*10, y: 30 + Math.random()*20, hit: false },
      { id: 3, x: 70 + Math.random()*10, y: 20 + Math.random()*20, hit: false }
    ];
    setQteTargets(targets); setQteNextIndex(1);
    if(qteTimerRef.current) clearTimeout(qteTimerRef.current);
    qteTimerRef.current = setTimeout(() => resolveDefense(false), 2500);
  };

  const tapQte = (id) => {
    if(turnStateRef.current !== 'ENEMY_ATTACKING') return;
    if(id === qteNextIndex) {
      setQteTargets(prev => prev.map(t => t.id === id ? {...t, hit: true} : t));
      if(id === 3) { if(qteTimerRef.current) clearTimeout(qteTimerRef.current); resolveDefense(true); }
      else setQteNextIndex(prev => prev + 1);
    } else triggerShake();
  };

  const resolveDefense = (success) => {
    setQteTargets([]);
    if(success) { addMessage("PARADE!", 'crit'); setEnemyHp(h=>Math.max(0, h-15)); setFlash(true); setTimeout(()=>setFlash(false), 100); }
    else {
      const dmg = difficulty === 'HARD' ? 25 : 15;
      setPlayerHp(h => { const next = h-dmg; if(next<=0) setTimeout(()=>setPhase('GAMEOVER'), 500); return next; });
      addMessage(`-${dmg} HP`, 'miss'); triggerShake();
    }
    setTimeout(() => { if(playerHp > 0) setTurnState('PLAYER_IDLE'); }, 800);
  };

  // --- RENDER ---
  return (
    <div className={`game-container ${phase === 'VICTORY' ? 'bg-[#0a120a]' : ''} ${shake ? 'shake-screen' : ''}`}>
      <div className="scanlines"></div><div className="vignette"></div><div className="noise"></div>
      {flash && <div className="absolute inset-0 bg-white z-[100] opacity-50 pointer-events-none"></div>}

      {/* 1. INTRO SCREEN */}
      {phase === 'INTRO' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 animate-fadeIn">
          <ParticleBackground />
          <div className="border-y-2 border-[#c63032] py-8 mb-8 w-full max-w-md bg-black/50 backdrop-blur-sm">
            <p className="text-[#9a9680] text-sm uppercase tracking-[0.3em] mb-4">Séquence Mémorielle 11</p>
            <h1 className="text-6xl font-bold text-white mb-2 uppercase tracking-tighter leading-none">Piazza</h1>
            <h2 className="text-4xl text-[#c63032] uppercase font-light tracking-widest">à u Duca</h2>
          </div>
          <button onTouchStart={handleTouch(() => setPhase('STORY'))} onClick={() => setPhase('STORY')}
            className="btn-action px-12 py-6 text-xl font-bold flex items-center gap-3 animate-pulse">
            <Play size={24} /> COMMENCER
          </button>
        </div>
      )}

      {/* 2. STORY MODE (NARRATION) */}
      {phase === 'STORY' && (
        <div className="flex-1 flex flex-col relative z-10" onTouchStart={handleTouch(advanceStory)} onClick={advanceStory}>
          <ParticleBackground />
          <div className="absolute top-8 right-8 text-xs text-[#555] uppercase tracking-widest">Appuyer pour continuer &gt;&gt;</div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto w-full">
            <div key={storyIndex} className="animate-fadeIn">
              <h2 className="text-3xl text-[#c63032] font-bold uppercase mb-6 tracking-wide border-l-4 border-[#c63032] pl-4">
                {STORY_SLIDES[storyIndex].text}
              </h2>
              <p className="typewriter text-xl text-[#ece4cb] leading-relaxed">
                {STORY_SLIDES[storyIndex].sub}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="pb-12 flex justify-center gap-2">
            {STORY_SLIDES.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === storyIndex ? 'bg-[#c63032]' : 'bg-[#333]'}`} />
            ))}
          </div>
        </div>
      )}

      {/* 3. CHOICE SCREEN */}
      {phase === 'CHOICE' && (
        <div className="flex-1 flex flex-col z-10 animate-fadeIn">
          {/* Header flexible */}
          <div className="flex-[0.3] flex items-center justify-center p-4">
            <h2 className="text-2xl text-center uppercase text-[#ece4cb] tracking-widest border-b border-[#3a3830] pb-2">
              Qui interroger ?
            </h2>
          </div>

          {/* Cards Container */}
          <div className="flex-1 flex flex-col justify-center gap-4 px-6 pb-6 w-full max-w-md mx-auto">
            <button onTouchStart={handleTouch(() => initCombat('HARD'))} onClick={() => initCombat('HARD')}
              className="btn-action p-5 flex items-center gap-4 text-left group bg-[#1c1a15]">
              <div className="w-14 h-14 bg-black border border-[#c63032] rounded-full flex items-center justify-center shrink-0">
                <Shovel size={28} className="text-[#c63032]" />
              </div>
              <div>
                <div className="text-xl font-bold uppercase text-[#c63032]">L'Homme à la Pelle</div>
                <div className="text-xs opacity-60 mt-1">"Il pose des questions ! Gardes !"<br/><span className="text-[#c63032]">Difficulté : Élevée</span></div>
              </div>
            </button>

            <button onTouchStart={handleTouch(() => initCombat('NORMAL'))} onClick={() => initCombat('NORMAL')}
              className="btn-action p-5 flex items-center gap-4 text-left group bg-[#1c1a15]">
              <div className="w-14 h-14 bg-black border border-[#81cbd6] rounded-full flex items-center justify-center shrink-0">
                <Hammer size={28} className="text-[#81cbd6]" />
              </div>
              <div>
                <div className="text-xl font-bold uppercase text-[#81cbd6]">L'Homme au Marteau</div>
                <div className="text-xs opacity-60 mt-1">"Aide-moi… et je me battrais avec toi."<br/><span className="text-[#81cbd6]">Difficulté : Normale</span></div>
              </div>
            </button>
          </div>

          {showTutorial && (
            <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 animate-fadeIn">
              <h3 className="text-3xl text-white uppercase font-bold mb-8 tracking-widest border-b-2 border-white pb-2">Tutoriel</h3>
              <div className="space-y-8 w-full max-w-sm mb-12">
                <div className="flex items-start gap-4">
                  <Target size={32} className="text-[#c63032] shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-[#c63032] uppercase mb-1">DÉFENSE (QTE)</div>
                    <div className="text-sm opacity-80 leading-tight">Quand l'ennemi attaque, tapez rapidement sur les cibles <span className="inline-block border px-1 text-xs">1</span> <span className="inline-block border px-1 text-xs">2</span> <span className="inline-block border px-1 text-xs">3</span> qui apparaissent sur l'ennemi.</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Sword size={32} className="text-[#ece4cb] shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-[#ece4cb] uppercase mb-1">ATTAQUE</div>
                    <div className="text-sm opacity-80 leading-tight">Arrêtez le curseur dans la zone colorée pour toucher.</div>
                  </div>
                </div>
              </div>
              <button onTouchStart={handleTouch(startCombat)} onClick={startCombat} className="btn-action px-12 py-4 text-xl font-bold uppercase w-full max-w-xs">C'est parti</button>
            </div>
          )}
        </div>
      )}

      {/* 4. COMBAT SCREEN */}
      {phase === 'COMBAT' && (
        <>
          {/* ZONE ARENE (Flexible, prend tout l'espace restant) */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-0 bg-gradient-to-b from-[#12100c] to-[#0a0907]">

             {/* Messages Flottants */}
             {messages.map(m => (
               <div key={m.id} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold z-[60] whitespace-nowrap pointer-events-none drop-shadow-lg"
                 style={{ color: m.type === 'crit' ? '#ffdb2c' : m.type === 'hit' ? '#fff' : m.type === 'ally' ? '#81cbd6' : '#c63032', animation: 'fadeIn 0.5s ease-out forwards' }}>
                 {m.text}
               </div>
             ))}

             {/* QTE Targets Layer */}
             {turnState === 'ENEMY_ATTACKING' && (
               <div className="absolute inset-0 z-50">
                 {qteTargets.map((t) => !t.hit && (
                   <div key={t.id} className={`qte-target ${t.id === qteNextIndex ? 'active' : ''}`}
                     style={{left: `${t.x}%`, top: `${t.y}%`}}
                     onTouchStart={handleTouch(tapQte, t.id)} onMouseDown={() => tapQte(t.id)}>
                     {t.id}
                   </div>
                 ))}
               </div>
             )}

             {/* Ennemi (Taille responsive) */}
             <div className={`relative transition-all duration-200 ${turnState === 'ENEMY_ATTACKING' ? 'scale-95 opacity-60 blur-[1px]' : 'scale-100'}`}>
                <div className="relative">
                  <Shield size={Math.min(window.innerHeight * 0.25, 160)} className="text-[#4a4a35]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skull size={Math.min(window.innerHeight * 0.12, 80)} className="text-[#ece4cb]" />
                  </div>
                </div>
             </div>

             {/* HP Ennemi */}
             <div className="w-48 mt-4 h-3 bg-black border border-[#3a3830]">
               <div className="h-full bg-[#c63032] transition-all duration-300" style={{width: `${(enemyHp/100)*100}%`}} />
             </div>

             {/* Alert */}
             <div className={`absolute top-4 transition-opacity duration-200 ${turnState === 'ENEMY_ATTACKING' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-black/80 text-[#c63032] px-4 py-2 font-bold uppercase tracking-widest border border-[#c63032] animate-pulse">
                  Défense Requise !
                </div>
             </div>
          </div>

          {/* ZONE CONTROLES (Hauteur Fixe pour Mobile) */}
          <div className="h-[280px] bg-[#0f0d0a] border-t-2 border-[#3a3830] p-4 flex flex-col justify-end z-20 shadow-[0_-10px_40px_rgba(0,0,0,1)] pb-[env(safe-area-inset-bottom,20px)]">

            {/* Player Info */}
            <div className="flex justify-between items-end mb-3 px-1">
              <div>
                <div className={`text-5xl font-bold leading-none ${playerHp < 30 ? 'text-[#c63032] animate-pulse' : 'text-[#ece4cb]'}`}>{playerHp}</div>
                <div className="text-[10px] uppercase opacity-50 tracking-widest">Santé</div>
              </div>
              {difficulty === 'NORMAL' && <div className="text-[#81cbd6] border border-[#81cbd6] bg-[#81cbd6]/10 px-2 py-1 text-xs font-bold uppercase rounded-sm flex gap-1 items-center"><Hammer size={12}/> Soutien</div>}
            </div>

            {/* Action Area */}
            <div className="flex-1 relative w-full bg-[#1a1812] rounded overflow-hidden border border-[#333]">

              {turnState === 'PLAYER_AIMING' && (
                <div className="w-full h-full precision-bar-container active:scale-[0.98] transition-transform"
                     onTouchStart={handleTouch(playerAttack)} onMouseDown={playerAttack}>
                  <div className="precision-zone-hit"></div><div className="precision-zone-crit"></div>
                  <div className="precision-cursor" style={{left: `${cursorPos}%`}}></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold uppercase tracking-widest text-white mix-blend-overlay">TAP !</span>
                  </div>
                </div>
              )}

              {turnState === 'ENEMY_ATTACKING' && (
                <div className="w-full h-full flex flex-col items-center justify-center animate-pulse bg-[#c63032]/10 border-2 border-[#c63032]">
                  <Target size={32} className="text-[#c63032] mb-2" />
                  <span className="text-[#c63032] font-bold uppercase tracking-widest text-sm">Touchez les cibles !</span>
                </div>
              )}

              {turnState === 'PLAYER_IDLE' && (
                <button onTouchStart={handleTouch(() => setTurnState('PLAYER_AIMING'))} onClick={() => setTurnState('PLAYER_AIMING')}
                  className="w-full h-full flex items-center justify-center gap-3 bg-[#2a2820] active:bg-[#3a3830] transition-colors">
                  <Sword size={32} className="text-[#ece4cb]" />
                  <span className="text-3xl font-bold uppercase tracking-widest text-[#ece4cb]">ASSAUT</span>
                </button>
              )}

              {turnState === 'ENEMY_CHARGING' && (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
                  <div className="w-6 h-6 border-2 border-[#c63032] border-t-transparent rounded-full animate-spin mb-2"></div>
                </div>
              )}
            </div>

            <div className="text-center text-[#444] text-[10px] uppercase tracking-[0.2em] mt-2">Système Synchronisé</div>
          </div>
        </>
      )}

      {/* 5. END SCREENS */}
      {(phase === 'VICTORY' || phase === 'GAMEOVER') && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn relative z-20 bg-black/80 backdrop-blur-sm">
          {phase === 'VICTORY' ? (
            <>
              <div className="p-4 rounded-full border-2 border-[#81cbd6] mb-6 shadow-[0_0_30px_#81cbd6]"><Shield size={48} className="text-[#81cbd6]" /></div>
              <h1 className="text-3xl text-white font-bold mb-4 uppercase">Zone Sécurisée</h1>
              <p className="text-[#81cbd6] mb-8 text-sm uppercase tracking-widest">Le chemin vers Pascal Paoli est libre.</p>
              <button onClick={() => alert("Chargement Séquence 12...")} className="btn-action w-full max-w-xs py-4 text-xl font-bold uppercase flex items-center justify-center gap-2">
                Continuer <ChevronRight />
              </button>
            </>
          ) : (
            <>
              <Skull size={64} className="text-[#c63032] mb-6 animate-pulse" />
              <h1 className="text-3xl text-[#c63032] font-bold mb-2 uppercase">Désynchronisation</h1>
              <p className="text-[#999] mb-8 text-sm">Sujet critique.</p>
              <button onClick={() => setPhase('INTRO')} className="btn-action w-full max-w-xs py-4 text-xl font-bold uppercase">Recharger</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

export default App;
