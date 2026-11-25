import { gameInitialized, initGame } from "./js/initGame.js"
import { initLanguageManager } from "./js/langageManager.js"
import { loadingView } from "./js/views/main/loadingView.js"
import { menuView } from "./js/views/main/menuView.js"
import { settingView } from "./js/views/main/settingView.js"
import { progressionView } from "./js/views/main/progressionView.js"
import { navigate, callView } from "./router.js"
import { removeBackButton } from "./js/views/components/backButton.js"
import { startResourceLogging } from "./js/preloadAssets.js"

// Use pre-instantiated loggers from preloadAssets.js
const appLogger = window.appLog
const preloadLogger = window.preloadLog

export const gameContainer = document.getElementById('gameContainer')
export const headerLeft = document.getElementById('headerLeft')

const viewCleanups = new Set()

/** Register teardown work for listeners/timers owned by the current view. */
export function registerViewCleanup(cleanup) {
  if (typeof cleanup === 'function') viewCleanups.add(cleanup)
}

export function clearContainer() {
  viewCleanups.forEach((cleanup) => {
    try { cleanup() } catch (error) { console.warn('View cleanup failed:', error) }
  })
  viewCleanups.clear()
  gameContainer.innerHTML = ''
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (headerLeft) {
    removeBackButton()
  }
  // Minigames hide the whole header while their iframe is displayed. Restore it
  // on every view change so settings/logo/back stay reachable even when a game
  // is exited via browser Back/Forward instead of a completion message.
  const header = document.querySelector('.header')
  if (header) header.style.display = ''
}

window.initProsaLogoLottie = function initProsaLogoLottie() {
  if (!window.lottie) return

  // Ne pas charger Lottie en mode clair
  if (settings.lightMode) return

  const targets = document.querySelectorAll('.logo-o-lottie')
  targets.forEach((el) => {
    if (el.dataset.lottieInit === 'true') return
    let path = el.getAttribute('data-lottie')
    if (!path) return

    window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path
    })

    el.dataset.lottieInit = 'true'
  })
}

window.addEventListener('DOMContentLoaded', async () => {
  startResourceLogging(window.preloadLog);

  appLogger.log('🎮 Starting app initialization...');
  const initStart = performance.now();

  // Kick off TTS voice loading early — getVoices() is async-populated in Chromium.
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try { window.speechSynthesis.getVoices(); } catch (_) {}
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      try {
        const voices = window.speechSynthesis.getVoices() || [];
        const fr = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
        appLogger.log(`🗣️ TTS voices loaded (${voices.length} total, ${fr.length} fr): ${fr.map(v => v.name).join(', ') || 'none'}`);
      } catch (_) {}
    });
  }

  // Initialize language manager first (async to load translations)
  appLogger.log('📝 Loading language manager...');
  const langStart = performance.now();
  await initLanguageManager()
  appLogger.perf('Language manager loaded', performance.now() - langStart);

  // Initialize game data and wait for it to complete
  appLogger.log('💾 Loading game data...');
  const gameStart = performance.now();
  await initGame()
  appLogger.perf('Game data loaded', performance.now() - gameStart);
  
  if (gameInitialized) {
    appLogger.log("✅ Previous game found, save data restored");
  } else {
    appLogger.log("ℹ️ No existing game, starting fresh");
  }

  //loadingView()

  // Check if URL hash specifies a view to navigate to (e.g. returning from AR)
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && initialHash !== 'menu') {
    appLogger.log(`🎯 Navigating to hash route: ${initialHash}`);
    // Replace current history entry with menu so back button doesn't leave the app
    history.replaceState({ view: 'menu' }, '', '#menu');
    // Then push the target view on top, so history.back() goes to menu
    navigate(initialHash, () => callView(initialHash));
  } else if (gameInitialized) {
    appLogger.log('🎯 Resuming previous game...');
    navigate('resume', progressionView)
  } else {
    appLogger.log('🎯 Opening main menu...');
    navigate('menu', menuView)
  }

  if (window.initProsaLogoLottie) {
    appLogger.log('🎨 Initializing Lottie animations...');
    window.initProsaLogoLottie()
  }

  // Hide the app loading screen
  const appLoadingScreen = document.getElementById('app-loading-screen');
  if (appLoadingScreen) {
    appLoadingScreen.classList.add('hidden');
    setTimeout(() => appLoadingScreen.remove(), 600);
  }

  showMobileOnlyWarning()

  appLogger.perf('Total app initialization', performance.now() - initStart);

  // ====================================
  // ============= HEADER LOGO ==========
  // ====================================
  const headerLogo = document.getElementById('header-logo');

  headerLogo?.addEventListener('click', (e) => {
    e.preventDefault();
    appLogger.log('🏠 Navigating to menu');
    navigate('menu', menuView)
  });
});

