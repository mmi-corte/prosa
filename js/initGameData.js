export let stepsData = [];
export let dialogsData = [];
export let choicesData = [];
export let riddlesData = [];
export let gamesData = [];

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

    // ===================
    // ====== STEPS ======
    // ===================
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

    // =====================
    // ====== DIALOGS ======
    // =====================
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

    // =====================
    // ====== CHOICES ======
    // =====================
    try {
        const response = await fetch('./data/choices.json');
        if (!response.ok) throw new Error('Failed to load choices data');

        // Store data in memory for instant access later
        dataFetch = await response.json();
        choicesData = dataFetch[playerLocalisation]
        console.log("Game data loaded:", Object.keys(choicesData).length, "choices for localisation", playerLocalisation);
    } catch (error) {
        console.error("Critical: Could not load choices data", error);
    }

    // =====================
    // ====== RIDDLES ======
    // =====================
    try {
        const response = await fetch('./data/riddles.json');
        if (!response.ok) throw new Error('Failed to load riddles data');

        // Store data in memory for instant access later
        dataFetch = await response.json();
        riddlesData = dataFetch[playerLocalisation]
        console.log("Game data loaded:", Object.keys(riddlesData).length, "riddles for localisation", playerLocalisation);
    } catch (error) {
        console.error("Critical: Could not load riddles data", error);
    }

    // =====================
    // ====== GAMES ======
    // =====================
    try {
        const response = await fetch('./data/games.json');
        if (!response.ok) throw new Error('Failed to load games data');

        // Store data in memory for instant access later
        dataFetch = await response.json();
        gamesData = dataFetch[playerLocalisation]
        console.log("Game data loaded:", Object.keys(gamesData).length, "games for localisation", playerLocalisation);
    } catch (error) {
        console.error("Critical: Could not load games data", error);
    }
}