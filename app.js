import { gameInitialized, initGame } from "./js/initGame.js"
import { initLanguageManager } from "./js/langageManager.js"
import { charactersView } from "./js/views/main/charactersView.js"
import { codeView } from "./js/views/main/codeView.js"
import { characterSelectView } from "./js/views/main/initViews/characterSelectView.js"
import { playerCountView } from "./js/views/main/initViews/playerCountView.js"
import { loadingView } from "./js/views/main/loadingView.js"
import { menuView } from "./js/views/main/menuView.js"
import { qrView } from "./js/views/main/qrView.js"
import { settingView } from "./js/views/main/settingView.js"
import { progressionView } from "./js/views/main/progressionView.js"
import { debugView } from "./js/views/Temp/debugView.js"
import { difficultyView } from "./js/views/main/initViews/difficultyView.js"
import { initDifficultyIndicator } from "./js/views/components/difficultyIndicator.js"

export const gameContainer = document.getElementById('gameContainer')
export const difficultyIndicator = document.getElementById('difficultyIndicator')
export const difficultyLabel = document.getElementById('difficultyLabel')
export const headerLeft = document.getElementById('headerLeft')

// const difficultyLabels = {
//   30: 'F',
//   20: 'M',
//   10: 'D'
// }

// function initDifficultyIndicator() {
//   let indicator = document.getElementById('difficulty-indicator')
//   if (indicator) return indicator

//   indicator = document.createElement('div')
//   indicator.id = 'difficulty-indicator'
//   indicator.className = 'difficulty-battery hidden'
//   indicator.innerHTML = `
//     <div class="battery-body">
//       <div class="battery-fill"></div>
//       <div class="battery-cap"></div>
//       <div class="battery-label">-</div>
//     </div>
//   `
//   document.body.appendChild(indicator)
//   return indicator
// }

// window.updateDifficultyIndicator = function updateDifficultyIndicator(difficultyValue) {
//   const indicator = initDifficultyIndicator()
//   if (!difficultyValue) {
//     indicator.classList.add('hidden')
//     return
//   }

//   const fill = indicator.querySelector('.battery-fill')
//   const label = indicator.querySelector('.battery-label')
//   const percent = difficultyValue === 30 ? 100 : difficultyValue === 20 ? 66 : 33
//   fill.style.width = `${percent}%`
//   label.textContent = difficultyLabels[difficultyValue] || '-'
//   indicator.dataset.difficulty = String(difficultyValue)

//   const hasInfo = !!document.querySelector('.info-btn')
//   const hasBack = !!document.querySelector('.back-btn-circle')
//   const rightOffset = hasInfo && !hasBack ? 74 : 128
//   indicator.style.right = `${rightOffset}px`
//   indicator.classList.remove('hidden')
// }

export function clearContainer() {
  gameContainer.innerHTML = ''
  if (headerLeft) {
    headerLeft.innerHTML = ''
  }
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
  if (gameInitialized) {
    navigate('resume', progressionView())
  } else {
    navigate('menu', menuView())
  }

  // Afficher l'indicateur de difficulté si déjà défini
  // const storedDifficultyRaw = localStorage.getItem('gameDifficulty')
  // if (storedDifficultyRaw !== null && window.updateDifficultyIndicator) {
  //   const storedDifficulty = parseInt(storedDifficultyRaw, 10)
  //   if (!Number.isNaN(storedDifficulty)) {
  //     window.updateDifficultyIndicator(storedDifficulty)
  //   }
  // }

  initDifficultyIndicator()

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
// ============= VIEW ROUTER ==========
// ====================================
const viewRoutes = {
  'menu': menuView,
  'resume': progressionView,
  'choix-difficulte': difficultyView,
  'nombre-joueur': playerCountView,
  'choix-personnage': characterSelectView,
  'code': codeView,
  'qr': qrView,
  'encyclopedie': charactersView,
  'encyclopedie-details': charactersView,
  'debug': debugView,
  'parametres': settingView,
}

function callView(viewName) {
  const viewFunction = viewRoutes[viewName] || menuView
  viewFunction?.()
}

// ====================================
// ============= POPSTATE =============
// ====================================
window.addEventListener('popstate', (event) => {
  const viewName = event.state ? event.state.view : 'menu'
  callView(viewName)
})