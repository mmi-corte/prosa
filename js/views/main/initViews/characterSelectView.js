import { gameContainer } from "../../../../app.js";
import { fetchPlayerCharacters } from "../../../loadData.js";
import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { playerCountView } from "./playerCountView.js";
import { playerSubmitView } from "./playerSubmitView.js";

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
                    nextStepVariant: 0
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
                btn.style.backgroundImage = `url(./assets/playersCharacters/${character.image})`
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

    //close button
    const closeButton = document.createElement('button')
    closeButton.classList.add('close-btn', 'close-detail')
    closeButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
    `
    closeButton.addEventListener('click', () => {
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
    characterDescription.innerText = charactersData[regionId][characterId].description

    //submit Button
    const submitButton = document.createElement('button')
    submitButton.classList.add("btn-primary")
    submitButton.innerText = "Choisir ce personnage"

    submitButton.addEventListener('click', () => {
        addPlayer(regionId, characterId)
    })

    detailContainer.append(closeButton, characterPicture, characterName, characterDescription, submitButton)
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
        closeCharacterDetail()
        playerSubmitView(selectedPlayers)
    }
}

function closeCharacterDetail() {
    detailContainer.remove()
}

