import { gameContainer } from "../../../../app.js";
import { fetchPlayerCharacters } from "../../../loadData.js";
import { clearInitContainer, initContainer, initPlayerCount, initTextContainer, setInitPlayerCount } from "../initView.js";
import { playerCountView } from "./playerCountView.js";
import { playerSubmitView } from "./playerSubmitView.js";
import { getTranslation, setLanguage } from "../../../langageManager.js";
import { navigate } from "../../../../router.js";
import { showBackButton } from "../../components/backButton.js";

let charactersData
let currentPlayerIndex
let detailContainer

let selectedPlayers = []
let charactersByRegion = {}

let currentInitPlayerCount

export async function characterSelectView() {
    clearInitContainer()
    showBackButton()
    initContainer.classList.add('initScreen2');



    currentPlayerIndex = 0
    charactersData = await fetchPlayerCharacters()

    charactersByRegion = buildCharactersByRegion(charactersData)

    // Si le nombre de joueurs a été modifié, réinitialiser les joueurs sélectionnés
    if (initPlayerCount !== currentInitPlayerCount) {
        console.log('a')
        selectedPlayers = []
        currentInitPlayerCount = initPlayerCount
    }

    //Create a temporary player array base on the player count input
    if (initPlayerCount >= 2 && initPlayerCount <= 6) {
        for (let i = 0; i < initPlayerCount; i++) {
            selectedPlayers[i] = {
                character: 0,
                localisation: 0,
                unlockedSteps: {},
                language: 'fr'
            };
        }
        console.log(`${initPlayerCount} players initialized.`);
        renderCharacterGrid()
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
        const regionCharacters = charactersByRegion[region.id] || []
        regionCharacters.forEach((character) => {

            const btn = document.createElement('button');
            const isTaken = Object.values(selectedPlayers).some(p => p.character === character.id && p.localisation === parseInt(region.id));

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
                navigate('nouvelle-partie/choix-personnage/details', showCharacterDetails(region.id, character.id))

            });

            charactersGrid.appendChild(btn);
        });
    });
};

