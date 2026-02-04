import { gameContainer } from "../../../../app.js";
import { fetchPlayerCharacters } from "../../../loadData.js";
import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { playerCountView } from "./playerCountView.js";
import { playerSubmitView } from "./playerSubmitView.js";
import { getTranslation, setLanguage } from "../../../langageManager.js";

let charactersData
let currentPlayerIndex
let detailContainer

let selectedPlayers = []

export async function characterSelectView(playerCount) {
    console.log(playerCount)
    clearInitContainer()
    initContainer.classList.add('initScreen2');

    currentPlayerIndex = 0
    charactersData = await fetchPlayerCharacters()

    //Create a temporary player array base on the player count input
    if (playerCount >= 2 && playerCount <= 6) {

        // Only reset if the count is different to avoid wiping data
        if (selectedPlayers.length !== playerCount) {
            selectedPlayers = []; // Reset array

            for (let i = 0; i < playerCount; i++) {
                selectedPlayers[i] = {
                    character: 0,
                    localisation: 0,
                    unlockedSteps: {},
                    language: 'fr'
                };
            }
            console.log(`${playerCount} players initialized.`);
            renderCharacterGrid()
        } else {
            renderCharacterGrid()
        }

    } else {
        console.error("Critical: Invalid player count");
        playerCountView() //Reset the player count screen
    }

    renderCharacterGrid()
}

function renderCharacterGrid() {
    initContainer.innerHTML = null
    initTextContainer.innerHTML = `Joueur <span class="playerNumber">${currentPlayerIndex + 1}</span>, choisissez votre personnage`;

    // Define the two regions
    const regions = [
        { id: "1", name: "Corte" },
        { id: "2", name: "Toulon" }
    ];

    //Show the sections for each region
    regions.forEach(region => {
        const regionSection = document.createElement('div');
        regionSection.classList.add('locationSection');
        initContainer.appendChild(regionSection);

        const title = document.createElement('p');
        title.innerText = region.name;
        regionSection.appendChild(title);

        const charactersGrid = document.createElement('div');
        charactersGrid.classList.add('characterGrid');
        regionSection.appendChild(charactersGrid);

        // Show characters for the current region
        charactersData[region.id].forEach((character, characterIndex) => {

            const btn = document.createElement('button');
            const isTaken = Object.values(selectedPlayers).some(p => p.character === characterIndex && p.localisation === parseInt(region.id));

            if (isTaken) {
                btn.classList.add('is-taken');
                btn.disabled = true; // Prevents clicking
            }

            if (character.image) {
                btn.style.backgroundImage = `linear-gradient(0deg, rgba(0, 0, 0, 0.69) 0%, rgba(0, 0, 0, 0) 58%), url(./assets/playersCharacters/${character.image})`
                btn.style.backgroundPosition = 'center, top center'
                btn.style.backgroundSize = 'cover, cover'
            }
            btn.innerHTML = character.name

            btn.addEventListener('click', () => {
                showCharacterDetails(region.id, characterIndex)
            });

            charactersGrid.appendChild(btn);
        });
    });
};

