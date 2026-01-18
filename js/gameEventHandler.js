import { nextStepVariant, stepsData } from "./initGameData.js";
import { dialogView } from "./views/actions/dialogView.js";
import { endView } from "./views/actions/endView.js";
import { menuView } from "./views/main/menuView.js";

export let activeStep

// ====================================
// ====== Fonction début d'étape ======
// ====================================
export function startStep(step) {
    // step: Input, issu de la case du plateau

    const searchId = `${step}${nextStepVariant}`

    if (searchId in stepsData) {
        activeStep = stepsData[searchId];
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
        case "game":
            break;
        case "ar":
            break;
        case "end":
            endView(action)
            break;
        default:
            console.error(`Incorrect data: action type ${actionType} doesn't exist`)
            menuView()
            break;
    }
}