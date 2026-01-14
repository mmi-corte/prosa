// ========== GLOBAL DATA ==========
let funFacts = []
let characters = []
let gamesData = {}

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

// Settings buttons
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

// Code screen
const codeDisplay = document.getElementById("codeDisplay")
const keypadKeys = document.querySelectorAll(".key[data-value]")
const keyDelete = document.getElementById("keyDelete")
const keyValidate = document.getElementById("keyValidate")

// Settings
const vibrationToggle = document.getElementById("vibrationToggle")
const cameraToggle = document.getElementById("cameraToggle")

// Characters
const charactersGrid = document.getElementById("charactersGrid")
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

// ========== DATA LOADING ==========
async function loadData() {
  try {
    const response = await fetch("fronts/start_view_1/db.json")
    const data = await response.json()

    funFacts = data.funFacts || []
    characters = data.characters || []
    gamesData = data.games || {}

    initLoadingScreen()
  } catch (error) {
    console.error("Erreur chargement JSON :", error)
  }
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

// ========== NAVIGATION ==========
function showScreen(screen) {
  menuScreen.classList.add("hidden")
  codeScreen.classList.add("hidden")
  charactersScreen.classList.add("hidden")
  characterDetailScreen.classList.add("hidden")
  screen.classList.remove("hidden")
}

const goToMenu = () => showScreen(menuScreen)

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
  characterDetailImage.src = character.image || "assets/characters/default.png"
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
    digit.classList.toggle("filled", !!currentCode[index])
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
  currentCode = currentCode.slice(0, -1)
  updateCodeDisplay()
  vibrate(10)
}

function validateCode() {
  if (currentCode.length !== 4) return showCodeError()

  let found = false

  for (const key in gamesData) {
    if (gamesData[key].code === currentCode) {
      const action = gamesData[key].action
      if (action.type === "redirect") {
        showSuccess(() => (window.location.href = action.url))
        found = true
        break
      }
    }
  }

  if (!found) showCodeError()
}

function showCodeError() {
  document.querySelectorAll(".code-digit").forEach(d => d.classList.add("error"))
  vibrate([50, 30, 50])
  setTimeout(() => {
    currentCode = ""
    updateCodeDisplay()
  }, 500)
}

// ========== CHARACTERS ==========
function renderCharactersGrid() {
  charactersGrid.innerHTML = ""

  characters.forEach(char => {
    const card = document.createElement("div")
    card.className = "character-card"
    card.innerHTML = `
      <div class="character-card-image"
           style="background-image:url('${char.image || "assets/characters/default.png"}')"></div>
      <div class="character-card-name">${char.name}</div>
    `
    card.addEventListener("click", () => goToCharacterDetail(char))
    charactersGrid.appendChild(card)
  })
}

// ========== SETTINGS ==========
function openSettings() {
  settingsModal.classList.remove("hidden")
}

function closeSettings() {
  settingsModal.classList.add("hidden")
}

function toggleSetting(toggle, key) {
  toggle.classList.toggle("active")
  settings[key] = toggle.classList.contains("active")
  vibrate(30)
}

// ========== HAPTIC ==========
function vibrate(pattern) {
  if (navigator.vibrate && settings.vibration) navigator.vibrate(pattern)
}

// ========== EVENTS ==========
codeBtn.addEventListener("click", goToCodeScreen)
charactersBtn.addEventListener("click", goToCharactersScreen)
qrBtn.addEventListener("click", () => (window.location.href = "../../AR/index.html"))
seasonsBtn.addEventListener("click", () => alert("Fonction à venir"))

settingsButtons.forEach(btn => btn && btn.addEventListener("click", openSettings))
closeCodeScreen.addEventListener("click", goToMenu)
closeCharactersScreen.addEventListener("click", goToMenu)
closeCharacterDetail.addEventListener("click", goToCharactersScreen)
closeSettingsModal.addEventListener("click", closeSettings)

keypadKeys.forEach(key =>
  key.addEventListener("click", () => addDigit(key.dataset.value))
)
keyDelete.addEventListener("click", deleteDigit)
keyValidate.addEventListener("click", validateCode)

vibrationToggle.addEventListener("click", () => toggleSetting(vibrationToggle, "vibration"))
cameraToggle.addEventListener("click", () => toggleSetting(cameraToggle, "camera"))

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", loadData)
