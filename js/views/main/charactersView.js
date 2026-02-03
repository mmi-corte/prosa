import { clearContainer, gameContainer, headerLeft, navigate } from "../../../app.js";
import { menuView } from "./menuView.js";

export function charactersView() {
    clearContainer()

    gameContainer.innerHTML = `
        <div class="menuWrapper">
            <div class="characters-header">
                <div class="characters-title-section">
                    <h1 class="characters-title">LES PERSONNAGES</h1>
                    <p class="characters-region" id="charactersRegionLabel">CORSE</p>
                </div>

                <div class="characters-actions">
                    <label class="language-switch" aria-label="Basculer la région entre Corse et Provence">
                        <span class="language-label">CORSE</span>
                        <input type="checkbox" id="regionToggle" />
                        <span class="language-slider"></span>
                        <span class="language-label">PROVENCE</span>
                    </label>

                </div>
            </div>

            <div class="characters-grid" id="charactersGrid">
                <!-- Characters will be populated by JS -->
            </div>
        </div>
    `

    let charactersData;
    const regionToggle = document.getElementById('regionToggle')
    const charactersRegionLabel = document.getElementById('charactersRegionLabel')

    const applyRegionFilter = () => {
        if (!charactersData) return

        const selectedRegion = regionToggle && regionToggle.checked ? 'PROVENCE' : 'CORSE'
        if (charactersRegionLabel) {
            charactersRegionLabel.textContent = selectedRegion
        }

        const filtered = charactersData.filter(char => {
            const region = (char.region || '').toString().toUpperCase()
            return region === selectedRegion
        })

        renderCharactersGrid(filtered)
    }
    async function loadCharacters() {
        if (charactersData) {
            return;
        } else {


            try {
                const response = await fetch('./data/characters.json');
                if (!response.ok) throw new Error('Failed to load characters data');

                // Store data in memory for access later
                charactersData = await response.json();
                console.log("Characters data loaded:", charactersData.length, "characters.");

                // Render grid
                applyRegionFilter()
            } catch (error) {
                console.error("Critical: Could not load characters data", error);
            }
        }
    }
    loadCharacters()

    if (regionToggle) {
        regionToggle.addEventListener('change', applyRegionFilter)
    }

    // Bouton retour (header)
    if (headerLeft && !headerLeft.querySelector('.back-btn-circle')) {
        const backButton = document.createElement('button')
        backButton.classList.add('back-btn-circle')
        backButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        `
        backButton.addEventListener('click', () => {
            window.history.back()
        })
        headerLeft.appendChild(backButton)
    }
}

function renderCharactersGrid(charactersData) {
    const charactersGrid = document.getElementById('charactersGrid')
    charactersGrid.innerHTML = ""

    charactersData.forEach(char => {
        const card = document.createElement("div")
        card.className = "character-card"

        const mediaWrapper = document.createElement('div')
        mediaWrapper.className = "character-card-image"

        const mediaPath = char.image || char.media || ''
        const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath)

        if (isVideo) {
            const video = document.createElement('video')
            video.src = `./assets/characters/${mediaPath}`
            video.muted = true
            video.loop = true
            video.playsInline = true
            video.autoplay = true
            video.setAttribute('aria-label', char.name)
            mediaWrapper.appendChild(video)
        } else {
            mediaWrapper.style.backgroundImage = `url('./assets/characters/${mediaPath}')`
        }

        const nameEl = document.createElement('div')
        nameEl.className = "character-card-name"
        nameEl.textContent = char.name

        card.append(mediaWrapper, nameEl)
        card.addEventListener("click", () => navigate('encyclopedie-details', goToCharacterDetail(char)))
        charactersGrid.appendChild(card)
    })
}

function goToCharacterDetail(char) {
    const overlay = document.createElement('div')
    overlay.classList.add('modal-overlay')

    const modal = document.createElement('div')
    modal.classList.add('character-detail-content')

    modal.innerHTML = `
            <div class="character-card-large" id="characterCardLarge">
                <div class="character-image-frame">
                    <img src="" alt="L'ORCU" id="characterDetailImage" class="character-detail-img">
                </div>
                <h2 class="character-name" id="characterDetailName"></h2>
            </div>

        <div class="character-description" id="characterDescription">
        </div>
    `

    const closeButton = document.createElement('button')
    closeButton.classList.add('back-btn-circle')
    closeButton.setAttribute('aria-label', 'Fermer')
    closeButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `

    overlay.appendChild(closeButton)
    overlay.appendChild(modal)
    gameContainer.appendChild(overlay)
    gameContainer.classList.add('modal-open')

    const characterDetailImage = modal.querySelector('#characterDetailImage')
    const characterDetailName = modal.querySelector('#characterDetailName')
    const characterDescription = modal.querySelector('#characterDescription')

    const detailMediaPath = char.image || char.media || ''
    const isDetailVideo = /\.(mp4|webm|ogg)$/i.test(detailMediaPath)

    if (isDetailVideo) {
        const video = document.createElement('video')
        video.src = `./assets/characters/${detailMediaPath}`
        video.muted = true
        video.loop = true
        video.controls = true
        video.autoplay = true
        video.playsInline = true
        video.setAttribute('aria-label', char.name)
        characterDetailImage.replaceWith(video)
    } else {
        characterDetailImage.src = `./assets/characters/${detailMediaPath}`
        characterDetailImage.alt = `Illustration ${char.name}`
    }
    characterDetailName.textContent = char.name
    characterDescription.innerHTML = `
    <p>${char.description}</p>
    <span class="role">${char.role}</span>
    `

    closeButton.addEventListener('click', () => {
        overlay.remove()
        gameContainer.classList.remove('modal-open')
        window.history.back();
    })
}