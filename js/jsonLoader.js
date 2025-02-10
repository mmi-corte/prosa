// jsonLoader.js
let jsonData = null; // Variable pour stocker le JSON

// Fonction pour charger le fichier JSON une seule fois
export async function loadJSON() {
    if (jsonData) return jsonData; // Si déjà chargé, ne pas recharger
    try {
        const response = await fetch('prosa_db.json'); // Charge le fichier
        jsonData = await response.json();
        console.log("✅ JSON chargé avec succès !");
        return jsonData;
    } catch (error) {
        console.error("❌ Erreur de chargement du JSON :", error);
        return null;
    }
}

// Fonction pour récupérer un texte via stepCode
export async function getTextByStepCode(stepCode) {
    if (!jsonData) {
        console.warn("⚠ JSON non chargé, tentative de chargement...");
        await loadJSON(); // Charge si nécessaire
    }
    if (!jsonData) return "⚠ Impossible de charger le JSON.";

    for (const key in jsonData.data) {
        if (jsonData.data[key].stepCode === stepCode) {
            return jsonData.data[key].txt;
        }
    }
    console.warn(`Aucun scénario trouvé pour le stepCode "${stepCode}".`);
    return stepCode;
}

// Fonction pour récupérer un texte via stepCode
export async function getPersonnageByStepCode(stepCode) {
    if (!jsonData) {
        console.warn("⚠ JSON non chargé, tentative de chargement...");
        await loadJSON(); // Charge si nécessaire
    }
    if (!jsonData) return "⚠ Impossible de charger le JSON.";
    
    for (const key in jsonData.data) {
        if (jsonData.data[key].stepCode === stepCode) {
            return jsonData.data[key].personnage;
        }
    }
    return "StepCode non trouvé.";
}

