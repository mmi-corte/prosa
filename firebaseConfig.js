// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; // Firestore import

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore

// Export Firestore instance for usage in other files
export { db };
