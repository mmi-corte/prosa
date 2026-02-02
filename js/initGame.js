import { fetchSteps } from "./loadData.js";

export let playerCharactersData
export let players = {}
export let gameInitialized = false

export async function initGame() {
    const storedPlayers = localStorage.getItem('playersData');

    if (storedPlayers) {
        players = JSON.parse(storedPlayers);
        await fetchSteps()
        gameInitialized = true
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

export function resetGame() {
    players = null
    gameInitialized = false
    localStorage.clear('playersData')
}
