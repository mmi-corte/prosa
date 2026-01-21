import { nextStepVariant, stepsData } from "./initGameData.js";
import { choiceView } from "./views/actions/choiceView.js";
import { dialogView } from "./views/actions/dialogView.js";
import { endView } from "./views/actions/endView.js";
import { gameView } from "./views/actions/gameView.js";
import { riddleView } from "./views/actions/riddleView.js";
import { menuView } from "./views/main/menuView.js";

export let activeStepId
export let activeStep

// ====================================
// ====== Fonction début d'étape ======
// ====================================
export function startStep(step) {
    // step: Input, issu de la case du plateau
    const searchId = `${step}${nextStepVariant}`

    //Search if the step exist in the database
    if (searchId in stepsData) {
        activeStepId = step
        activeStep = stepsData[searchId];

        //Call the action from the selected step
        console.log(`Loading step ${step}`)
        callAction(activeStep.actionType, activeStep.action)
    } else {
        console.error(`Step not found: ${step}`);
        return;
    }
}

// =======================================
// ====== Fonction d'appel d'action ======
// =======================================
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