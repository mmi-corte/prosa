import { clearContainer, gameContainer } from "../../../app.js"
import { showBackButton } from "../components/backButton.js"

const COLLECTION_ORDER = ["final-game", "final-game-toulon"]

export function minigamesView() {
  clearContainer()
  showBackButton()

  gameContainer.innerHTML = `
    <div class="menuWrapper discover-wrapper">
      <h1 class="menu-title menu-title-left">MINI-JEUX</h1>
      <div id="minigamesGrid" class="minigames-grid"></div>
    </div>
  `

  loadMinigames()
}

async function loadMinigames() {
  try {
    const response = await fetch("./data/minigames.json")
    if (!response.ok) throw new Error("Failed to load minigames data")
    const minigames = await response.json()
    renderMinigames(minigames)
  } catch (error) {
    console.error("Critical: Could not load minigames data", error)
  }
}

function renderMinigames(minigames) {
  const grid = document.getElementById("minigamesGrid")
  if (!grid) return

  const grouped = minigames.reduce((acc, game) => {
    const group = game.collection || "autres"
    if (!acc[group]) acc[group] = []
    acc[group].push(game)
    return acc
  }, {})

  const orderedKeys = COLLECTION_ORDER.filter((key) => grouped[key])
  const remainingKeys = Object.keys(grouped).filter((key) => !orderedKeys.includes(key))

  const orderedGames = [...orderedKeys, ...remainingKeys].flatMap((groupKey) => grouped[groupKey] || [])

  orderedGames.forEach((game) => {
    const card = document.createElement("button")
    card.className = "minigame-card"
    card.innerHTML = `
      <span class="minigame-title">${game.title}</span>
      <span class="minigame-cta">Ouvrir</span>
    `
    card.addEventListener("click", () => {
      window.location.href = game.path
    })
    grid.appendChild(card)
  })
}
