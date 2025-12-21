import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminSettings, setAdminPassword, MASTER_PASSWORD } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminPassword, setAdminPasswordState] = useState('');
    const [passwordVersion, setPasswordVersion] = useState(0);

    useEffect(() => {
        // Load settings from Firestore
        const loadSettings = async () => {
            const settings = await getAdminSettings();
            setAdminPasswordState(settings.password);
            setPasswordVersion(settings.passwordVersion || 1);

            // Check if admin session exists AND version matches
            const savedVersion = sessionStorage.getItem('fab_admin_version');
            const adminSession = sessionStorage.getItem('fab_admin');

            if (adminSession === 'true' && savedVersion === String(settings.passwordVersion || 1)) {
                setIsAdmin(true);
            } else {
                // Session is invalid (password was changed)
                sessionStorage.removeItem('fab_admin');
                sessionStorage.removeItem('fab_admin_version');
            }

            setLoading(false);
        };
        loadSettings();
    }, []);

    const login = (password) => {
        if (password === adminPassword) {
            setIsAdmin(true);
            sessionStorage.setItem('fab_admin', 'true');
            sessionStorage.setItem('fab_admin_version', String(passwordVersion));
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('fab_admin');
        sessionStorage.removeItem('fab_admin_version');
    };

    // Change password - requires master password
    const changePassword = async (masterPwd, newPassword) => {
        if (masterPwd !== MASTER_PASSWORD) {
            throw new Error('Invalid master password');
        }
        await setAdminPassword(newPassword);
        setAdminPasswordState(newPassword);
        setPasswordVersion(prev => prev + 1);
        // Logout current user too
        logout();
    };

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};
