import { clearContainer, gameContainer, navigate } from "../../../app.js"
import { gameInitialized, resetGame } from "../../initGame.js"
import { menuView } from "./menuView.js"

export function progressionView() {
  clearContainer()

  gameContainer.innerHTML = `
    <div class="splashWrapper">
      <nav class="splash-buttons">
        <button class="splash-btn menu-btn btn-extra" id="resumeGameBtn">
          <span class="btn-title">Reprendre ma progression</span>
          <span class="btn-subtitle">Continuer votre aventure</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>

        <button class="splash-btn menu-btn" id="newGameBtn">
          <span class="btn-title">Commencez une nouvelle partie</span>
          <span class="btn-subtitle">Découvrez l'histoire de Prosa</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12c0-1.25.756-2.429 2.016-2.929a6.5 6.5 0 1 1 9.968 0A2.991 2.991 0 0 0 19 12a2 2 0 1 1-4 0c0-.5.168-.982.47-1.393A2 2 0 0 1 12 6a2 2 0 0 1 2 2c0 1.657 1.343 3 3 3s3-1.343 3-3c0-6.075-5.925-11-11-11S1 5.925 1 12" />
          </svg>
        </button>
      </nav>
    </div>
  `

  // Event listeners
  const newGameBtn = document.getElementById('newGameBtn')
  const resumeGameBtn = document.getElementById('resumeGameBtn')

  newGameBtn.addEventListener('click', () => {
    resetGame()
    navigate('menu', menuView(), true)
  })

  resumeGameBtn.addEventListener('click', () => {
    navigate('menu', menuView)
  })
}
