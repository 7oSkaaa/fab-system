import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Firebase config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Master password from environment variable
export const MASTER_PASSWORD =
    import.meta.env.VITE_MASTER_PASSWORD || "changeme";

// Get admin settings from Firestore
export const getAdminSettings = async () => {
    const docRef = doc(db, "settings", "admin");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        const defaults = {
            password: "fab2024",
            passwordVersion: 1,
        };
        await setDoc(docRef, defaults);
        return defaults;
    }
};

// Update admin password
export const setAdminPassword = async (newPassword) => {
    const docRef = doc(db, "settings", "admin");
    const current = await getAdminSettings();
    await setDoc(docRef, {
        password: newPassword,
        passwordVersion: (current.passwordVersion || 0) + 1,
    });
};
