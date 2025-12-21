import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
export const auth = getAuth(app);

// Admin emails stored in Firestore for easy management
// First email from env is automatically added as super admin
const SUPER_ADMIN = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || "";

// Get admin emails from Firestore
export const getAdminEmails = async () => {
    const docRef = doc(db, "settings", "admins");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const emails = docSnap.data().emails || [];
        // Always include super admin
        if (SUPER_ADMIN && !emails.includes(SUPER_ADMIN)) {
            emails.push(SUPER_ADMIN);
        }
        return emails;
    } else {
        // Initialize with super admin
        const emails = SUPER_ADMIN ? [SUPER_ADMIN] : [];
        await setDoc(docRef, { emails });
        return emails;
    }
};

// Add admin email
export const addAdminEmail = async (email) => {
    const docRef = doc(db, "settings", "admins");
    const emails = await getAdminEmails();
    const normalizedEmail = email.toLowerCase();

    if (!emails.includes(normalizedEmail)) {
        emails.push(normalizedEmail);
        await setDoc(docRef, { emails });
    }
};

// Remove admin email (cannot remove super admin)
export const removeAdminEmail = async (email) => {
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail === SUPER_ADMIN) {
        throw new Error("Cannot remove super admin");
    }

    const docRef = doc(db, "settings", "admins");
    const emails = await getAdminEmails();
    const filtered = emails.filter((e) => e !== normalizedEmail);
    await setDoc(docRef, { emails: filtered });
};

// Check if email is admin (checks against Firestore)
export const checkIsAdmin = async (email) => {
    if (!email) return false;
    const emails = await getAdminEmails();
    return emails.includes(email.toLowerCase());
};

// Super admin check (from env variable - cannot be changed)
export const isSuperAdmin = (email) => {
    return email?.toLowerCase() === SUPER_ADMIN;
};
