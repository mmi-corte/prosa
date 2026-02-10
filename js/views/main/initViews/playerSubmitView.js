import { gameContainer, headerLeft } from "../../../../app.js";
import { gameInitialized, initGame, savePlayerData, globalDifficulty, setDifficulty } from "../../../initGame.js";
import { fetchPlayerCharacters } from "../../../loadData.js";
import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { menuView } from "../menuView.js";
import { characterSelectView } from "./characterSelectView.js";
import { showConfirmationModal } from "../../components/confirmationModal.js";
import { navigate } from "../../../../router.js";

let charactersData
let charactersByRegion = {}

export async function playerSubmitView(selectedPlayers) {
    if (gameInitialized) {
        navigate('menu', menuView(), true)
        return
    }

    if (!selectedPlayers) {
        navigate('nouvelle-partie/choix-personnage', characterSelectView(), false)
        return
    }

    clearInitContainer()
    initContainer.classList.add('initScreen3');

    // Charger les données des personnages
    charactersData = await fetchPlayerCharacters()
    charactersByRegion = buildCharactersByRegion(charactersData)

    // Section difficulté
    const difficultySection = document.createElement('div')
    difficultySection.classList.add('submit-difficulty-section')

    const difficultyLabel = document.createElement('span')
    difficultyLabel.classList.add('submit-difficulty-label')
    difficultyLabel.textContent = 'Difficulté :'

    const difficultyValue = document.createElement('span')
    difficultyValue.classList.add('submit-difficulty-value')
    const currentDifficulty = globalDifficulty || localStorage.getItem('globalDifficulty') || 20
    difficultyValue.textContent = getDifficultyLabel(parseInt(currentDifficulty))

    const changeDifficultyBtn = document.createElement('button')
    changeDifficultyBtn.classList.add('submit-change-btn')
    changeDifficultyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    `

    const handleDifficultyChange = () => {
        showDifficultyModal(selectedPlayers, difficultyValue)
    }

    changeDifficultyBtn.addEventListener('click', handleDifficultyChange)
    difficultySection.addEventListener('click', handleDifficultyChange)

    difficultySection.append(difficultyLabel, difficultyValue, changeDifficultyBtn)
    initContainer.appendChild(difficultySection)

    // Section personnages
    const playersHeader = document.createElement('div')
    playersHeader.classList.add('submit-players-header')

    const playersLabel = document.createElement('span')
    playersLabel.classList.add('submit-players-label')
    playersLabel.textContent = 'Cliquez sur un joueur pour le modifier'

    playersHeader.append(playersLabel)
    initContainer.appendChild(playersHeader)

    // Liste des joueurs (cliquables)
    renderEditablePlayerList(initContainer, selectedPlayers)

    const submitButton = document.createElement('button')
    submitButton.classList.add("btn-primary")
    submitButton.innerText = 'Valider'
    initContainer.appendChild(submitButton)

    submitButton.addEventListener('click', () => {
        // Vérifier l'équilibre avant la validation finale
        if (!checkRegionBalance(selectedPlayers)) {
            showBalanceErrorPopup(selectedPlayers)
            return
        }
        submit(selectedPlayers)
    })
}

function renderEditablePlayerList(container, players) {
    const playerList = document.createElement('div')
    playerList.classList.add('playerList')
    container.appendChild(playerList)

    players.forEach((player, playerIndex) => {
        const character = charactersData[player.character]
        if (!character) return
        const playerCard = document.createElement('button')
        playerCard.classList.add('editable-player-card')
        playerList.appendChild(playerCard)
        playerCard.style.setProperty('--bg-image', `url(./assets/playersCharacters/wide_${character.image})`)

        const textContainer = document.createElement('div')
        playerCard.appendChild(textContainer)

        const playerName = document.createElement('span')
        playerName.innerText = `Joueur ${playerIndex + 1}`

        const characterName = document.createElement('p')
        characterName.innerText = character.name

        textContainer.append(playerName, characterName)

        // Icône de modification
        const editIcon = document.createElement('div')
        editIcon.classList.add('player-edit-icon')
        editIcon.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        `
        playerCard.appendChild(editIcon)

        playerCard.addEventListener('click', () => {
            showCharacterSelectModal(players, playerIndex, playerList)
        })
    })
}

