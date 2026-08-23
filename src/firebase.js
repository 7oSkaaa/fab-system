import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config from environment variables
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = hasFirebaseConfig ? getAuth(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();

// Super admins from env plus protected contest staff accounts.
const SUPER_ADMINS = [
    import.meta.env.VITE_ADMIN_EMAIL,
    "wahab@acpc.global",
]
    .filter(Boolean)
    .map(email => email.toLowerCase())
    .filter((email, index, emails) => emails.indexOf(email) === index);

// ROLES: 'admin' | 'judge' | 'volunteer'

// Get all users with roles
export const getUsers = async () => {
    const docRef = doc(db, "settings", "users");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const users = docSnap.data().list || [];
        SUPER_ADMINS.forEach(email => {
            if (!users.find((u) => u.email === email)) {
                users.push({ email, role: "admin" });
            }
        });
        return users;
    } else {
        const users = SUPER_ADMINS.map(email => ({ email, role: "admin" }));
        await setDoc(docRef, { list: users });
        return users;
    }
};

// Add user with role
export const addUser = async (email, role) => {
    const docRef = doc(db, "settings", "users");
    const users = await getUsers();
    const normalizedEmail = email.toLowerCase();

    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
        existing.role = role;
    } else {
        users.push({ email: normalizedEmail, role });
    }
    await setDoc(docRef, { list: users });
};

// Remove user
export const removeUser = async (email) => {
    const normalizedEmail = email.toLowerCase();
    if (SUPER_ADMINS.includes(normalizedEmail)) {
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

// Check if authorized (any role)
export const isAuthorized = async (email) => {
    const role = await getUserRole(email);
    return role !== null;
};

// Super admin check
export const isSuperAdmin = (email) => {
    return SUPER_ADMINS.includes(email?.toLowerCase());
};
