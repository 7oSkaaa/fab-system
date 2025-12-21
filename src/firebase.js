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

// Get admin password from Firestore (or create default if not exists)
export const getAdminPassword = async () => {
    const docRef = doc(db, "settings", "admin");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().password;
    } else {
        // Create default password on first run
        const defaultPassword = "fab2024";
        await setDoc(docRef, { password: defaultPassword });
        return defaultPassword;
    }
};

// Update admin password
export const setAdminPassword = async (newPassword) => {
    const docRef = doc(db, "settings", "admin");
    await setDoc(docRef, { password: newPassword });
};
