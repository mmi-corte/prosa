import { activePlayer, activeStepId } from "./gameEventHandler.js";

export let stepsData = []
export let dialogsData = [];
export let choicesData = [];
export let riddlesData = [];
export let gamesData = [];
export let aleasRiddlesData = [];

/**
 * Fonction de chargement des données pour l'étape en cours
 */
export async function loadCurrentStepData() {
    const results = await Promise.all([
        fetchStepsActions('dialogs'),
        fetchStepsActions('choices'),
        fetchStepsActions('riddles'),
        fetchStepsActions('games')
    ]);

    // Destructure the results back into each var
    [dialogsData, choicesData, riddlesData, gamesData] = results;
    console.log(dialogsData)
}

/**
 * Fonction générale de fetch pour données d'étape
 * @param  {'dialogsData'|'choicesData'|'riddlesData'|'gamesData'} resourceName Nom du fichier JSON à appeler
 */
export async function fetchStepsActions(resourceName) {
    try {
        const response = await fetch(`./data/${resourceName}.json`);
        if (!response.ok) throw new Error(`Failed to load ${resourceName} data`);

        const dataFetch = await response.json();

        // data for the current player's location
        const data = dataFetch[activePlayer.localisation][activeStepId];

        // Check to ensure data exists for this localisation
        if (data) {
            console.log(`Game data loaded: ${Object.keys(data).length} ${resourceName} for step ${activeStepId} in localisation ${activePlayer.localisation}`);
            return data;
        } else {
            console.log(`No ${resourceName} for step ${activeStepId} in localisation ${activePlayer.localisation}`);
            return {}; // Return empty object
        }

    } catch (error) {
        console.error(`Critical: Could not load ${resourceName} data`, error);
        return {}; // Return empty object on error
    }
}

export async function fetchSteps() {
    try {
        const response = await fetch('./data/steps.json');
        if (!response.ok) throw new Error('Failed to load steps data');

        const data = await response.json();
        stepsData = data
        console.log(`Steps data successfully loaded`);
    } catch (error) {
        console.error("Critical: Could not load steps data", error);
    }
}

export async function fetchAleasRiddles() {
    try {
        const response = await fetch('./data/aleasRiddles.json');
        if (!response.ok) throw new Error('Failed to load aleas riddles data');

        const dataFetch = await response.json();
        console.log(`Aleas Riddles data successfully loaded`);
        aleasRiddlesData = dataFetch;
    } catch (error) {
        console.error("Critical: Could not load aleas riddles data", error);
        return {};
    }
}

export async function fetchPlayerCharacters() {
    try {
        const response = await fetch('./data/playersCharacters.json');
        if (!response.ok) throw new Error('Failed to load characters data');

        const dataFetch = await response.json();
        // Return the whole object so we can see both "1" (Corte) and "2" (Toulon)
        return dataFetch;
    } catch (error) {
        console.error("Critical: Could not load character data", error);
        return null;
    }
}

