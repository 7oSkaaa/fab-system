import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminPassword, setAdminPassword } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminPassword, setAdminPasswordState] = useState('');

    useEffect(() => {
        // Load password from Firestore
        const loadPassword = async () => {
            const password = await getAdminPassword();
            setAdminPasswordState(password);

            // Check if admin session exists
            const adminSession = sessionStorage.getItem('fab_admin');
            if (adminSession === 'true') {
                setIsAdmin(true);
            }
            setLoading(false);
        };
        loadPassword();
    }, []);

    const login = (password) => {
        if (password === adminPassword) {
            setIsAdmin(true);
            sessionStorage.setItem('fab_admin', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('fab_admin');
    };

    const changePassword = async (newPassword) => {
        await setAdminPassword(newPassword);
        setAdminPasswordState(newPassword);
    };

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};
