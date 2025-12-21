import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
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

// Super admin from env - has full access
const SUPER_ADMIN = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || "";

// ROLES:
// - 'admin': Full access (can add sites, teams, problems, judges)
// - 'judge': Can only enter balloons (Operations page)

// Get all users with roles from Firestore
export const getUsers = async () => {
    const docRef = doc(db, "settings", "users");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const users = docSnap.data().list || [];
        // Always include super admin
        if (SUPER_ADMIN && !users.find((u) => u.email === SUPER_ADMIN)) {
            users.push({ email: SUPER_ADMIN, role: "admin" });
        }
        return users;
    } else {
        const users = SUPER_ADMIN
            ? [{ email: SUPER_ADMIN, role: "admin" }]
            : [];
        await setDoc(docRef, { list: users });
        return users;
    }
};

// Add user with role
export const addUser = async (email, role) => {
    const docRef = doc(db, "settings", "users");
    const users = await getUsers();
    const normalizedEmail = email.toLowerCase();

    // Check if already exists
    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
        // Update role
        existing.role = role;
    } else {
        users.push({ email: normalizedEmail, role });
    }
    await setDoc(docRef, { list: users });
};

// Remove user (cannot remove super admin)
export const removeUser = async (email) => {
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail === SUPER_ADMIN) {
        throw new Error("Cannot remove super admin");
    }

    const docRef = doc(db, "settings", "users");
    const users = await getUsers();
    const filtered = users.filter((u) => u.email !== normalizedEmail);
    await setDoc(docRef, { list: filtered });
};

// Get user role
export const getUserRole = async (email) => {
    if (!email) return null;
    const users = await getUsers();
    const user = users.find((u) => u.email === email.toLowerCase());
    return user?.role || null;
};

// Check if email is authorized (any role)
export const isAuthorized = async (email) => {
    const role = await getUserRole(email);
    return role !== null;
};

// Super admin check
export const isSuperAdmin = (email) => {
    return email?.toLowerCase() === SUPER_ADMIN;
};
