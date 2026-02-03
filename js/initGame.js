import { fetchSteps } from "./loadData.js";
import { resetDifficultyIndicator, updateDifficultyIndicator } from "./views/components/difficultyIndicator.js";

export let playerCharactersData
export let players = {}
export let gameInitialized = false
export let globalDifficulty
export let difficultyState

export async function initGame() {
    const storedPlayers = localStorage.getItem('playersData');
    const storedDifficulty = localStorage.getItem('globalDifficulty')
    const storedDifficultyState = localStorage.getItem('difficultyState')

    if (storedPlayers && storedDifficulty && storedDifficultyState) {
        //Store the global players data
        players = JSON.parse(storedPlayers);

        //Store the global difficulty and the difficulty state
        globalDifficulty = parseInt(storedDifficulty, 10)
        difficultyState = parseInt(storedDifficultyState, 10)
        updateDifficultyIndicator()

        //Set the global initialized state to true
        gameInitialized = true

        //If the game is loaded, fetch the steps JSON
        await fetchSteps()
        console.log("Successfully loaded player data from storage.", players);
        return true
    } else {
        return false;
    }
}

/**
 * Initialise la liste de joueur.
 */
export function savePlayerData(playersSelect) {
    if (playersSelect) {
        localStorage.setItem('playersData', JSON.stringify(playersSelect));

    } else {
        console.error(`Could not save players: no data was provided (${playersSelect})`)
    }
}

/**
 * Initialise la difficuluté.
 */
export function setDifficulty(difficultySelect) {
    if (difficultySelect) {
        globalDifficulty = difficultySelect
        difficultyState = difficultySelect
        localStorage.setItem('globalDifficulty', JSON.stringify(difficultySelect));
        localStorage.setItem('difficultyState', JSON.stringify(difficultySelect));
        updateDifficultyIndicator()
    } else {
        console.error(`Could not save difficulty: no data was provided (${difficultySelect})`)
    }
}

export function resetGame() {
    //Reset players data
    players = null
    localStorage.clear('playersData')

    //Reset difficulty indicator
    localStorage.clear('globalDifficulty')
    localStorage.clear('difficultyState')
    globalDifficulty = null
    difficultyState = null
    resetDifficultyIndicator()

    //Reset global game state
    gameInitialized = false
}
