import { gameInitialized, initGame } from "./js/initGame.js"
import { initLanguageManager } from "./js/langageManager.js"
import { loadingView } from "./js/views/main/loadingView.js"
import { menuView } from "./js/views/main/menuView.js"
import { settingView } from "./js/views/main/settingView.js"
import { progressionView } from "./js/views/main/progressionView.js"
import { navigate } from "./router.js"
import { removeBackButton } from "./js/views/components/backButton.js"

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

  // Initialize language manager first (async to load translations)
  await initLanguageManager()

  // Initialize game data and wait for it to complete
  await initGame()
  if (gameInitialized) {
    console.log("Previous game found, successfuly initialized save data")
  } else {
    console.log("No game initialized.")
  }

  //loadingView()

  //Then, load progression screen
  if (gameInitialized) {
    navigate('resume', progressionView())
  } else {
    navigate('menu', menuView())
  }

  if (window.initProsaLogoLottie) {
    window.initProsaLogoLottie()
  }

  // ====================================
  // ============= HEADER LOGO ==========
  // ====================================
  const headerLogo = document.getElementById('header-logo');

  headerLogo.addEventListener('click', (e) => {
    e.preventDefault();
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