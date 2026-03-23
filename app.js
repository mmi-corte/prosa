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


// ====================================
// ============= SETTINGS =============
// ====================================
export const settings = {
  music: 70,
  sfx: 80,
  vibration: true,
  camera: false,
  lightMode: false,
}
// Load settings from localStorage if they exists
settings.music = parseInt(localStorage.getItem('settingMusic')) || settings.music;
settings.sfx = parseInt(localStorage.getItem('settingSfx')) || settings.sfx;
settings.vibration = localStorage.getItem('settingVibration') === 'true' || settings.vibration;
settings.camera = localStorage.getItem('settingCamera') === 'true' || settings.camera;
settings.lightMode = localStorage.getItem('settingLightMode') === 'true';

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