import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB6KDYd__t2hfucT39xLRgWv8vX1wQtzLk",
    authDomain: "fab-system.firebaseapp.com",
    projectId: "fab-system",
    storageBucket: "fab-system.firebasestorage.app",
    messagingSenderId: "226577678672",
    appId: "1:226577678672:web:cafa6c64a880931475ac55",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Admin password (simple protection - not highly secure, but works for this use case)
export const ADMIN_PASSWORD = "fab2024"; // Change this to your desired password