function showMobileOnlyWarning() {
  if (localStorage.getItem('mobileOnlyWarningDismissed') === 'true') return

  const isTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  if (isTouchPrimary || isMobileUA) return

  const overlay = document.createElement('div')
  overlay.id = 'mobile-only-warning'
  overlay.innerHTML = `
    <div class="mobile-only-warning-box">
      <h2>Expérience mobile recommandée</h2>
      <p>PROSA est conçu pour une utilisation sur téléphone. L'expérience sur ordinateur peut être dégradée : mise en page, contrôles tactiles, caméra et capteurs peuvent ne pas fonctionner comme prévu.</p>
      <button class="mobile-only-warning-btn" type="button">J'ai compris</button>
    </div>
  `
  document.body.appendChild(overlay)

  const dismiss = () => {
    localStorage.setItem('mobileOnlyWarningDismissed', 'true')
    overlay.classList.add('hidden')
    setTimeout(() => overlay.remove(), 300)
  }

  overlay.querySelector('.mobile-only-warning-btn').addEventListener('click', dismiss)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss()
  })
}


// ====================================
// ============= SETTINGS =============
// ====================================
export const settings = {
  music: 70,
  sfx: 80,
  narration: 80,
  musicMuted: false,
  vibration: true,
  camera: false,
  lightMode: false,
  narrationTts: true,
  typewriterSound: true,
}

// Explicit null checks: 0 and false are valid saved values and must not fall back to defaults.
function readNumberSetting(key, fallback) {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback
}

function readBooleanSetting(key, fallback) {
  const raw = localStorage.getItem(key)
  return raw === null ? fallback : raw === 'true'
}

settings.music = readNumberSetting('settingMusic', settings.music)
settings.sfx = readNumberSetting('settingSfx', settings.sfx)
settings.narration = readNumberSetting('settingNarration', settings.narration)
settings.musicMuted = readBooleanSetting('settingMusicMuted', settings.musicMuted)
settings.typewriterSound = readBooleanSetting('settingTypewriterSound', settings.typewriterSound)
settings.vibration = readBooleanSetting('settingVibration', settings.vibration)
settings.camera = readBooleanSetting('settingCamera', settings.camera)
settings.lightMode = readBooleanSetting('settingLightMode', settings.lightMode)
settings.narrationTts = readBooleanSetting('settingNarrationTts', settings.narrationTts)

/** Persist every user preference in one place. */
export function saveSettings() {
  localStorage.setItem('settingMusic', settings.music)
  localStorage.setItem('settingSfx', settings.sfx)
  localStorage.setItem('settingNarration', settings.narration)
  localStorage.setItem('settingMusicMuted', settings.musicMuted)
  localStorage.setItem('settingTypewriterSound', settings.typewriterSound)
  localStorage.setItem('settingVibration', settings.vibration)
  localStorage.setItem('settingCamera', settings.camera)
  localStorage.setItem('settingLightMode', settings.lightMode)
  localStorage.setItem('settingNarrationTts', settings.narrationTts)
}

// Apply light mode if saved - do it immediately
if (document.body) {
  applyLightMode();
} else {
  document.addEventListener('DOMContentLoaded', applyLightMode);
}

export function applyLightMode() {
  const isLightMode = settings.lightMode;

  // Appliquer sur html
  if (document.documentElement) {
    document.documentElement.classList.toggle('light-mode', isLightMode);
  }

  // Appliquer sur body
  if (document.body) {
    document.body.classList.toggle('light-mode', isLightMode);
  }

  console.log('Light mode applied:', isLightMode);
}

//Setup the button
const settingButton = document.getElementById('settingButton')
if (settingButton) {
  settingButton.addEventListener('click', () => {
    navigate('parametres', settingView)
  })
}

// ===================================
// ============= HAPTICS =============
// ===================================
export function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) navigator.vibrate(pattern)
}