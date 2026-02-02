import { gameInitialized, initGame } from "./js/initGame.js"
import { initLanguageManager } from "./js/langageManager.js"
import { charactersView } from "./js/views/main/charactersView.js"
import { codeView } from "./js/views/main/codeView.js"
import { characterSelectView } from "./js/views/main/initViews/characterSelectView.js"
import { playerCountView } from "./js/views/main/initViews/playerCountView.js"
import { playerSubmitView } from "./js/views/main/initViews/playerSubmitView.js"
import { loadingView } from "./js/views/main/loadingView.js"
import { menuView } from "./js/views/main/menuView.js"
import { qrView } from "./js/views/main/qrView.js"
import { settingView } from "./js/views/main/settingView.js"
import { progressionView } from "./js/views/main/progressionView.js"
import { debugView } from "./js/views/Temp/debugView.js"

export const gameContainer = document.getElementById('gameContainer')

export function clearContainer() {
  gameContainer.innerHTML = ''
}

window.initProsaLogoLottie = function initProsaLogoLottie() {
  if (!window.lottie) return

  const targets = document.querySelectorAll('.logo-o-lottie')
  targets.forEach((el) => {
    if (el.dataset.lottieInit === 'true') return
    const path = el.getAttribute('data-lottie')
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

  // Initialize game and wait for it to complete
  await initGame()
  if (gameInitialized) {
    console.log("Previous game found, successfuly initialized save data")
  } else {
    console.log("No game initialized.")
  }

  //Then, load progression screen
  progressionView()

  if (window.initProsaLogoLottie) {
    window.initProsaLogoLottie()
  }

  // ====================================
  // ============= HEADER LOGO ==========
  // ====================================
  const headerLogo = document.getElementById('header-logo');

  headerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('./', menuView)
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
}
// Load settings from localStorage if they exists
settings.music = parseInt(localStorage.getItem('settingMusic')) || settings.music;
settings.sfx = parseInt(localStorage.getItem('settingSfx')) || settings.sfx;
settings.vibration = localStorage.getItem('settingVibration') === 'true' || settings.vibration;
settings.camera = localStorage.getItem('settingCamera') === 'true' || settings.camera;

//Setup the button
const settingButton = document.getElementById('settingButton')
if (settingButton) {
  settingButton.addEventListener('click', () => {
    settingView()
  })
}

// ===================================
// ============= HAPTICS =============
// ===================================
export function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) navigator.vibrate(pattern)
}

// ====================================
// ============= NAVIGATE =============
// ====================================
export function navigate(viewName, viewFunction, updateUrl = true) {
  // Store the state with the view name
  const state = { view: viewName }
  let url = ""
  if (updateUrl) {
    url = `#${viewName}`
  }

  try {
    history.pushState(state, "", url)
  } catch (e) {
    console.warn('Could not update history:', e);
  }

  // Always call the view function when navigating
  if (typeof viewFunction === 'function') {
    viewFunction()
  }
}

// ====================================
// ============= POPSTATE =============
// ====================================
window.addEventListener('popstate', (event) => {
  const viewName = event.state ? event.state.view : 'menu'

  // Call the appropriate view function based on viewName
  callView(viewName)
})

// ====================================
// ============= VIEW ROUTER ==========
// ====================================
function callView(viewName) {
  switch (viewName) {
    case 'menu':
      menuView()
      break
    case 'nombre-joueur':
      playerCountView()
      break
    case 'choix-personnage':
      characterSelectView()
      break
    case 'code':
      codeView()
      break
    case 'qr':
      qrView()
      break
    case 'encyclopedie':
      charactersView()
      break
    case 'saisons':
      seasonsView()
      break
    case 'debug':
      debugView()
      break
    case 'parametres':
      settingView()
      break
    default:
      menuView()
  }
}