//Display the character details on character click
function showCharacterDetails(regionId, characterId) {
    detailContainer = document.createElement('div')
    detailContainer.classList.add('detailContainer')
    gameContainer.appendChild(detailContainer)

    // Bouton retour modal
    const backButton = document.createElement('button');
    backButton.classList.add('back-btn-circle');
    backButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `
    backButton.addEventListener('click', () => {
        detailContainer.classList.remove('show')
        setTimeout(() => closeCharacterDetail(), 300)
    })

    //Character Picture
    const characterPicture = document.createElement('img')
    characterPicture.src = `./assets/playersCharacters/${charactersData[regionId][characterId].image}`

    //Character name
    const characterName = document.createElement('p')
    characterName.classList.add('characterName')
    characterName.innerText = charactersData[regionId][characterId].fullName

    //Character name and description
    const characterDescription = document.createElement('p')
    characterDescription.classList.add('characterDescription')
    const descriptionSource = charactersData[regionId][characterId].description
    const updateDescription = () => {
        characterDescription.innerText = getTranslation(descriptionSource)
    }
    updateDescription()

    // Language switch (per player)
    const switchRow = document.createElement('div')
    switchRow.classList.add('character-language-row')

    const switchWrapper = document.createElement('label')
    switchWrapper.classList.add('language-switch')

    const frLabel = document.createElement('span')
    frLabel.classList.add('language-label')
    const frFlag = document.createElement('img')
    frFlag.src = './assets/drapeau/france.png'
    frFlag.alt = 'Drapeau France'
    frFlag.style.width = '1.5em'
    frFlag.style.height = '1.5em'
    frFlag.style.objectFit = 'contain'
    frLabel.appendChild(frFlag)

    const languageSwitch = document.createElement('input')
    languageSwitch.type = 'checkbox'
    languageSwitch.setAttribute('aria-label', 'Basculer la langue entre FR et Corse')

    const slider = document.createElement('span')
    slider.classList.add('language-slider')

    const corLabel = document.createElement('span')
    corLabel.classList.add('language-label')
    const corFlag = document.createElement('img')
    corFlag.src = './assets/drapeau/bandera.png'
    corFlag.alt = 'Drapeau Corse'
    corFlag.style.width = '1.5em'
    corFlag.style.height = '1.5em'
    corFlag.style.objectFit = 'contain'
    corLabel.appendChild(corFlag)

    switchWrapper.append(frLabel, languageSwitch, slider, corLabel)

    // Initialize switch from current player's language
    const currentLang = selectedPlayers[currentPlayerIndex]?.language || 'fr'
    languageSwitch.checked = currentLang === 'cor'
    setLanguage(currentLang)
    updateDescription()

    languageSwitch.addEventListener('change', () => {
        const newLang = languageSwitch.checked ? 'cor' : 'fr'
        selectedPlayers[currentPlayerIndex].language = newLang
        setLanguage(newLang)
        updateDescription()
        updateSubmitLabel()
    })

    switchRow.append(switchWrapper)

    const submitButton = document.createElement('button')
    submitButton.classList.add("btn-primary")
    const submitLabel = {
        fr: "Choisir ce personnage",
        cor: "Sceglie stu persunagiu"
    }
    const updateSubmitLabel = () => {
        submitButton.innerText = getTranslation(submitLabel)
    }
    updateSubmitLabel()

    submitButton.addEventListener('click', () => {
        addPlayer(regionId, characterId)
    })

    detailContainer.append(backButton, characterPicture, characterName, switchRow, characterDescription, submitButton)
    setTimeout(() => detailContainer.classList.add("show"), 10)
}

//Add selected player to the temporary player array
function addPlayer(regionId, characterId) {
    selectedPlayers[currentPlayerIndex].localisation = parseInt(regionId)
    selectedPlayers[currentPlayerIndex].character = parseInt(characterId)

    currentPlayerIndex += 1

    if (currentPlayerIndex < selectedPlayers.length) {
        closeCharacterDetail()
        renderCharacterGrid()
    } else {
        // Vérifier l'équilibre entre les régions avant de continuer
        if (checkRegionBalance()) {
            closeCharacterDetail()
            playerSubmitView(selectedPlayers)
        } else {
            // Fermer d'abord la page de détails, puis afficher le popup d'erreur
            closeCharacterDetail()
            showBalanceErrorPopup()
        }
    }
}

// Vérifier l'équilibre entre Corte (1) et Toulon (2)
function checkRegionBalance() {
    const corteCount = selectedPlayers.filter(p => p.localisation === 1).length
    const toulonCount = selectedPlayers.filter(p => p.localisation === 2).length
    const totalPlayers = selectedPlayers.length
    
    // Pour un nombre pair : moitié chaque
    // Pour un nombre impair : maximum 1 de différence
    const maxDifference = totalPlayers % 2 === 0 ? 0 : 1
    const difference = Math.abs(corteCount - toulonCount)
    
    console.log(`Corte: ${corteCount}, Toulon: ${toulonCount}, Diff: ${difference}, Max allowed: ${maxDifference}`)
    
    return difference <= maxDifference
}

// Afficher le popup d'erreur d'équilibre
function showBalanceErrorPopup() {
    const totalPlayers = selectedPlayers.length
    const corteCount = selectedPlayers.filter(p => p.localisation === 1).length
    const toulonCount = selectedPlayers.filter(p => p.localisation === 2).length
    
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
            <button class="btn-primary" id="resetSelectionBtn">Recommencer la sélection</button>
        </div>
    `
    
    document.body.appendChild(modalOverlay)
    
    document.getElementById('resetSelectionBtn').addEventListener('click', () => {
        modalOverlay.remove()
        // Réinitialiser toutes les sélections
        currentPlayerIndex = 0
        for (let i = 0; i < selectedPlayers.length; i++) {
            selectedPlayers[i].character = 0
            selectedPlayers[i].localisation = 0
        }
        renderCharacterGrid()
    })
}

function closeCharacterDetail() {
    if (detailContainer && detailContainer.parentNode) {
        detailContainer.remove()
    }
}

