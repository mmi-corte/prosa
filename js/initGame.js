import { charactersData, fetchAleasRiddles, fetchCharacters, fetchSteps } from "./loadData.js";

export let playerCharactersData
export let players = {}
export let gameInitialized = false
export let globalDifficulty
export let difficultyState
export let playedDialogs
export let riddleGameSeed = 0

function hashString(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRiddleGameSeed() {
  const values = new Uint32Array(1)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values)
    return values[0] >>> 0
  }
  return ((Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 || 1
}

function ensureRiddleGameSeed() {
  const stored = Number(localStorage.getItem('riddleGameSeed'))
  if (!Number.isFinite(stored) || stored <= 0) {
    riddleGameSeed = createRiddleGameSeed()
    localStorage.setItem('riddleGameSeed', String(riddleGameSeed))
  } else {
    riddleGameSeed = stored >>> 0
  }
  return riddleGameSeed
}

/** Pick a riddle index that varies per player and per game session. */
export function chooseRiddleIndex(count, key = '', playerIndex = 0) {
  const total = Math.max(0, Number(count) || 0)
  if (total <= 1) return 0
  return (riddleGameSeed + hashString(String(key)) + Math.max(0, playerIndex)) % total
}

/** Read and parse a JSON value from localStorage without ever throwing. */
function readStoredJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch (error) {
    console.warn(`Discarding invalid localStorage value for "${key}"`, error)
    localStorage.removeItem(key)
    return fallback
  }
}

export async function initGame() {
    //Load characters data if not already loaded
    if (!charactersData || Object.keys(charactersData).length === 0) {
        await fetchCharacters()
    }

    //Check if there is game data
    const storedPlayers = readStoredJson('playersData')
    const storedDifficulty = Number(localStorage.getItem('globalDifficulty'))
    const storedDifficultyState = Number(localStorage.getItem('difficultyState'))

    const validDifficulty = Number.isFinite(storedDifficulty) && storedDifficulty > 0
    const validDifficultyState = Number.isFinite(storedDifficultyState) && storedDifficultyState >= 0
    // Player data is saved as an array of player objects by savePlayerData().
    // Accept both arrays and legacy keyed maps so a completed character
    // selection is correctly restored as an initialized game.
    const validPlayers = storedPlayers && typeof storedPlayers === 'object' &&
        (Array.isArray(storedPlayers)
            ? storedPlayers.length > 0
            : Object.keys(storedPlayers).length > 0)

    if (validPlayers && validDifficulty && validDifficultyState) {
        console.log("Found stored game data, initializing game with saved data...")
        //Store the global players data
        players = storedPlayers;

        //Store the global difficulty and the difficulty state
        globalDifficulty = storedDifficulty
        difficultyState = storedDifficultyState

        //Set the global initialized state to true
        gameInitialized = true

        //If the game is loaded, fetch the steps JSON, aleas riddles and tracked dialogs
        await fetchSteps()
        await fetchAleasRiddles()
        playedDialogs = readStoredJson('playedDialogs', {})
        ensureRiddleGameSeed()
        console.log("Successfully loaded player data from storage.", players);
        return true
    } else {
        // Discard partial/corrupt saves so every launch doesn't repeat the failure.
        localStorage.removeItem('playersData')
        localStorage.removeItem('globalDifficulty')
        localStorage.removeItem('difficultyState')
        localStorage.removeItem('riddleGameSeed')
        console.log("No valid stored game data found.")
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
    difficultyState = Math.max(0, (difficultyState ?? 0) - 1)
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
    // Only remove game data - settings and UI preferences must survive a new game.
    players = {}
    localStorage.removeItem('playersData')

    //Reset played dialogs
    playedDialogs = {}
    localStorage.removeItem('playedDialogs')

    //Reset difficulty indicator
    localStorage.removeItem('globalDifficulty')
    localStorage.removeItem('difficultyState')
    localStorage.removeItem('riddleGameSeed')
    globalDifficulty = null
    difficultyState = null
    riddleGameSeed = 0

    //Reset global game state
    gameInitialized = false
}

export function trackDialog(localisation, stepId, dialogId) {
    if (!playedDialogs) {
        playedDialogs = {}
    }
    // Initialize localisation if needed
    if (!playedDialogs[localisation]) {
        playedDialogs[localisation] = {}
    }
    // Initialize stepId array if needed
    if (!playedDialogs[localisation][stepId]) {
        playedDialogs[localisation][stepId] = []
    }
    // Add dialogId if not already tracked
    if (!playedDialogs[localisation][stepId].includes(dialogId)) {
        playedDialogs[localisation][stepId].push(dialogId)
        localStorage.setItem('playedDialogs', JSON.stringify(playedDialogs))
        console.log('Dialog tracked:', { localisation, stepId, dialogId }, 'Current playedDialogs:', playedDialogs)
    }
}
