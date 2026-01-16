import { nextStepVariant, stepsData } from "./initGameData.js";
import { dialogView } from "./views/actions/dialogView.js";

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
            endStep(action)
            break;
    }
}

// ==================================
// ====== Fonction fin d'étape ======
// ==================================
function endStep(action) {
    switch (action) {
        //Avancez à la case X
        case "0":
            console.log("Avancez à la case", activeStep.endStepWin)
            break;

        //Restez à la case X
        case "1":
            console.log("Restez à la case", activeStep.endStepStill)
            break;

        //Reculez à la case X
        case "2":
            console.log("Reculez à la case", activeStep.endStepLoose)
            break;

        //Avancez à la case X, mais continuez votre tour
        case "3":
            console.log("Avancez à la case", activeStep.endStepContinue, ", mais continuez votre tour",)
            break;
    }
}