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
      <div class="character-card-image"
           style="background-image:url('${cinematic.image || "assets/cinematiques/default.png"}')"></div>
      <div class="character-card-name">${cinematic.title}</div>
    `
        card.addEventListener("click", () => goToCinematicDetail(cinematic))
        cinematicsGrid.appendChild(card)
    })
}

function goToCinematicDetail(cinematic) {
    const container = document.createElement('div')
    container.classList.add('modal-overlay', 'character-detail-content')

    container.innerHTML = `
            <button class="close-btn close-detail" id="closeModal" aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
            </button>

            <div class="character-card-large" id="cinematicCardLarge">
                <div class="character-image-frame" id="cinematicImageFrame" style="cursor: pointer; position: relative;">
                    <img src="${cinematic.image || "assets/cinematiques/default.png"}" alt="${cinematic.title}" id="cinematicDetailImage" class="character-detail-img">
                    <div id="playButton" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background-color: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;">
                        <svg viewBox="0 0 24 24" fill="white" width="30" height="30">
                            <polygon points="5 3 19 12 5 21" />
                        </svg>
                    </div>
                </div>
                <h2 class="character-name" id="cinematicDetailTitle"></h2>
            </div>

        <div class="character-description" id="cinematicDescription">
        </div>
    `

    gameContainer.appendChild(container)

    const cinematicDetailImage = document.getElementById('cinematicDetailImage')
    const cinematicDetailTitle = document.getElementById('cinematicDetailTitle')
    const cinematicDescription = document.getElementById('cinematicDescription')
    const cinematicImageFrame = document.getElementById('cinematicImageFrame')
    const playButton = document.getElementById('playButton')

    cinematicDetailImage.src = cinematic.image || "assets/cinematiques/default.png"
    cinematicDetailImage.alt = cinematic.title
    cinematicDetailTitle.textContent = cinematic.title
    cinematicDescription.innerHTML = `
    <p>${cinematic.description}</p>
    <span class="role">${cinematic.season || "Saison inconnue"}</span>
    `

    // Play video on click
    function playVideo() {
        const video = document.createElement('video')
        video.src = cinematic.video
        video.controls = true
        video.autoplay = true
        video.style.width = '100%'
        video.style.height = '100%'
        video.style.objectFit = 'cover'
        
        cinematicImageFrame.innerHTML = ''
        cinematicImageFrame.appendChild(video)
    }

    cinematicImageFrame.addEventListener('click', playVideo)
    playButton.addEventListener('click', playVideo)

    const closeModal = document.getElementById('closeModal')
    closeModal.addEventListener('click', () => {
        container.remove()
    })
}