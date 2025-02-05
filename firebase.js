import { dbPromise } from './init-firebase.js';

const db = await dbPromise; // Attente de l'initialisation de Firebase
if (!db) {
    throw new Error("🔥 Firestore n'est pas disponible !");
}

export { db };