//Display the character details on character click
function showCharacterDetails(regionId, characterId) {
    const character = charactersData[characterId]
    if (!character) return

    detailContainer = document.createElement('div')
    detailContainer.classList.add('detailContainer')
    initContainer.appendChild(detailContainer)

    //Character Picture
    const characterPicture = document.createElement('img')
    characterPicture.classList.add('characterPicture')
    characterPicture.src = `./assets/playersCharacters/${character.image}`

    //Character name
    const characterName = document.createElement('p')
    characterName.classList.add('characterName')
    characterName.innerText = character.fullName

    //Character name and description
    const characterDescription = document.createElement('p')
    characterDescription.classList.add('characterDescription')
    const descriptionSource = character.description
    const updateDescription = () => {
        characterDescription.innerText = getTranslation(descriptionSource)
    }
    updateDescription()

    // Language switch (per player)
    const switchRow = document.createElement('div')
    switchRow.classList.add('character-language-row', 'character-language-row--inline')

    const frFlag = document.createElement('img')
    frFlag.src = './assets/drapeau/france.png'
    frFlag.alt = 'Français'
    frFlag.style.width = '32px'
    frFlag.style.height = '32px'
    frFlag.style.objectFit = 'contain'
    frFlag.style.cursor = 'pointer'
    frFlag.style.transition = 'opacity 0.3s ease, filter 0.3s ease, transform 0.2s ease'
    frFlag.style.borderRadius = '4px'

    const switchWrapper = document.createElement('label')
    switchWrapper.classList.add('switch-toggle')

    const languageSwitch = document.createElement('input')
    languageSwitch.type = 'checkbox'
    languageSwitch.setAttribute('aria-label', `Basculer la langue entre FR et ${regionId === '2' ? 'Provençal' : 'Corse'}`)

    const slider = document.createElement('span')
    slider.classList.add('toggle-slider')

    const secondFlag = document.createElement('img')
    // Utiliser drapeau provence pour Toulon, corse pour Corte
    const isProvence = regionId === '2'
    secondFlag.src = isProvence ? './assets/drapeau/provence.svg' : './assets/drapeau/bandera.png'
    secondFlag.alt = isProvence ? 'Provençal' : 'Corsu'
    secondFlag.style.width = '32px'
    secondFlag.style.height = '32px'
    secondFlag.style.objectFit = 'contain'
    secondFlag.style.cursor = 'pointer'
    secondFlag.style.transition = 'opacity 0.3s ease, filter 0.3s ease, transform 0.2s ease'
    secondFlag.style.borderRadius = '4px'

    switchWrapper.append(languageSwitch, slider)

    // Initialize switch from current player's language
    const currentLang = selectedPlayers[currentPlayerIndex]?.language || 'fr'
    const secondLanguage = isProvence ? 'prov' : 'cor'
    languageSwitch.checked = currentLang === secondLanguage
    setLanguage(currentLang)
    updateDescription()

    // Fonction pour mettre à jour les styles des drapeaux
    const updateFlagsStyle = () => {
        const isSecondLanguage = languageSwitch.checked
        if (isSecondLanguage) {
            frFlag.style.opacity = '0.3'
            frFlag.style.filter = 'grayscale(100%)'
            secondFlag.style.opacity = '1'
            secondFlag.style.filter = 'grayscale(0%)'
        } else {
            frFlag.style.opacity = '1'
            frFlag.style.filter = 'grayscale(0%)'
            secondFlag.style.opacity = '0.3'
            secondFlag.style.filter = 'grayscale(100%)'
        }
    }

    // Style initial des drapeaux
    updateFlagsStyle()

    // Hover effect on flags
    frFlag.addEventListener('mouseenter', () => {
        if (!languageSwitch.checked) frFlag.style.transform = 'scale(1.1)'
    })
    frFlag.addEventListener('mouseleave', () => {
        frFlag.style.transform = 'scale(1)'
    })

    secondFlag.addEventListener('mouseenter', () => {
        if (languageSwitch.checked) secondFlag.style.transform = 'scale(1.1)'
    })
    secondFlag.addEventListener('mouseleave', () => {
        secondFlag.style.transform = 'scale(1)'
    })

    // Clic sur les drapeaux pour changer la langue
    frFlag.addEventListener('click', () => {
        if (languageSwitch.checked) {
            languageSwitch.checked = false
            const newLang = 'fr'
            selectedPlayers[currentPlayerIndex].language = newLang
            setLanguage(newLang)
            updateDescription()
            updateSubmitLabel()
            updateFlagsStyle()
        }
    })

    secondFlag.addEventListener('click', () => {
        if (!languageSwitch.checked) {
            languageSwitch.checked = true
            const newLang = isProvence ? 'prov' : 'cor'
            selectedPlayers[currentPlayerIndex].language = newLang
            setLanguage(newLang)
            updateDescription()
            updateSubmitLabel()
            updateFlagsStyle()
        }
    })

    languageSwitch.addEventListener('change', () => {
        const newLang = languageSwitch.checked ? (isProvence ? 'prov' : 'cor') : 'fr'
        selectedPlayers[currentPlayerIndex].language = newLang
        setLanguage(newLang)
        updateDescription()
        updateSubmitLabel()
        updateFlagsStyle()
    })

    switchRow.append(frFlag, switchWrapper, secondFlag)

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

    const nameSwitchRow = document.createElement('div')
    nameSwitchRow.classList.add('character-name-row--switch')
    nameSwitchRow.append(characterName, switchRow)

    const mediaBlock = document.createElement('div')
    mediaBlock.classList.add('character-media-block')
    mediaBlock.append(characterPicture, nameSwitchRow)

    const textBlock = document.createElement('div')
    textBlock.classList.add('character-text-block')
    textBlock.append(characterDescription, submitButton)

    detailContainer.append(mediaBlock, textBlock)
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
            history.replaceState({ view: 'nouvelle-partie/choix-personnage' }, "", "#nouvelle-partie/choix-personnage")
            navigate('nouvelle-partie/confirmation', () => playerSubmitView(selectedPlayers))
        } else {
            // Fermer d'abord la page de détails, puis afficher le popup d'erreur
            closeCharacterDetail()
            showBalanceErrorPopup()
        }
    }
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

    initContainer.appendChild(modalOverlay)

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

