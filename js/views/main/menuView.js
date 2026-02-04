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

  gameContainer.innerHTML = `
    <div class="menuWrapper menuWrapper-ingame">
      <h1 class="menu-title menu-title-left">AU COURS DU JEU</h1>

      <div class="menu-content-ingame" id="menuContentIngame">
        
      </div>

      <footer class="menu-footer">
        <button class="discover-btn" id="discoverBtn">Découvrir l'univers de Prosa</button>
      </footer>
    </div>
  `

  const menuContainer = document.getElementById('menuContentIngame')

  //Show the difficulty bar if initialized
  const difficultyContainer = document.createElement('div')
  difficultyContainer.classList.add('menu-difficulty-bar')
  menuContainer.appendChild(difficultyContainer)

  const difficultyNumber = document.createElement('span')
  difficultyContainer.appendChild(difficultyNumber)

  const difficultyIndicator = document.createElement('div')
  difficultyIndicator.classList.add('difficulty-indicator')
  difficultyContainer.appendChild(difficultyIndicator)

  //Show the nav buttons
  const navContainer = document.createElement('nav')
  navContainer.classList.add('menu-buttons-ingame')
  menuContainer.appendChild(navContainer)

  //Start button
  const startButton = document.createElement('button')
  startButton.classList.add('menu-btn-big', 'btn-primary-big')
  if (gameInitialized) {
    startButton.innerHTML = `RETOUR AU<br>JEU`
    startButton.addEventListener('click', () => {
      navigate("code", () => playerSelectView())
    })
  } else {
    startButton.innerHTML = `COMMENCER LA<br>PARTIE`
    startButton.addEventListener('click', () => {
      navigate("init", () => initView())
    })
  }

  navContainer.appendChild(startButton)

  //AR Button
  const arButton = document.createElement('button')
  arButton.classList.add('menu-btn-big')
  arButton.innerHTML = `RÉALITÉ<br>AUGMENTÉE`

  arButton.addEventListener('click', () => {
    navigate("qr", () => qrView())
  })
  navContainer.appendChild(arButton)

  //Discover button
  document.getElementById('discoverBtn').addEventListener('click', () => {
    showDiscoverPage()
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

