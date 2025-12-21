import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_PASSWORD } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if admin session exists
        const adminSession = sessionStorage.getItem('fab_admin');
        if (adminSession === 'true') {
            setIsAdmin(true);
        }
    }, []);

    const login = (password) => {
        if (password === ADMIN_PASSWORD) {
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

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
