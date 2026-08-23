/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { auth, hasFirebaseConfig, googleProvider, getUserRole, isSuperAdmin as checkSuperAdmin, getUsers, addUser, removeUser, isAuthorized } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(hasFirebaseConfig);
    const [role, setRole] = useState(null);
    const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
    const [users, setUsers] = useState([]);

    const loadUserData = useCallback(async (firebaseUser) => {
        if (firebaseUser) {
            const userRole = await getUserRole(firebaseUser.email);
            setRole(userRole);
            setIsSuperAdminUser(userRole === 'superAdmin' || checkSuperAdmin(firebaseUser.email));

            if (['admin', 'superAdmin'].includes(userRole)) {
                const allUsers = await getUsers();
                setUsers(allUsers);
            }
        } else {
            setRole(null);
            setIsSuperAdminUser(false);
            setUsers([]);
        }
    }, []);

    useEffect(() => {
        if (!hasFirebaseConfig) {
            return undefined;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            await loadUserData(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [loadUserData]);

    // Google Sign-In
    const loginWithGoogle = useCallback(async () => {
        if (!hasFirebaseConfig) {
            return { success: false, error: 'Firebase is not configured for this environment.' };
        }

        try {
            const result = await signInWithPopup(auth, googleProvider);
            await loadUserData(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [loadUserData]);

    // Login for admin/judge (checks if authorized)
    const loginAsStaff = useCallback(async () => {
        if (!hasFirebaseConfig) {
            return { success: false, error: 'Firebase is not configured for this environment.' };
        }

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
    }, [loadUserData]);

    const logout = useCallback(async () => {
        if (!hasFirebaseConfig) return;
        await signOut(auth);
    }, []);

    const addUserWithRole = useCallback(async (email, userRole) => {
        await addUser(email, userRole);
        const allUsers = await getUsers();
        setUsers(allUsers);
    }, []);

    const removeUserByEmail = useCallback(async (email) => {
        await removeUser(email);
        const allUsers = await getUsers();
        setUsers(allUsers);
    }, []);

    const authValue = useMemo(() => ({
        user,
        role,
        isAdmin: ['admin', 'superAdmin'].includes(role),
        isJudge: role === 'judge',
        isSuperAdmin: isSuperAdminUser,
        isProtectedSuperAdminEmail: checkSuperAdmin,
        users,
        loginWithGoogle,
        loginAsStaff,
        logout,
        addUser: addUserWithRole,
        removeUser: removeUserByEmail
    }), [addUserWithRole, isSuperAdminUser, loginAsStaff, loginWithGoogle, logout, removeUserByEmail, role, user, users]);

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};
