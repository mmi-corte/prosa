import { players } from "./initGame.js";
import { loadCurrentStepData, stepsData } from "./loadData.js";
import { choiceView } from "./views/actions/choiceView.js";
import { dialogView } from "./views/actions/dialogView.js";
import { endView } from "./views/actions/endView.js";
import { gameView } from "./views/actions/gameView.js";
import { riddleView } from "./views/actions/riddleView.js";
import { menuView } from "./views/main/menuView.js";
import { setLanguage } from "./langageManager.js";

export let activePlayer
export let activeStepId
export let activeStep

/**
 * Fonction 
 * @param  {[number]} playerIndex Joueur actif, issue de l'objet "players"
 */
export function setActivePlayer(playerIndex) {
    activePlayer = players[playerIndex]
    if (activePlayer && activePlayer.language) {
        setLanguage(activePlayer.language)
    } else {
        setLanguage('fr')
    }
}

/**
 * Fonction début d'étape
 * @param  {[number]} step Numéro d'étape appelé
 */
export async function startStep(step) {
    // step: Input, issu de la case du plateau
    const searchId = `${step}${activePlayer.nextStepVariant}`

    //Search if the step exist in the database
    console.log(stepsData)
    console.log(activePlayer)
    if (searchId in stepsData[activePlayer.localisation]) {
        activeStepId = step
        activeStep = stepsData[activePlayer.localisation][searchId];

        await loadCurrentStepData()

        //Call the action from the selected step
        console.log(`Loading step ${step}`)
        callAction(activeStep.actionType, activeStep.action)
    } else {
        console.error(`Step not found: ${step}`);
        return;
    }
}

/**
 * Fonction d'appel d'action
 * @param  {'dialog'|'choice'|'riddle'|'game'|'ar'|'end'} actionType Type d'action appelé.
 * @param  {[number]} action Numéro d'action appelé pour l'étape active
 */
export function callAction(actionType, action) {
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
        case "ar":
            break;
        case "end":
            endView(action)
            break;
        default:
            console.error(`Incorrect data: action type ${actionType} doesn't exist for action ${activeStepId}`)
            menuView()
            break;
    }
}