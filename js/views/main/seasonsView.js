import { clearContainer, gameContainer } from "../../../app.js"
import { menuView } from "./menuView.js"

export function seasonsView() {
    clearContainer()

    gameContainer.innerHTML = `
        <div class="menuWrapper">
            <div class="characters-header">
                <div class="characters-title-section">
                    <h1 class="characters-title">LES SAISONS</h1>
                    <p class="characters-region">CINÉMATIQUES</p>
                </div>

                <div class="characters-actions">
                    <button class="close-btn" id="closeScreen" aria-label="Fermer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="characters-grid" id="cinematicsGrid">
                <!-- Cinematics will be populated by JS -->
            </div>
        </div>
    `

    let cinematicsData;
    async function loadCinematics() {
        if (cinematicsData) {
            return;
        } else {
            try {
                const response = await fetch('./data/cinematiques.json');
                if (!response.ok) throw new Error('Failed to load cinematics data');

                cinematicsData = await response.json();
                console.log("Cinematics data loaded:", cinematicsData.length, "cinematics.");

                renderCinematicsGrid(cinematicsData)
            } catch (error) {
                console.error("Critical: Could not load cinematics data", error);
            }
        }
    }
    loadCinematics()

    const closeScreen = document.getElementById('closeScreen')
    closeScreen.addEventListener('click', () => {
        menuView()
    })
}

function renderCinematicsGrid(cinematicsData) {
    const cinematicsGrid = document.getElementById('cinematicsGrid')
    cinematicsGrid.innerHTML = ""

    cinematicsData.forEach(cinematic => {
        const card = document.createElement("div")
        card.className = "character-card"
        card.innerHTML = `
            <div class="character-card-image" style="background-image: url('${cinematic.image || "assets/cinematiques/default.png"}');">
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
                        <polygon points="5 3 19 12 5 21" />
                    </svg>
                </div>
            </div>
            <div class="character-card-name">${cinematic.title}</div>
    `
        card.addEventListener("click", () => goToCinematicDetail(cinematic))
        cinematicsGrid.appendChild(card)
    })
}

function goToCinematicDetail(cinematic) {
    const container = document.createElement('div')
    container.classList.add('modal-overlay')

    container.innerHTML = `
        <div class="modal-content cinematic-modal">
            <button class="close-btn" id="closeModal" aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
            </button>

            <div class="cinematic-player" id="cinematicPlayer">
                <video 
                    id="cinematicVideo"
                    src="${cinematic.video || ""}"
                    controls 
                    autoplay 
                    style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">
                </video>
            </div>

            <div class="cinematic-info">
                <h2 class="cinematic-title">${cinematic.title}</h2>
                <p class="cinematic-season">${cinematic.season || "Saison inconnue"}</p>
                <p class="cinematic-description">${cinematic.description || ""}</p>
            </div>
        </div>
    `

    gameContainer.appendChild(container)

    const closeModal = document.getElementById('closeModal')
    closeModal.addEventListener('click', () => {
        container.remove()
    })

    // Close modal when clicking outside
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            container.remove()
        }
    })
}