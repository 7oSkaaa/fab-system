import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isAdminEmail } from '../firebase';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAdmin(user ? isAdminEmail(user.email) : false);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (!isAdminEmail(result.user.email)) {
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
            if (!isAdminEmail(email)) {
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

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
