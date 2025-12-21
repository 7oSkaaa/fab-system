import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

// ============================================
// MASTER PASSWORD - SET THIS ONCE AND KEEP IT SECRET
// This is the ONLY password that can change the admin password
// ============================================
export const MASTER_PASSWORD = "MySecretMaster2024"; // <-- CHANGE THIS TO YOUR SECRET

// Get admin settings from Firestore
export const getAdminSettings = async () => {
    const docRef = doc(db, "settings", "admin");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        // Create default settings on first run
        const defaults = {
            password: "fab2024",
            passwordVersion: 1, // Increment this to invalidate all sessions
        };
        await setDoc(docRef, defaults);
        return defaults;
    }
};

// Update admin password (only callable with master password verification)
export const setAdminPassword = async (newPassword) => {
    const docRef = doc(db, "settings", "admin");
    const current = await getAdminSettings();
    await setDoc(docRef, {
        password: newPassword,
        passwordVersion: (current.passwordVersion || 0) + 1, // Increment to invalidate all sessions
    });
};
