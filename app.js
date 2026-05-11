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

export function clearContainer() {
  gameContainer.innerHTML = ''
  if (headerLeft) {
    removeBackButton()
  }
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
    navigate('resume', progressionView())
  } else {
    appLogger.log('🎯 Opening main menu...');
    navigate('menu', menuView())
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

  headerLogo.addEventListener('click', (e) => {
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
  vibration: true,
  camera: false,
  lightMode: false,
  narrationTts: true,
}
// Load settings from localStorage if they exists
settings.music = parseInt(localStorage.getItem('settingMusic')) || settings.music;
settings.sfx = parseInt(localStorage.getItem('settingSfx')) || settings.sfx;
settings.vibration = localStorage.getItem('settingVibration') === 'true' || settings.vibration;
settings.camera = localStorage.getItem('settingCamera') === 'true' || settings.camera;
settings.lightMode = localStorage.getItem('settingLightMode') === 'true';
const storedTts = localStorage.getItem('settingNarrationTts');
settings.narrationTts = storedTts === null ? settings.narrationTts : storedTts === 'true';

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
    settingView()
  })
}

// ===================================
// ============= HAPTICS =============
// ===================================
export function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) navigator.vibrate(pattern)
}