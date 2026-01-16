export let stepsData = [];
export let dialogsData = [];

// ==================================
// A insérer: logique d'initailisation du jeu
// ==================================
// Choix de la zone de départ
// Choix du nombre de joueurs
// Choix des personnages joueurs
// PUIS initGameData basé sur la sélection (départ corse, provence)
//
// Pour l'instant on met ça manuellement
// ==================================

localStorage.setItem('playerLocalisation', 1)
localStorage.setItem('nextStepVariant', 0)

export const playerLocalisation = parseInt(localStorage.getItem('playerLocalisation'))
export const nextStepVariant = parseInt(localStorage.getItem('nextStepVariant'))


export async function initGameData() {
    let dataFetch = ''

    try {
        const response = await fetch('./data/steps.json');
        if (!response.ok) throw new Error('Failed to load steps data');

        // Store data in memory for instant access later
        dataFetch = await response.json();
        stepsData = dataFetch[playerLocalisation]
        console.log("Game data loaded:", Object.keys(stepsData).length, "steps for localisation", playerLocalisation);
    } catch (error) {
        console.error("Critical: Could not load steps data", error);
    }

    try {
        const response = await fetch('./data/dialogs.json');
        if (!response.ok) throw new Error('Failed to load dialogs data');

        // Store data in memory for instant access later
        dataFetch = await response.json();
        dialogsData = dataFetch[playerLocalisation]
        console.log("Game data loaded:", Object.keys(dialogsData).length, "dialogs for localisation", playerLocalisation);
    } catch (error) {
        console.error("Critical: Could not load dialogs data", error);
    }
}