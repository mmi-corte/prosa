import { clearContainer, gameContainer } from "../../../app.js";
import { navigate } from "../../../router.js";
import { showBackButton } from "../components/backButton.js";
import { charactersData, fetchCharactersDetails } from "../../loadData.js";

let characterDetailOverlay
let isClosingCharacterDetail = false
let charactersDetails

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

    const regionToggle = document.getElementById('regionToggle')
    const charactersRegionLabel = document.getElementById('charactersRegionLabel')

    const applyRegionFilter = () => {
        if (!charactersData || Object.keys(charactersData).length === 0) return

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

        const filtered = Object.entries(charactersData).filter(([, char]) => {
            if (char.isNarrativeOnly) return false
            const region = (char.region || '').toString().toUpperCase()
            return region === selectedRegion
        })
        renderCharactersGrid(filtered)
    }
    async function loadCharacters() {
        try {
            charactersDetails = await fetchCharactersDetails();
            if (!charactersDetails) {
                throw new Error('Failed to load characters details data');
            }

            console.log("Characters data loaded:", Object.keys(charactersData || {}).length, "characters.");

            // Render grid
            applyRegionFilter()
        } catch (error) {
            console.error("Critical: Could not load characters data", error);
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

function renderCharactersGrid(charactersEntries) {
    const charactersGrid = document.getElementById('charactersGrid')
    charactersGrid.innerHTML = ""

    charactersEntries.forEach(([key, char]) => {
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

        if (char.arEnabled) {
            const arBadge = document.createElement('div')
            arBadge.className = "character-card-ar-badge"
            arBadge.title = "Expérience AR disponible"
            arBadge.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><circle cx="12" cy="12" r="2"/></svg> AR`
            card.appendChild(arBadge)
        }

        card.addEventListener("click", () => navigate('univers-prosa/encyclopedie-details', () => goToCharacterDetail(key, char)))
        charactersGrid.appendChild(card)
    })
}

function goToCharacterDetail(key, char) {
    characterDetailOverlay = document.createElement('div')
    characterDetailOverlay.classList.add('modal-overlay')

    const modal = document.createElement('div')
    modal.classList.add('character-detail-content')

    modal.innerHTML = `
        <div class="character-detail-media-block">
            <div class="character-card-large" id="characterCardLarge">
                <div class="character-image-frame">
                    <img src="" alt="L'ORCU" id="characterDetailImage" class="character-detail-img">
                </div>
                <div class="character-name-row character-name-row--switch">
                    <h2 class="character-name" id="characterDetailName"></h2>
                    <div class="character-language-switch character-language-switch--inline">
                        <img src="" alt="" class="language-flag" id="flagFirst">
                        <label class="switch-toggle">
                            <input type="checkbox" id="characterLanguageSwitch">
                            <span class="toggle-slider"></span>
                        </label>
                        <img src="" alt="" class="language-flag" id="flagSecond">
                    </div>
                </div>
                ${char.arEnabled ? `
                <button class="character-ar-button" id="characterARButton" title="Voir en Réalité Augmentée">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                        <circle cx="12" cy="12" r="2"/>
                    </svg>
                    <span>AR</span>
                </button>` : ''}
            </div>
        </div>

        <div class="character-detail-text-block">
            <div class="character-description" id="characterDescription"></div>
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
        const videoWrapper = document.createElement('div')
        videoWrapper.className = 'character-video-wrapper'
        
        const video = document.createElement('video')
        video.src = `./assets/characters/${detailMediaPath}`
        video.muted = false
        video.loop = true
        video.controls = false
        video.autoplay = true
        video.playsInline = true
        video.setAttribute('aria-label', char.name)
        
        // Créer les contrôles personnalisés
        const controls = document.createElement('div')
        controls.className = 'custom-video-controls'
        controls.innerHTML = `
            <button class="video-play-btn" aria-label="Play/Pause">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </button>
            <div class="video-progress">
                <div class="video-progress-bar"></div>
                <input type="range" class="video-progress-slider" min="0" max="100" value="0" aria-label="Progress">
            </div>
            <div class="video-time">
                <span class="video-current-time">0:00</span>
                <span class="video-duration">0:00</span>
            </div>
            <button class="video-volume-btn" aria-label="Mute/Unmute">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
            </button>
            <input type="range" class="video-volume-slider" min="0" max="100" value="100" aria-label="Volume">
            <button class="video-fullscreen-btn" aria-label="Fullscreen">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            </button>
        `
        
        videoWrapper.appendChild(video)
        videoWrapper.appendChild(controls)
        characterDetailImage.replaceWith(videoWrapper)
        
        // Gérer les contrôles personnalisés
        const playBtn = controls.querySelector('.video-play-btn')
        const progressSlider = controls.querySelector('.video-progress-slider')
        const currentTimeSpan = controls.querySelector('.video-current-time')
        const durationSpan = controls.querySelector('.video-duration')
        const volumeBtn = controls.querySelector('.video-volume-btn')
        const volumeSlider = controls.querySelector('.video-volume-slider')
        const fullscreenBtn = controls.querySelector('.video-fullscreen-btn')
        
        playBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play()
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>'
            } else {
                video.pause()
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
            }
        })
        
        video.addEventListener('loadedmetadata', () => {
            durationSpan.textContent = formatTime(video.duration)
            progressSlider.max = video.duration
        })
        
        video.addEventListener('timeupdate', () => {
            currentTimeSpan.textContent = formatTime(video.currentTime)
            progressSlider.value = video.currentTime
        })
        
        progressSlider.addEventListener('input', (e) => {
            video.currentTime = e.target.value
        })
        
        volumeSlider.addEventListener('input', (e) => {
            video.volume = e.target.value / 100
            updateVolumeIcon()
        })
        
        volumeBtn.addEventListener('click', () => {
            if (video.muted) {
                video.muted = false
                volumeSlider.value = video.volume * 100
            } else {
                video.muted = true
                volumeSlider.value = 0
            }
            updateVolumeIcon()
        })
        
        const updateVolumeIcon = () => {
            if (video.muted || video.volume === 0) {
                volumeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C23.16 14.88 24 13.53 24 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-11-5L5.41 5 4 6.41 17.59 20 19 18.59 12 11.59V3H8.59L7 4.41 8 5.41v6.59z"/></svg>'
            } else if (video.volume < 0.5) {
                volumeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>'
            } else {
                volumeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>'
            }
        }
        
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                videoWrapper.requestFullscreen().catch(err => console.log(err))
            } else {
                document.exitFullscreen()
            }
        })
        
        video.addEventListener('play', () => {
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>'
        })
        
        video.addEventListener('pause', () => {
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        })
        
        updateVolumeIcon()
    } else {
        characterDetailImage.src = `./assets/characters/${detailMediaPath}`
        characterDetailImage.alt = `Illustration ${char.name}`
    }
    characterDetailName.textContent = char.name

    // AR Button - Link to WebXR experience
    const arButton = modal.querySelector('#characterARButton')
    if (arButton) {
        arButton.addEventListener('click', () => {
            window.location.href = `./AR/immersif/index.html?character=${key}`
        })
    }

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

    const detail = (charactersDetails && charactersDetails[key]) || {}

    // État de la langue (false = première langue, true = deuxième langue)
    let isSecondLanguage = false

    const updateDescription = () => {
        if (isProvencal) {
            // Personnage provençal: basculer entre corse et provençal
            const description = isSecondLanguage ? (detail.description_co || detail.description) : detail.description
            const role = isSecondLanguage ? (detail.role_co || detail.role) : detail.role
            characterDescription.innerHTML = `
            <p>${description}</p>
            <span class="role">${role}</span>
            `
        } else {
            // Personnage corse: basculer entre français et corse
            const description = isSecondLanguage ? (detail.description_co || detail.description) : detail.description
            const role = isSecondLanguage ? (detail.role_co || detail.role) : detail.role
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

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
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