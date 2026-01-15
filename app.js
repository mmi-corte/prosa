import { menuView } from "./js/views/main/menuView.js"
import { settingView } from "./js/views/main/settingView.js"

export const gameContainer = document.getElementById('gameContainer')

export function clearContainer() {
    gameContainer.innerHTML = ''
}
//Load main menu by default
menuView()

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
    settingView()
})

// ===================================
// ============= HAPTICS =============
// ===================================
export function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) navigator.vibrate(pattern)
}