// ========== DOM ELEMENTS ==========
const loadingScreen = document.getElementById("loadingScreen")
const menuScreen = document.getElementById("menuScreen")
const codeScreen = document.getElementById("codeScreen")
const charactersScreen = document.getElementById("charactersScreen")
const characterDetailScreen = document.getElementById("characterDetailScreen")
const settingsModal = document.getElementById("settingsModal")

// Buttons
const codeBtn = document.getElementById("codeBtn")
const qrBtn = document.getElementById("qrBtn")
const charactersBtn = document.getElementById("charactersBtn")
const seasonsBtn = document.getElementById("seasonsBtn")

// Settings buttons (all screens)
const settingsButtons = [
  document.getElementById("settingsBtn"),
  document.getElementById("settingsBtnCode"),
  document.getElementById("settingsBtnCharacters"),
  document.getElementById("settingsBtnDetail"),
]

// Close buttons
const closeCodeScreen = document.getElementById("closeCodeScreen")
const closeCharactersScreen = document.getElementById("closeCharactersScreen")
const closeCharacterDetail = document.getElementById("closeCharacterDetail")
const closeSettingsModal = document.getElementById("closeSettingsModal")

// Code screen elements
const codeDisplay = document.getElementById("codeDisplay")
const keypadKeys = document.querySelectorAll(".key[data-value]")
const keyDelete = document.getElementById("keyDelete")
const keyValidate = document.getElementById("keyValidate")

// Settings elements
const vibrationToggle = document.getElementById("vibrationToggle")
const cameraToggle = document.getElementById("cameraToggle")

// Characters grid
const charactersGrid = document.getElementById("charactersGrid")

// Character detail elements
const characterDetailImage = document.getElementById("characterDetailImage")
const characterDetailName = document.getElementById("characterDetailName")
const characterDescription = document.getElementById("characterDescription")

// ========== STATE ==========
let currentCode = ""
const settings = {
  music: 70,
  sfx: 80,
  vibration: true,
  camera: false,
}

// Fun facts for loading screen
const funFacts = [
  "En Corse, on dit qu'un serpent à sept têtes gardait une source sacrée et qu'aucun berger n'osait s'en approcher.",
  "L'Orcu est une créature mythique corse qui fait passer les voyageurs d'un monde à l'autre.",
  "Les bergers corses gardent jalousement la recette secrète du Brocciu depuis des siècles.",
  "Dans les montagnes corses, on raconte que certaines pierres murmurent des secrets aux initiés.",
]

// Sample characters data
const characters = [
]

// Games data (codes)
let gamesData = {
}

// ========== LOADING SCREEN ==========
function initLoadingScreen() {
  // Set random fun fact
  const funFactText = document.getElementById("funFactText")
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
  funFactText.innerHTML = `<em>${randomFact}</em>`

  // Hide loading screen after delay
  setTimeout(() => {
    loadingScreen.classList.add("hidden")
  }, 3000)
}

// ========== NAVIGATION ==========
function showScreen(screen) {
  // Hide all screens
  menuScreen.classList.add("hidden")
  codeScreen.classList.add("hidden")
  charactersScreen.classList.add("hidden")
  characterDetailScreen.classList.add("hidden")

  // Show target screen
  screen.classList.remove("hidden")
}

function goToMenu() {
  showScreen(menuScreen)
}

function goToCodeScreen() {
  currentCode = ""
  updateCodeDisplay()
  showScreen(codeScreen)
}

function goToCharactersScreen() {
  renderCharactersGrid()
  showScreen(charactersScreen)
}

function goToCharacterDetail(character) {
  characterDetailImage.src = character.image
  characterDetailImage.alt = character.name
  characterDetailName.textContent = character.name
  characterDescription.innerHTML = `
    <p>${character.description}</p>
    <span class="role">${character.role}</span>
  `
  showScreen(characterDetailScreen)
}

// ========== CODE ENTRY ==========
function updateCodeDisplay() {
  const digits = codeDisplay.querySelectorAll(".code-digit")
  digits.forEach((digit, index) => {
    digit.textContent = currentCode[index] || ""
    digit.classList.toggle("filled", currentCode[index] !== undefined)
    digit.classList.remove("error")
  })
}

function addDigit(value) {
  if (currentCode.length < 4) {
    currentCode += value
    updateCodeDisplay()
    vibrate(10)
  }
}

function deleteDigit() {
  if (currentCode.length > 0) {
    currentCode = currentCode.slice(0, -1)
    updateCodeDisplay()
    vibrate(10)
  }
}

