// Local Storage (par joueur)
// previousAction
// currentAction
// checkpointStep
// playerLocalisation
// nextStepVariant

import { dialogsHandler } from "./dialogsHandler.js";

//DEBUG
let playerLocalisation = 1;
let nextStepVariant = 0;
// DEBUG

const startStepButton = document.getElementById("startStepButton")
startStepButton.addEventListener("click", function () {
    startStep(1, 1)
})

let activeStep = "";

export let stepsData = [];
export let dialogsData = [];
async function initGameData() {

    //Init stepVariant localstorage
    localStorage.setItem('nextStepVariant', 0)

    try {
        const response = await fetch('./data/steps.json');
        if (!response.ok) throw new Error('Failed to load steps data');

        // Store data in memory for instant access later
        stepsData = await response.json();
        console.log("Game data loaded:", stepsData.length, "steps.");
    } catch (error) {
        console.error("Critical: Could not load steps data", error);
    }

    try {
        const response = await fetch('./data/dialogs.json');
        if (!response.ok) throw new Error('Failed to load dialogs data');

        // Store data in memory for instant access later
        dialogsData = await response.json();
        console.log("Game data loaded:", dialogsData.length, "dialogs.");
    } catch (error) {
        console.error("Critical: Could not load dialogs data", error);
    }
}
initGameData();

function startStep(step, subStep) {
    // playerLocalisation: défini en localStorage en début de jeu
    // step: Input, issu de la case du plateau
    // subStep: Input, issu de la case du plateau
    // nextStepVariant: défini en localStorage par l'action précédente

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

//Fonction d'appel 
export function callAction(actionType, action) {
    console.log("Calling action", actionType, action)

    switch (actionType) {
        case "dialog":
            dialogsHandler(action);
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
            console.log("Avancez à la case",activeStep.endStepContinue, ", mais continuez votre tour", )
            break;
    }
}



