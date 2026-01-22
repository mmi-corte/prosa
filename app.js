import { initGameData } from "./js/initGameData.js"
import { charactersView } from "./js/views/main/charactersView.js"
import { codeView } from "./js/views/main/codeView.js"
import { loadingView } from "./js/views/main/loadingView.js"
import { menuView } from "./js/views/main/menuView.js"
import { qrView } from "./js/views/main/qrView.js"
import { settingView } from "./js/views/main/settingView.js"
import { debugView } from "./js/views/Temp/debugView.js"

export const gameContainer = document.getElementById('gameContainer')

export function clearContainer() {
  gameContainer.innerHTML = ''
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Force the current history entry to be "Menu"
  // This ensures that if we go 'back' later, we return here.
  // history.replaceState({ view: 'menu' }, "", "/");

  //Load main menu by default
  menuView()
  loadingView()

  // ========================================
  // ============= DATA LOADING =============
  // ========================================
  initGameData()
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
settingButton.addEventListener('click', () => {
  navigate("parametres", settingView, false)
})

// ===================================
// ============= HAPTICS =============
// ===================================
export function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) navigator.vibrate(pattern)
}

// ====================================
// ============= POPSTATE =============
// ====================================
/**
 * Fonction de gestion de l'historique
 * @param  {[string]} viewName Nom commun de la page appelé
 * @param  {[function]} viewFunction Fonction d'affichage de la page
 * @param  {[boolean]} [updateUrl=true] Choix de l'actualisation d'url ou non
 */
export function navigate(viewName, viewFunction, updateUrl = true) {
  //Store the state of the page
  const state = { view: viewName }
  let url = ""
  if (updateUrl) {
    url = viewName
  } 
  history.pushState(state, "", url)

  //Call view function
  viewFunction()
}

const views = {
  "menu": menuView,
  "code": codeView,
  "qr": qrView,
  "encyclopedie": charactersView,
  "saisons": settingView,
  "debug": debugView,
  "parametres": settingView
};

window.addEventListener('popstate', (event) => {
  // 1. Get the view name from the state (default to 'menu' if null)
  const viewName = event.state ? event.state.view : 'menu';

  // 2. Execute the matching function
  if (views[viewName]) {
    views[viewName]();
  } else {
    menuView(); // Fallback
  }
});