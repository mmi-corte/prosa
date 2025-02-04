// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; 


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk_YBR1ohOOMCldKb3Gf8p4LUTQPJhGwM",
  authDomain: "prosa-f82a3.firebaseapp.com",
  projectId: "prosa-f82a3",
  storageBucket: "prosa-f82a3.firebasestorage.app",
  messagingSenderId: "482407501522",
  appId: "1:482407501522:web:727e3a7aa8a9ce24aca70b",
  measurementId: "G-XD1BB1XH6N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Active la persistance
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log("Persistence non activée : plusieurs onglets ouverts.");
    } else if (err.code === 'unimplemented') {
        console.log("Persistance non supportée par le navigateur.");
    }
});

export { db };
