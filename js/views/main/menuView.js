import { clearContainer, gameContainer } from "../../../app.js"
import { gameInitialized, initGame, difficultyState, globalDifficulty, decrementDifficultyState, isGameOver } from "../../initGame.js"
import { gameOverView } from "./gameOverView.js"
//import { debugView } from "../Temp/debugView.js"
import { charactersView } from "./charactersView.js"
import { initView } from "./initView.js"
import { playerSelectView } from "./playerSelectView.js"
import { qrView } from "./qrView.js"
import { seasonsView } from "./seasonsView.js"
import { aleasView } from "./aleasView.js"
import { minigamesView } from "./minigamesView.js"
import { navigate } from "../../../router.js"
import { showBackButton } from "../components/backButton.js"

export function menuView() {
  // Vérifier immédiatement si le joueur a perdu (batterie à 0)
  if (gameInitialized && difficultyState !== null && difficultyState !== undefined && difficultyState <= 0) {
    navigate('gameover', gameOverView)
    return
  }
  clearContainer()

  gameContainer.innerHTML = `
    <div class="menuWrapper menuWrapper-ingame">
      ${gameInitialized ? '<h1 class="menu-title menu-title-left">AU COURS DU JEU</h1>' : ''}

      <div class="menu-content-ingame" id="menuContentIngame">
        
      </div>

      <footer class="menu-footer">
        <button class="discover-btn" id="discoverBtn">L'univers de Prosa</button>
      </footer>
    </div>
  `

  const menuContainer = document.getElementById('menuContentIngame')

  //Show the difficulty bar if initialized
  if (gameInitialized && difficultyState !== null && difficultyState !== undefined) {
    const difficultyContainer = document.createElement('div')
    difficultyContainer.classList.add('menu-difficulty-bar')
    menuContainer.appendChild(difficultyContainer)

    const difficultyNumber = document.createElement('span')
    difficultyNumber.innerText = difficultyState
    difficultyContainer.appendChild(difficultyNumber)

    const difficultyIndicator = document.createElement('div')
    difficultyIndicator.classList.add('difficulty-indicator')

    const height = (difficultyState / globalDifficulty) * 100
    difficultyIndicator.style.height = height + "%"

    difficultyContainer.appendChild(difficultyIndicator)
  }

  //Init the nav buttons container
  const navContainer = document.createElement('nav')
  navContainer.classList.add('menu-buttons-ingame')
  menuContainer.appendChild(navContainer)

  //Start button
  const startButton = document.createElement('button')
  startButton.classList.add('menu-btn-big', 'btn-primary-big')
  if (gameInitialized) { //If game already initialized, show code entry button
    startButton.innerHTML = `JOUER`
    startButton.addEventListener('click', () => {
      navigate("jeu/choix-joueur", () => playerSelectView())
    })
  } else { //If not initialized, show init game sequence button
    startButton.innerHTML = `COMMENCER LA<br>PARTIE`
    startButton.addEventListener('click', () => {
      initView()
    })
  }
  navContainer.appendChild(startButton)

  //Aleas Button, only shown if game initialized
  if (gameInitialized) {
    const aleasButton = document.createElement('button')
    aleasButton.classList.add('menu-btn-big')
    aleasButton.innerHTML = `ALÉAS`

    aleasButton.addEventListener('click', () => {
      navigate("aleas", () => aleasView())
    })

    navContainer.appendChild(aleasButton)
  }

  //AR Button
  const arButton = document.createElement('button')
  arButton.classList.add('menu-btn-big')
  arButton.innerHTML = `RÉALITÉ<br>AUGMENTÉE`

  arButton.addEventListener('click', () => {
    qrView()
  })
  navContainer.appendChild(arButton)

  //Discover button
  document.getElementById('discoverBtn').addEventListener('click', () => {
    navigate("univers-prosa", () => showDiscoverPage())
  })
}



// Page "L'univers de Prosa" (full page)
function showDiscoverPage() {
  clearContainer()
  showBackButton()

  gameContainer.innerHTML = `
    <div class="menuWrapper discover-wrapper">
      <h1 class="menu-title menu-title-left">L'UNIVERS</h1>

      <nav class="menu-buttons discover-buttons">
        <button class="menu-btn btn-extra" id="discoverCharactersBtn">
          <span class="btn-title">Les personnages</span>
          <span class="btn-subtitle">pouvoirs, histoire</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        <button class="menu-btn" id="discoverSeasonsBtn">
          <span class="btn-title">Les saisons</span>
          <span class="btn-subtitle">épisodes, aventures</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>

        <button class="menu-btn" id="discoverMinigamesBtn">
          <span class="btn-title">Les mini-jeux</span>
          <span class="btn-subtitle">répertoire complet</span>
          <svg class="menu-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="7" height="7" />
            <rect x="14" y="4" width="7" height="7" />
            <rect x="3" y="13" width="7" height="7" />
            <rect x="14" y="13" width="7" height="7" />
          </svg>
        </button>
      </nav>
    </div>
  `

  // Discover characters button
  document.getElementById('discoverCharactersBtn').addEventListener('click', () => {
    navigate("univers-prosa/encyclopedie", () => charactersView())
  })

  // Discover seasons button
  document.getElementById('discoverSeasonsBtn').addEventListener('click', () => {
    navigate("univers-prosa/saisons", () => seasonsView())
  })

  // Discover mini-games button
  document.getElementById('discoverMinigamesBtn').addEventListener('click', () => {
    navigate("univers-prosa/mini-jeux", () => minigamesView())
  })
}

