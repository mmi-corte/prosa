// Local Storage (par joueur)
// previousAction
// currentAction
// checkpointStep
// playerLocalisation
// nextStepVariant

//import { dialogsHandler } from "./dialogsHandler.js";
//import { initGameSetup } from "./js/display/setupScreen.js";

// ==========================================
// ====== Fonction clear gameContainer ======
// ==========================================
export const gameContainer = document.getElementById('gameContainer')
export function clearContainer(gameContainer) {
    const element = document.getElementById('gameContainer')
    element.innerHTML = ""
}

let activeStep = "";

export const getGameContainer = () => document.getElementById('gameContainer');


// ===================================
// ====== Initialisation du jeu ======
// ===================================
export let stepsData = [];
export let dialogsData = [];

async function initGameData() {

    try {
        const response = await fetch('../../data/steps.json');
        if (!response.ok) throw new Error('Failed to load steps data');

        // Store data in memory for instant access later
        stepsData = await response.json();
        console.log("Game data loaded:", stepsData.length, "steps.");
    } catch (error) {
        console.error("Critical: Could not load steps data", error);
    }

    try {
        const response = await fetch('../../data/dialogs.json');
        if (!response.ok) throw new Error('Failed to load dialogs data');

        // Store data in memory for instant access later
        dialogsData = await response.json();
        console.log("Game data loaded:", dialogsData.length, "dialogs.");
    } catch (error) {
        console.error("Critical: Could not load dialogs data", error);
    }

    //Init default stepVariant localstorage
    localStorage.setItem('nextStepVariant', 0)

    //Enabled the buttons
    const stepInput = document.getElementById("stepInput")
    const subStepInput = document.getElementById("subStepInput")
    const startStepButton = document.getElementById("startStepButton")

    stepInput.style.display = "block"
    subStepInput.style.display = "block"
    startStepButton.style.display = "block"

    startStepButton.addEventListener("click", () => {
        startStep(stepInput.value, subStepInput.value)
    })
}
initGameData()

// ====================================
// ====== Fonction début d'étape ======
// ====================================
export function startStep(step, subStep) {
    // playerLocalisation: défini en localStorage en début de jeu
    // step: Input, issu de la case du plateau
    // subStep: Input, issu de la case du plateau
    // nextStepVariant: défini en localStorage par l'action précédente

    const playerLocalisation = localStorage.getItem('playerLocalisation')
    const nextStepVariant = localStorage.getItem('nextStepVariant')

    const searchId = `${playerLocalisation}${step}${subStep}${nextStepVariant}`;
    console.log("Loading step:", searchId)

    // Récupération des données de l'étape
    activeStep = stepsData.find(item => item.id === searchId);
    if (!activeStep) {
        console.error(`Step not found: ${searchId}`);
        return;
    }

    //Lancement de l'action correspondante
    const { actionType, action } = activeStep;
    callAction(actionType, action)
}


// =======================================
// ====== Fonction d'appel d'action ======
// =======================================
// export function callAction(actionType, action) {
//     console.log("Calling action", actionType, action)

//     switch (actionType) {
//         case "dialog":
//             dialogsHandler(action);
//             break;
//         case "game":
//             break;
//         case "ar":
//             break;
//         case "end":
//             endStep(action)
//             break;
//     }
// }

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



