import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, checkIsAdmin, isSuperAdmin, getAdminEmails, addAdminEmail, removeAdminEmail } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
    const [adminEmails, setAdminEmails] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const adminStatus = await checkIsAdmin(user.email);
                setIsAdmin(adminStatus);
                setIsSuperAdminUser(isSuperAdmin(user.email));
                // Load admin emails for super admin
                if (isSuperAdmin(user.email)) {
                    const emails = await getAdminEmails();
                    setAdminEmails(emails);
                }
            } else {
                setIsAdmin(false);
                setIsSuperAdminUser(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const adminStatus = await checkIsAdmin(result.user.email);
            if (!adminStatus) {
                await signOut(auth);
                throw new Error('This email is not authorized as admin');
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password) => {
        try {
            const adminStatus = await checkIsAdmin(email);
            if (!adminStatus) {
                throw new Error('This email is not authorized as admin');
            }
            await createUserWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const addAdmin = async (email) => {
        await addAdminEmail(email);
        const emails = await getAdminEmails();
        setAdminEmails(emails);
    };

    const removeAdmin = async (email) => {
        await removeAdminEmail(email);
        const emails = await getAdminEmails();
        setAdminEmails(emails);
    };

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAdmin,
            isSuperAdmin: isSuperAdminUser,
            adminEmails,
            login,
            register,
            logout,
            addAdmin,
            removeAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};
