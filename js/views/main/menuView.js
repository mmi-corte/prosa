import { clearContainer, gameContainer, navigate } from "../../../app.js"
import { gameInitialized, initGame, difficultyState, globalDifficulty } from "../../initGame.js"
//import { debugView } from "../Temp/debugView.js"
import { charactersView } from "./charactersView.js"
import { initView } from "./initView.js"
import { playerSelectView } from "./playerSelectView.js"
import { qrView } from "./qrView.js"
import { seasonsView } from "./seasonsView.js"

export function menuView() {
  clearContainer()

  // If game is initialized, show the in-game menu (Figma design)
  if (gameInitialized) {
    renderInGameMenu()
  } else {
    renderPreGameMenu()
  }
}

// Menu before starting a game
function renderPreGameMenu() {
  gameContainer.innerHTML = `
    <div class="menuWrapper">
      <h1 class="menu-title">QUE VOULEZ-VOUS FAIRE ?</h1>

      <nav class="menu-buttons">
        <button class="menu-btn btn-extra" id="startBtn">
          <span class="btn-title">Commencer la partie</span>
          <span class="btn-subtitle">L'histoire de Prosa vous attend.</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>

        <button class="menu-btn" id="qrBtn">
          <span class="btn-title">Découvrir la réalité augmentée</span>
          <span class="btn-subtitle">scanner un QR code</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>

        <button class="menu-btn" id="charactersBtn">
          <span class="btn-title">Découvrir les personnages</span>
          <span class="btn-subtitle">pouvoirs, histoire</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        <button class="menu-btn" id="seasonsBtn">
          <span class="btn-title">Découvrir les saisons</span>
          <span class="btn-subtitle">épisodes, aventures</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </nav>
    </div>
  `

  // Start button
  document.getElementById("startBtn").addEventListener('click', () => {
    initView()
  })

  // QR Scan button
  document.getElementById("qrBtn").addEventListener('click', () => {
    navigate("qr", () => qrView())
  })

  // Characters view button
  document.getElementById("charactersBtn").addEventListener('click', () => {
    navigate("encyclopedie", () => charactersView())
  })

  // Seasons button
  document.getElementById("seasonsBtn").addEventListener('click', () => {
    navigate("saisons", () => seasonsView())
  })
}

// Menu when game is in progress (matches Figma)
function renderInGameMenu() {
  const difficultyValue = difficultyState || '-'

  gameContainer.innerHTML = `
    <div class="menuWrapper menuWrapper-ingame">
      <h1 class="menu-title menu-title-left">AU COURS DU JEU</h1>

      <div class="menu-content-ingame">
        <div class="menu-difficulty-bar">
          <div class="difficulty-number">${difficultyValue}</div>
        </div>

        <nav class="menu-buttons-ingame">
          <button class="menu-btn-big btn-primary-big" id="codeBtn">
            <span class="btn-title-big">DÉCOUVRIR</span>
            <span class="btn-title-big">MON ÉNIGME</span>
          </button>

          <button class="menu-btn-big" id="qrBtn">
            <span class="btn-title-big">RÉALITÉ</span>
            <span class="btn-title-big">AUGMENTÉE</span>
          </button>
        </nav>
      </div>

      <footer class="menu-footer">
        <button class="discover-btn" id="discoverBtn">Découvrir l'univers de Prosa</button>
      </footer>
    </div>
  `

  // Code Input button
  document.getElementById("codeBtn").addEventListener('click', () => {
    navigate("code", () => playerSelectView())
  })

  // QR/AR button
  document.getElementById("qrBtn").addEventListener('click', () => {
    navigate("qr", () => qrView())
  })

  // Discover universe button - navigate to discover page
  document.getElementById("discoverBtn").addEventListener('click', () => {
    navigate("decouvrir", () => showDiscoverPage())
  })
}

// Page "Découvrir l'univers de Prosa" (full page)
function showDiscoverPage() {
  clearContainer()

  gameContainer.innerHTML = `
    <div class="menuWrapper">
      <h1 class="menu-title menu-title-left">DÉCOUVRIR L'UNIVERS</h1>

      <nav class="menu-buttons">
        <button class="menu-btn btn-extra" id="discoverCharactersBtn">
          <span class="btn-title">Découvrir les personnages</span>
          <span class="btn-subtitle">pouvoirs, histoire</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        <button class="menu-btn" id="discoverSeasonsBtn">
          <span class="btn-title">Découvrir les saisons</span>
          <span class="btn-subtitle">épisodes, aventures</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </nav>
    </div>
  `

  // Add back button to header
  const headerLeft = document.getElementById('headerLeft')
  if (headerLeft && !headerLeft.querySelector('.back-btn-circle')) {
    const backButton = document.createElement('button')
    backButton.classList.add('back-btn-circle')
    backButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `
    backButton.addEventListener('click', () => {
      history.back()
    })
    headerLeft.appendChild(backButton)
  }

  // Discover characters button
  document.getElementById('discoverCharactersBtn').addEventListener('click', () => {
    navigate("encyclopedie", () => charactersView())
  })

  // Discover seasons button
  document.getElementById('discoverSeasonsBtn').addEventListener('click', () => {
    navigate("saisons", () => seasonsView())
  })
}

