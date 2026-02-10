import { fetchAleasRiddles, fetchSteps } from "./loadData.js";

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
        console.log("Found stored game data, initializing game with saved data...")
        //Store the global players data
        players = JSON.parse(storedPlayers);

        //Store the global difficulty and the difficulty state
        globalDifficulty = parseInt(storedDifficulty, 10)
        difficultyState = parseInt(storedDifficultyState, 10)

        //Set the global initialized state to true
        gameInitialized = true

        //If the game is loaded, fetch the steps JSON and aleas riddles
        await fetchSteps()
        await fetchAleasRiddles()
        console.log("Successfully loaded player data from storage.", players);
        return true
    } else {
        console.log("No stored game data found.")
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
    } else {
        console.error(`Could not save difficulty: no data was provided (${difficultySelect})`)
    }
}

export function decrementDifficultyState() {
    console.log("Decreasing difficulty state")
    difficultyState += -1
    localStorage.setItem('difficultyState', JSON.stringify(difficultyState));
    
    // Retourner true si le joueur a perdu (batterie à 0)
    return difficultyState <= 0;
}

// Vérifier si la partie est perdue
export function isGameOver() {
    return difficultyState !== null && difficultyState <= 0;
}

/**
 * Réinitialise l'état du jeu.
 */
export function resetGame() {
    //Reset players data
    players = null
    localStorage.clear('playersData')

    //Reset difficulty indicator
    localStorage.clear('globalDifficulty')
    localStorage.clear('difficultyState')
    globalDifficulty = null
    difficultyState = null

    //Reset global game state
    gameInitialized = false
}
