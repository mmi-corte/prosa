import { clearContainer, gameContainer } from "../../../app.js"
import { charactersView } from "./charactersView.js"
import { codeView } from "./codeView.js"
import { qrView } from "./qrView.js"
import { seasonsView } from "./seasonsView.js"

export function menuView() {
  clearContainer()

  gameContainer.innerHTML = `
  <h1 class="menu-title">QUE VOULEZ-VOUS FAIRE ?</h1>

    <nav class="menu-buttons">
      <button class="menu-btn" id="codeBtn">
        <span class="btn-title">Découvrir mon énigme :</span>
        <span class="btn-subtitle">saisir un code</span>
        <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      <button class="menu-btn" id="qrBtn">
        <span class="btn-title">Découvrir la réalité augmentée :</span>
        <span class="btn-subtitle">scanner un QR code</span>
        <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>

      <button class="menu-btn" id="charactersBtn">
        <span class="btn-title">Découvrir les personnages :</span>
        <span class="btn-subtitle">pouvoirs, histoire</span>
        <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <button class="menu-btn" id="seasonsBtn">
        <span class="btn-title">Découvrir les saisons :</span>
        <span class="btn-subtitle">épisodes, aventures</span>
        <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
    </nav>
  `

  // Code Input button
  const codeBtn = document.getElementById("codeBtn")
  codeBtn.addEventListener('click', () => {
    codeView()
  })

  //QR Scan button
  const qrBtn = document.getElementById("qrBtn")
  qrBtn.addEventListener('click', () => {
    qrView()
  })

  //Characters view button
  const charactersBtn = document.getElementById("charactersBtn")
  charactersBtn.addEventListener('click', () => {
    charactersView()
  })

  //Seasons button
  const seasonsBtn = document.getElementById("seasonsBtn")
  seasonsBtn.addEventListener('click', () => {
    seasonsView()
  })
}


// ========== DOM ELEMENTS ==========
const loadingScreen = document.getElementById("loadingScreen")
const menuScreen = document.getElementById("menuScreen")
const codeScreen = document.getElementById("codeScreen")
const charactersScreen = document.getElementById("charactersScreen")
const characterDetailScreen = document.getElementById("characterDetailScreen")
const settingsModal = document.getElementById("settingsModal")



const qrBtn = document.getElementById("qrBtn")

const charactersBtn = document.getElementById("charactersBtn")

const seasonsBtn = document.getElementById("seasonsBtn")

// Settings buttons
const settingsButtons = [
  document.getElementById("settingsBtn"),
]

// Close button
const closeCodeScreen = document.getElementById("closeCodeScreen")

// Settings
const vibrationToggle = document.getElementById("vibrationToggle")
const cameraToggle = document.getElementById("cameraToggle")

