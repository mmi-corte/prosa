import { clearContainer, gameContainer, navigate } from "../../../app.js"
import { gameInitialized, initGame } from "../../initGame.js"
import { debugView } from "../Temp/debugView.js"
import { charactersView } from "./charactersView.js"
import { initView } from "./initView.js"
import { playerSelectView } from "./playerSelectView.js"
import { qrView } from "./qrView.js"
import { seasonsView } from "./seasonsView.js"
import { difficultyView } from "./initViews/difficultyView.js"

export function menuView() {
  clearContainer()

  gameContainer.innerHTML = `
    <div class="menuWrapper">
      <h1 class="menu-title">QUE VOULEZ-VOUS FAIRE ?</h1>

        <nav class="menu-buttons">

          <button class="menu-btn" id="startBtn">
            <span class="btn-title">Commencer la partie</span>
            <span class="btn-subtitle">L'histoire de Prosa vous attend.</span>
            <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>

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

          <button class="menu-btn" id="debugBtn" style="background-color:red;">
            <span class="btn-title" style="color:white;">DEBUG SCREEN</span>
          </button>
        </nav>
    </div>
  `

  // Code Input button
  const startBtn = document.getElementById("startBtn")
  if (gameInitialized) {
    startBtn.remove()
  } else {
    startBtn.addEventListener('click', () => {
      navigate("nombre-joueur", initView(), true)
    })
  }

  // Code Input button
  const codeBtn = document.getElementById("codeBtn")
  if (!gameInitialized) {
    codeBtn.remove()
  } else {
    codeBtn.addEventListener('click', () => {
      navigate("code", playerSelectView())
    })
  }

  //QR Scan button
  const qrBtn = document.getElementById("qrBtn")
  qrBtn.addEventListener('click', () => {
    navigate("qr", qrView())
  })

  //Characters view button
  const charactersBtn = document.getElementById("charactersBtn")
  charactersBtn.addEventListener('click', () => {
    navigate("encyclopedie", charactersView())
  })

  //Seasons button
  const seasonsBtn = document.getElementById("seasonsBtn")
  seasonsBtn.addEventListener('click', () => {
    navigate("saisons", seasonsView())
  })

  // debug screen button
  const debugBtn = document.getElementById("debugBtn")
  debugBtn.addEventListener('click', () => {
    navigate("debug", debugView())
  })
}