function showCharacterSelectModal(selectedPlayers, playerIndex, playerListEl) {
    const modalOverlay = document.createElement('div')
    modalOverlay.classList.add('modal-overlay')

    const modal = document.createElement('div')
    modal.classList.add('modal-content', 'character-select-modal')

    modal.innerHTML = `
        <h2>JOUEUR ${playerIndex + 1}</h2>
        <p class="modal-subtitle">Choisissez un nouveau personnage</p>
        <div class="region-tabs">
            <button class="region-tab active" data-region="1">Corte</button>
            <button class="region-tab" data-region="2">Toulon</button>
        </div>
        <div class="characters-select-grid" id="charactersSelectGrid"></div>
        <button class="btn-secondary" id="cancelCharacterBtn">Annuler</button>
    `

    modalOverlay.appendChild(modal)
    initContainer.appendChild(modalOverlay)

    const grid = modal.querySelector('#charactersSelectGrid')
    const tabs = modal.querySelectorAll('.region-tab')

    // Fonction pour afficher les personnages d'une région
    const renderRegionCharacters = (regionId) => {
        grid.innerHTML = ''

        const regionCharacters = charactersByRegion[regionId] || []
        regionCharacters.forEach((char) => {
            const isTaken = selectedPlayers.some((p, idx) =>
                idx !== playerIndex && p.character === char.id && p.localisation === parseInt(regionId)
            )

            const charBtn = document.createElement('button')
            charBtn.classList.add('char-select-btn')
            if (isTaken) charBtn.classList.add('taken')

            // Marquer le personnage actuel
            if (selectedPlayers[playerIndex].character === char.id &&
                selectedPlayers[playerIndex].localisation === parseInt(regionId)) {
                charBtn.classList.add('current')
            }

            charBtn.innerHTML = `
                <div class="char-select-img" style="background-image: url('./assets/playersCharacters/${char.image}')"></div>
                <span>${char.name}</span>
            `

            if (!isTaken) {
                charBtn.addEventListener('click', () => {
                    // Mettre à jour le joueur
                    selectedPlayers[playerIndex].character = char.id
                    selectedPlayers[playerIndex].localisation = parseInt(regionId)

                    // Vérifier l'équilibre après la modification
                    if (!checkRegionBalance(selectedPlayers)) {
                        showBalanceErrorPopup(selectedPlayers)
                    }

                    // Rafraîchir la liste
                    playerListEl.innerHTML = ''
                    selectedPlayers.forEach((player, pIdx) => {
                        const refreshedCharacter = charactersData[player.character]
                        if (!refreshedCharacter) return
                        const playerCard = document.createElement('button')
                        playerCard.classList.add('editable-player-card')
                        playerListEl.appendChild(playerCard)
                        playerCard.style.setProperty('--bg-image', `url(./assets/playersCharacters/wide_${refreshedCharacter.image})`)

                        const textContainer = document.createElement('div')
                        playerCard.appendChild(textContainer)

                        const playerName = document.createElement('span')
                        playerName.innerText = `Joueur ${pIdx + 1}`

                        const characterName = document.createElement('p')
                        characterName.innerText = refreshedCharacter.name

                        textContainer.append(playerName, characterName)

                        const editIcon = document.createElement('div')
                        editIcon.classList.add('player-edit-icon')
                        editIcon.innerHTML = `
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        `
                        playerCard.appendChild(editIcon)

                        playerCard.addEventListener('click', () => {
                            showCharacterSelectModal(selectedPlayers, pIdx, playerListEl)
                        })
                    })

                    modalOverlay.remove()
                })
            }

            grid.appendChild(charBtn)
        })
    }

    // Afficher la région actuelle du joueur
    const currentRegion = selectedPlayers[playerIndex].localisation.toString()
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.region === currentRegion)
    })
    renderRegionCharacters(currentRegion)

    // Gestion des onglets
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'))
            tab.classList.add('active')
            renderRegionCharacters(tab.dataset.region)
        })
    })

    // Bouton annuler
    modal.querySelector('#cancelCharacterBtn').addEventListener('click', () => {
        modalOverlay.remove()
    })

    // Fermer en cliquant à l'extérieur
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.remove()
    })
}

function buildCharactersByRegion(data) {
    const regions = { "1": [], "2": [] }

    Object.entries(data)
        .map(([id, character]) => ({ id: parseInt(id, 10), ...character }))
        .sort((a, b) => a.id - b.id)
        .forEach(character => {
            const regionId = String(character.localisation)
            if (!regions[regionId]) regions[regionId] = []
            regions[regionId].push(character)
        })

    return regions
}

