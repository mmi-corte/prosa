//import { startStep } from "./step"

// ========== GLOBAL DATA ==========
let funFacts = []

// ========== DOM ELEMENTS ==========

// Code screen



// ========== STATE ==========
let currentCode = ""

// ========== DATA LOADING ==========
  // Try production path first, fallback to local path
  async function loadData() {
  const paths = ["fronts/start_view_1/db.json", "./db.json"]
  
  for (const path of paths) {
    try {
      const response = await fetch(path)
      if (!response.ok) continue
      
      const data = await response.json()
      funFacts = data.funFacts || []
      gamesData = data.games || {}
      
      initLoadingScreen()
      return
    } catch (error) {
      // Try next path
    }
  }
  console.error("Erreur chargement JSON : aucun chemin valide")
}

// ========== LOADING SCREEN ==========
function initLoadingScreen() {
  const funFactText = document.getElementById("funFactText")

  if (!funFacts.length) {
    funFactText.textContent = "Chargement..."
    return
  }

  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
  funFactText.innerHTML = `<em>${randomFact}</em>`

  setTimeout(() => {
    loadingScreen.classList.add("hidden")
  }, 3000)
}



// ========== CODE ENTRY ==========




// ========== SETTINGS ==========
function toggleSetting(toggle, key) {
  toggle.classList.toggle("active")
  settings[key] = toggle.classList.contains("active")
  vibrate(30)
}

// ========== EVENTS ==========

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", loadData)