function validateCode() {
  if (currentCode.length !== 4) {
    showCodeError()
    return
  }

  // Check code against games data
  let found = false
  for (const game in gamesData.games) {
    if (gamesData.games[game].code === currentCode) {
      const action = gamesData.games[game].action
      if (action.type === "redirect") {
        showSuccess(() => {
          window.location.href = action.url
        })
        found = true
        break
      }
    }
  }

  if (!found) {
    showCodeError()
  }
}

function showCodeError() {
  const digits = codeDisplay.querySelectorAll(".code-digit")
  digits.forEach((digit) => digit.classList.add("error"))
  vibrate([50, 30, 50])

  setTimeout(() => {
    currentCode = ""
    updateCodeDisplay()
  }, 500)
}

function showSuccess(callback) {
  // Create success overlay
  const overlay = document.createElement("div")
  overlay.className = "success-overlay"
  overlay.innerHTML = `
    <div class="success-content">
      <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <p class="success-text">ACCÈS AUTORISÉ</p>
    </div>
  `
  document.body.appendChild(overlay)

  setTimeout(() => overlay.classList.add("show"), 10)
  vibrate([50, 100, 50])

  setTimeout(() => {
    if (callback) callback()
  }, 1500)
}

// ========== CHARACTERS ==========
function renderCharactersGrid() {
  charactersGrid.innerHTML = ""

  // Render actual characters
  characters.forEach((char) => {
    const card = document.createElement("div")
    card.className = "character-card"
    card.innerHTML = `
      <div class="character-card-image" style="background-image: url('${char.image}')"></div>
      <div class="character-card-name">${char.name}</div>
    `
    card.addEventListener("click", () => goToCharacterDetail(char))
    charactersGrid.appendChild(card)
  })

  // Add empty placeholder cards to fill grid
  const emptyCount = 12 - characters.length
  for (let i = 0; i < emptyCount; i++) {
    const emptyCard = document.createElement("div")
    emptyCard.className = "character-card empty"
    charactersGrid.appendChild(emptyCard)
  }
}

// ========== SETTINGS ==========
function openSettings() {
  settingsModal.classList.remove("hidden")
}

function closeSettings() {
  settingsModal.classList.add("hidden")
}

function toggleSetting(toggle, settingKey) {
  toggle.classList.toggle("active")
  settings[settingKey] = toggle.classList.contains("active")
  vibrate(30)
}

// ========== HAPTIC FEEDBACK ==========
function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) {
    navigator.vibrate(pattern)
  }
}

// ========== EVENT LISTENERS ==========
// Menu buttons
codeBtn.addEventListener("click", goToCodeScreen)
qrBtn.addEventListener("click", () => {
  // Redirect to AR card scanner
  window.location.href = "../../AR/index.html"
})
charactersBtn.addEventListener("click", goToCharactersScreen)
seasonsBtn.addEventListener("click", () => {
  alert("Saisons - Fonctionnalité à venir")
})

// Settings buttons
settingsButtons.forEach((btn) => {
  if (btn) btn.addEventListener("click", openSettings)
})

// Close buttons
closeCodeScreen.addEventListener("click", goToMenu)
closeCharactersScreen.addEventListener("click", goToMenu)
closeCharacterDetail.addEventListener("click", goToCharactersScreen)
closeSettingsModal.addEventListener("click", closeSettings)

// Settings modal overlay click
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    closeSettings()
  }
})

// Keypad
keypadKeys.forEach((key) => {
  key.addEventListener("click", () => {
    addDigit(key.dataset.value)
  })
})

keyDelete.addEventListener("click", deleteDigit)
keyValidate.addEventListener("click", validateCode)

// Toggle switches
vibrationToggle.addEventListener("click", () => toggleSetting(vibrationToggle, "vibration"))
cameraToggle.addEventListener("click", () => toggleSetting(cameraToggle, "camera"))

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (!codeScreen.classList.contains("hidden")) {
    if (e.key >= "0" && e.key <= "9") {
      addDigit(e.key)
    } else if (e.key === "Backspace") {
      deleteDigit()
    } else if (e.key === "Enter") {
      validateCode()
    }
  }

  if (e.key === "Escape") {
    if (!settingsModal.classList.contains("hidden")) {
      closeSettings()
    } else if (!characterDetailScreen.classList.contains("hidden")) {
      goToCharactersScreen()
    } else if (!charactersScreen.classList.contains("hidden") || !codeScreen.classList.contains("hidden")) {
      goToMenu()
    }
  }
})

// Load games data from JSON
async function loadGamesData() {
  try {
    const response = await fetch("db.json")
    if (response.ok) {
      gamesData = await response.json()
    }
  } catch (error) {
    console.log("Using default games data")
  }
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  initLoadingScreen()
  loadGamesData()
})
