import { players } from "./initGame.js";
import { loadCurrentStepData, stepsData } from "./loadData.js";
import { choiceView } from "./views/actions/choiceView.js";
import { dialogView } from "./views/actions/dialogView.js";
import { endView } from "./views/actions/endView.js";
import { gameView } from "./views/actions/gameView.js";
import { riddleView } from "./views/actions/riddleView.js";
import { menuView } from "./views/main/menuView.js";
import { setLanguage } from "./langageManager.js";
import { aleasRiddleView } from "./views/actions/aleasRiddleView.js";
import { tokenView } from "./views/actions/tokenView.js";
import { navigate } from "../router.js";

let activePlayerId
export let activePlayer
export let activeStepId
export let activeStep

/**
 * Fonction 
 * @param  {[number]} playerIndex Joueur actif, issue de l'objet "players"
 */
export function setActivePlayer(playerIndex) {
    activePlayerId = playerIndex
    activePlayer = players[playerIndex]
    if (activePlayer && activePlayer.language) {
        setLanguage(activePlayer.language)
    } else {
        setLanguage('fr')
    }
}

export function unsetActivePlayer() {
    activePlayerId = null
    activePlayer = null
    setLanguage('fr')
}

/**
 * Fonction recherche d'étape. Retourne l'ID de l'étape complete a appeler avec variante si elle existe.
 * @param  {[number]} stepId Numéro d'étape entré au clavier (00)
 */
export async function checkStepExist(stepId) {
    //Check if there is an unlocked step for the current player
    console.log(activePlayer)
    const unlockedStepId = activePlayer.unlockedSteps?.[stepId]

    //Search for the full step ID with unlocked step, or default to base step with variant 0
    const searchId = unlockedStepId || `${stepId}0`
    console.log(searchId, unlockedStepId, activePlayer)
    if (searchId in stepsData[activePlayer.localisation]) {
        console.log("Found step ", searchId)
        //Return the ID that will be called
        return searchId
    } else {
        console.log("Step ID returned: ", false)
        return false
    }
}

/**
 * Fonction début d'étape
 * @param  {[number]} fullStepId Numéro d'étape appelé  
 */
export async function startStep(fullStepId, specialStep = false) {
    console.log(activePlayer)
    console.log(players)

    //Re-Check if the step exist in the database
    if (fullStepId in stepsData[activePlayer.localisation]) {
        if (!specialStep) {
            //Truncate the full step ID to get the base step ID (without variant) for data reference
            activeStepId = fullStepId.substring(0, 2)
        } else {
            activeStepId = fullStepId
        }
        //Set the active step data
        activeStep = stepsData[activePlayer.localisation][fullStepId];

        await loadCurrentStepData()
        //Call the action from the selected step
        console.log(`Loading step ${fullStepId}`)
        navigate('jeu/etape', () => callAction(activeStep.actionType, activeStep.action))
    } else {
        console.error(`Step not found: ${fullStepId}`);
        return;
    }
}

/**
 * Fonction d'appel d'action
 * @param  {'dialog'|'choice'|'riddle'|'game'|'ar'|'end'|'aleasRiddle'} actionType Type d'action appelé.
 * @param  {[number]} action Numéro d'action appelé pour l'étape active
 */
export function callAction(actionType, action = null) {
    console.log("Calling action", actionType, action)

    switch (actionType) {
        case "dialog":
            dialogView(action);
            break;
        case "choice":
            choiceView(action);
            break;
        case "riddle":
            riddleView(action);
            break;
        case "game":
            gameView(action);
            break;
        case "token":
            tokenView(action);
            break;
        case "ar":
            break;
        case "end":
            endView(action)
            break;
        case "aleasRiddle":
            aleasRiddleView();
            break;
        case "special_end":
            startStep(actionType, action)
            break;
        default:
            console.error(`Incorrect data: action type ${actionType} doesn't exist for action ${activeStepId}`)
            menuView()
            break;
    }
}

export function addUnlockedStep(stepId, unlockedStepId) {
    if (activePlayer.unlockedSteps[stepId] !== unlockedStepId) {
        activePlayer.unlockedSteps[stepId] = unlockedStepId
        console.log(`Unlocked step ${unlockedStepId} for step ${stepId}`)
    }
    updatePlayerLocalStorage()
}

export function changePlayerLocalisation(localisation) {
    players[activePlayerId].localisation = localisation
    console.log(`Player localisation changed for player ID ${activePlayerId} to localisation ${localisation}`)
    console.log(players)
    updatePlayerLocalStorage()
}

function updatePlayerLocalStorage() {
    localStorage.setItem('playersData', JSON.stringify(players));
    console.log("Player data saved")
}