function getDifficultyLabel(value) {
    if (value >= 30) return `FACILE (${value})`
    if (value >= 20) return `NORMAL (${value})`
    return `DIFFICILE (${value})`
}

function showDifficultyModal(selectedPlayers, difficultyValueEl) {
    const modalOverlay = document.createElement('div')
    modalOverlay.classList.add('modal-overlay')

    const modal = document.createElement('div')
    modal.classList.add('modal-content', 'difficulty-modal')

    modal.innerHTML = `
        <h2>MODIFIER LA DIFFICULTÉ</h2>
        <div class="difficulty-options">
            <button class="difficulty-option" data-value="30">
                <div class="diff-gauge diff-easy"></div>
                <span>FACILE</span>
            </button>
            <button class="difficulty-option" data-value="20">
                <div class="diff-gauge diff-normal"></div>
                <span>NORMAL</span>
            </button>
            <button class="difficulty-option" data-value="10">
                <div class="diff-gauge diff-hard"></div>
                <span>DIFFICILE</span>
            </button>
        </div>
        <button class="btn-secondary" id="cancelDifficultyBtn">Annuler</button>
    `

    modalOverlay.appendChild(modal)
    initContainer.appendChild(modalOverlay)

    // Sélectionner la difficulté actuelle
    const currentDiff = globalDifficulty || localStorage.getItem('globalDifficulty') || 20
    const currentBtn = modal.querySelector(`[data-value="${currentDiff}"]`)
    if (currentBtn) currentBtn.classList.add('selected')

    // Gestion des clics sur les options
    modal.querySelectorAll('.difficulty-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = parseInt(btn.dataset.value)
            setDifficulty(value)
            difficultyValueEl.textContent = getDifficultyLabel(value)
            modalOverlay.remove()
        })
    })

    // Bouton annuler
    modal.querySelector('#cancelDifficultyBtn').addEventListener('click', () => {
        modalOverlay.remove()
    })

    // Fermer en cliquant à l'extérieur
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.remove()
    })
}

async function submit(selectedPlayers) {
    console.log(selectedPlayers)
    savePlayerData(selectedPlayers)
    await initGame()
    navigate('menu', menuView(), true)
}

// Vérifier l'équilibre entre Corte (1) et Toulon (2)
function checkRegionBalance(players) {
    const corteCount = players.filter(p => p.localisation === 1).length
    const toulonCount = players.filter(p => p.localisation === 2).length
    const totalPlayers = players.length

    // Pour un nombre pair : moitié chaque
    // Pour un nombre impair : maximum 1 de différence
    const maxDifference = totalPlayers % 2 === 0 ? 0 : 1
    const difference = Math.abs(corteCount - toulonCount)

    console.log(`Corte: ${corteCount}, Toulon: ${toulonCount}, Diff: ${difference}, Max allowed: ${maxDifference}`)

    return difference <= maxDifference
}

// Afficher le popup d'erreur d'équilibre
function showBalanceErrorPopup(players, onReset) {
    const totalPlayers = players.length
    const corteCount = players.filter(p => p.localisation === 1).length
    const toulonCount = players.filter(p => p.localisation === 2).length

    const requiredPerRegion = Math.floor(totalPlayers / 2)
    const isOdd = totalPlayers % 2 !== 0

    let message = ''
    if (isOdd) {
        message = `Pour ${totalPlayers} joueurs, vous devez avoir ${requiredPerRegion} ou ${requiredPerRegion + 1} personnages de chaque région.<br><br>Actuellement : <strong>${corteCount} de Corte</strong> et <strong>${toulonCount} de Toulon</strong>.`
    } else {
        message = `Pour ${totalPlayers} joueurs, vous devez avoir exactement ${requiredPerRegion} personnages de Corte et ${requiredPerRegion} de Toulon.<br><br>Actuellement : <strong>${corteCount} de Corte</strong> et <strong>${toulonCount} de Toulon</strong>.`
    }

    const modalOverlay = document.createElement('div')
    modalOverlay.classList.add('modal-overlay')
    modalOverlay.innerHTML = `
        <div class="modal-content balance-error-modal">
            <h2>ÉQUILIBRE REQUIS</h2>
            <p>${message}</p>
            <button class="btn-primary" id="continueEditBtn">Continuer la modification</button>
        </div>
    `

    initContainer.appendChild(modalOverlay)

    document.getElementById('continueEditBtn').addEventListener('click', () => {
        modalOverlay.remove()
    })
}