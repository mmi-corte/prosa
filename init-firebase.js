// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; 

// Charger config.json et initialiser Firebase
async function initFirebase() {
    try {
        const response = await fetch("./config.json"); // Charge le fichier
        const firebaseConfig = await response.json(); // Convertit en JSON
        
        // Vérifie si la config est bien chargée
        if (!firebaseConfig.apiKey) {
            throw new Error("Clé API manquante dans config.json !");
        }
    
        // Initialiser Firebase
        const app = initializeApp(firebaseConfig);
        // const db = getFirestore(app);
        // Active la persistance
        const db = initializeFirestore(app, {
            cacheSizeBytes: CACHE_SIZE_UNLIMITED // Active la persistance
        });
        console.log("Firebase initialisé avec succès !");
        return db;
    } catch (error) {
      console.error("Erreur de chargement de Firebase :", error);
    }
}
  
// Exporte une promesse qui résout avec Firestore
export const dbPromise = initFirebase();
