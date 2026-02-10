import { clearContainer, gameContainer } from "../../../app.js";
import { navigate } from "../../../router.js";
import { gameInitialized, setDifficulty } from "../../initGame.js";
import { difficultyView } from "./initViews/difficultyView.js";

export let wrapper;
export let initTextContainer;
export let initContainer;
export let initPlayerCount = 2
export let initSequence = false
export let initDifficulty
export let selectedPlayers = []

export function initView() {
    //If game already initialized, ignore init sequence
    if (gameInitialized) {
        navigate("menu", () => menuView())
        return
    }

    //For history management, if an init view is called but not finished,
    //check this to redirect to menu instead of the init view
    initSequence = true

    if (initSequence) {
        console.log("Init sequence started")
    }

    clearContainer();

    wrapper = document.createElement('div');
    wrapper.classList.add('initWrapper');
    gameContainer.append(wrapper);

    initTextContainer = document.createElement('p');
    wrapper.appendChild(initTextContainer);

    initContainer = document.createElement('div');
    initContainer.classList.add('initScreen1');
    wrapper.appendChild(initContainer)

    // Load difficulty screen first
    navigate('nouvelle-partie/choix-difficulte', difficultyView())
}

export function clearInitContainer() {
    if (initContainer) {
        initContainer.classList.remove(...initContainer.classList)
        initTextContainer.innerHTML = null
        initContainer.innerHTML = null;
    }
}

export function setInitDifficulty(difficulty) {
    initDifficulty = difficulty
    console.log("Difficulty set to", difficulty)
    setDifficulty(difficulty)
}

export function setInitPlayerCount(count) {
    initPlayerCount = count
    console.log("Player count set to", count)
}

export function setInitPlayers(playerData = null, reset = false) {

    if (reset) {
        selectedPlayers = []
        return
    }

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
    } else {
        console.error("Critical: Invalid player count");
        playerCountView() //Reset the player count screen
    }
}