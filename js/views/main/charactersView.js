import { clearContainer, gameContainer } from "../../../app.js";
import { menuView } from "./menuView.js";

export function charactersView() {
    clearContainer()

    gameContainer.innerHTML = `
        <div class="characters-header">
            <div class="characters-title-section">
                <h1 class="characters-title">LES PERSONNAGES</h1>
                <p class="characters-region">CORSE</p>
            </div>

            <div class="characters-actions">
                <button class="close-btn" id="closeScreen" aria-label="Fermer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </button>

                <button class="filter-btn" id="filterBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
                filtrer
                </button>
            </div>
        </div>

        <div class="characters-grid" id="charactersGrid">
            <!-- Characters will be populated by JS -->
        </div>
    `

    let charactersData;
    console.log(charactersData)
    async function loadCharacters() {
        if (charactersData) {
            return;
        } else {


            try {
                const response = await fetch('../../data/characters.json');
                if (!response.ok) throw new Error('Failed to load characters data');

                // Store data in memory for access later
                charactersData = await response.json();
                console.log("Characters data loaded:", charactersData.length, "characters.");

                // Render grid
                renderCharactersGrid(charactersData)
            } catch (error) {
                console.error("Critical: Could not load characters data", error);
            }
        }
    }
    loadCharacters()

    const closeScreen = document.getElementById('closeScreen')
    closeScreen.addEventListener('click', () => {
        menuView()
    })
}

function renderCharactersGrid(charactersData) {
    charactersGrid = document.getElementById('charactersGrid')
    charactersGrid.innerHTML = ""

    charactersData.forEach(char => {
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

function goToCharacterDetail(char) {
    const container = document.createElement('div')
    container.classList.add('modal-overlay', 'character-detail-content')

    container.innerHTML = `
        <button class="close-btn close-detail" id="closeModal" aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
        </button>

        <div class="character-card-large" id="characterCardLarge">
            <div class="character-image-frame">
            <img src="assets/characters/default.png" alt="L'ORCU" id="characterDetailImage" class="character-detail-img">
            </div>
            <h2 class="character-name" id="characterDetailName"></h2>
        </div>

        <div class="character-description" id="characterDescription">
        </div>
    `

    gameContainer.appendChild(container)

    const characterDetailImage = document.getElementById('characterDetailImage')
    const characterDetailName = document.getElementById('characterDetailName')
    const characterDescription = document.getElementById('characterDescription')

    characterDetailImage.src = char.image || "assets/characters/default.png"
    characterDetailImage.alt = char.name
    characterDetailName.textContent = char.name
    characterDescription.innerHTML = `
    <p>${char.description}</p>
    <span class="role">${char.role}</span>
    `

    const closeModal = document.getElementById('closeModal')
    closeModal.addEventListener('click', () => {
        container.remove()
    })
}