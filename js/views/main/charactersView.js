import { clearContainer, gameContainer } from "../../../app.js";
import { navigate } from "../../../router.js";
import { showBackButton } from "../components/backButton.js";

let characterDetailOverlay
let isClosingCharacterDetail = false

export function charactersView(preventReload = false) {
    if (preventReload) {
        if (characterDetailOverlay) {
            characterDetailOverlay.remove()
            characterDetailOverlay = null
        }
        return
    }
    clearContainer()
    showBackButton()

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

        // Persist region selection across views
        try {
            localStorage.setItem('charactersRegion', selectedRegion)
        } catch (error) {
            console.warn('Could not persist characters region:', error)
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
        // Restore previously selected region
        try {
            const savedRegion = localStorage.getItem('charactersRegion')
            if (savedRegion === 'PROVENCE') {
                regionToggle.checked = true
                if (charactersRegionLabel) {
                    charactersRegionLabel.textContent = 'PROVENCE'
                }
            }
        } catch (error) {
            console.warn('Could not restore characters region:', error)
        }
        regionToggle.addEventListener('change', applyRegionFilter)
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
        card.addEventListener("click", () => navigate('univers-prosa/encyclopedie-details', () => goToCharacterDetail(char)))
        charactersGrid.appendChild(card)
    })
}

function goToCharacterDetail(char) {
    characterDetailOverlay = document.createElement('div')
    characterDetailOverlay.classList.add('modal-overlay')

    const modal = document.createElement('div')
    modal.classList.add('character-detail-content')

    modal.innerHTML = `
            <div class="character-card-large" id="characterCardLarge">
                <div class="character-image-frame">
                    <img src="" alt="L'ORCU" id="characterDetailImage" class="character-detail-img">
                </div>
                <h2 class="character-name" id="characterDetailName"></h2>
            </div>

        <div class="character-language-switch">
            <img src="" alt="" class="language-flag" id="flagFirst">
            <label class="switch-toggle">
                <input type="checkbox" id="characterLanguageSwitch">
                <span class="toggle-slider"></span>
            </label>
            <img src="" alt="" class="language-flag" id="flagSecond">
        </div>

        <div class="character-description" id="characterDescription">
        </div>
    `

    characterDetailOverlay.appendChild(modal)
    gameContainer.appendChild(characterDetailOverlay)

    const characterDetailImage = modal.querySelector('#characterDetailImage')
    const characterDetailName = modal.querySelector('#characterDetailName')
    const characterDescription = modal.querySelector('#characterDescription')

    const detailMediaPath = char.image || char.media || ''
    const isDetailVideo = /\.(mp4|webm|ogg)$/i.test(detailMediaPath)

    if (isDetailVideo) {
        const video = document.createElement('video')
        video.src = `./assets/characters/${detailMediaPath}`
        video.muted = false
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

    // Déterminer la région et les drapeaux correspondants
    const isProvencal = char.region === 'PROVENCE'
    const flagFirstEl = modal.querySelector('#flagFirst')
    const flagSecondEl = modal.querySelector('#flagSecond')

    if (isProvencal) {
        // Pour Provençaux: Français + Provençal
        flagFirstEl.src = './assets/drapeau/france.png'
        flagFirstEl.alt = 'Français'
        flagSecondEl.src = './assets/drapeau/provence.svg'
        flagSecondEl.alt = 'Provençal'
    } else {
        // Pour Corses: Français + Corse
        flagFirstEl.src = './assets/drapeau/france.png'
        flagFirstEl.alt = 'Français'
        flagSecondEl.src = './assets/drapeau/bandera.png'
        flagSecondEl.alt = 'Corsu'
    }

    // État de la langue (false = première langue, true = deuxième langue)
    let isSecondLanguage = false

    const updateDescription = () => {
        if (isProvencal) {
            // Personnage provençal: basculer entre corse et provençal
            const description = isSecondLanguage ? (char.description_prov || char.description) : (char.description_co || char.description)
            const role = isSecondLanguage ? (char.role_prov || char.role) : (char.role_co || char.role)
            characterDescription.innerHTML = `
            <p>${description}</p>
            <span class="role">${role}</span>
            `
        } else {
            // Personnage corse: basculer entre français et corse
            const description = isSecondLanguage ? (char.description_co || char.description) : char.description
            const role = isSecondLanguage ? (char.role_co || char.role) : char.role
            characterDescription.innerHTML = `
            <p>${description}</p>
            <span class="role">${role}</span>
            `
        }
    }

    updateDescription()

    // Gestion du switch de langue
    const languageSwitch = modal.querySelector('#characterLanguageSwitch')
    const flagFirst = modal.querySelector('#flagFirst')
    const flagSecond = modal.querySelector('#flagSecond')

    // Fonction pour mettre à jour les styles des drapeaux
    const updateFlagsStyle = () => {
        if (isSecondLanguage) {
            flagFirst.style.opacity = '0.3'
            flagFirst.style.filter = 'grayscale(100%)'
            flagSecond.style.opacity = '1'
            flagSecond.style.filter = 'grayscale(0%)'
        } else {
            flagFirst.style.opacity = '1'
            flagFirst.style.filter = 'grayscale(0%)'
            flagSecond.style.opacity = '0.3'
            flagSecond.style.filter = 'grayscale(100%)'
        }
    }

    // Style initial des drapeaux
    updateFlagsStyle()

    // Clic sur les drapeaux pour changer la langue
    flagFirst.addEventListener('click', () => {
        if (isSecondLanguage) {
            languageSwitch.checked = false
            isSecondLanguage = false
            updateDescription()
            updateFlagsStyle()
        }
    })

    flagSecond.addEventListener('click', () => {
        if (!isSecondLanguage) {
            languageSwitch.checked = true
            isSecondLanguage = true
            updateDescription()
            updateFlagsStyle()
        }
    })

    languageSwitch.addEventListener('change', () => {
        isSecondLanguage = languageSwitch.checked
        updateDescription()
        updateFlagsStyle()
    })
}

function closeCharacterDetail(skipNavigate = false) {
    if (isClosingCharacterDetail) {
        return
    }
    isClosingCharacterDetail = true

    if (characterDetailOverlay) {
        if (!skipNavigate) {
            navigate('univers-prosa/encyclopedie', () => charactersView(true))
        }
        characterDetailOverlay.remove()
        characterDetailOverlay = null
    }

    isClosingCharacterDetail = false
}