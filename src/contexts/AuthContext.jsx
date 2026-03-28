/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, getUserRole, isSuperAdmin, getUsers, addUser, removeUser, isAuthorized } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
    const [users, setUsers] = useState([]);

    const loadUserData = async (firebaseUser) => {
        if (firebaseUser) {
            const userRole = await getUserRole(firebaseUser.email);
            setRole(userRole);
            setIsSuperAdminUser(isSuperAdmin(firebaseUser.email));

            if (userRole === 'admin') {
                const allUsers = await getUsers();
                setUsers(allUsers);
            }
        } else {
            setRole(null);
            setIsSuperAdminUser(false);
            setUsers([]);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            await loadUserData(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Google Sign-In
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await loadUserData(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Login for admin/judge (checks if authorized)
    const loginAsStaff = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const authorized = await isAuthorized(result.user.email);
            if (!authorized) {
                await signOut(auth);
                throw new Error('This email is not authorized. Contact admin to get access.');
            }
            await loadUserData(result.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const addUserWithRole = async (email, userRole) => {
        await addUser(email, userRole);
        const allUsers = await getUsers();
        setUsers(allUsers);
    };

    const removeUserByEmail = async (email) => {
        await removeUser(email);
        const allUsers = await getUsers();
        setUsers(allUsers);
    };

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            user,
            role,
            isAdmin: role === 'admin',
            isJudge: role === 'judge',
            isSuperAdmin: isSuperAdminUser,
            users,
            loginWithGoogle,
            loginAsStaff,
            logout,
            addUser: addUserWithRole,
            removeUser: removeUserByEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
};
