import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    writeBatch,
    query,
    orderBy
} from 'firebase/firestore';

const BalloonContext = createContext();

export const useBalloonContext = () => useContext(BalloonContext);

export const BalloonProvider = ({ children }) => {
    // --- State ---
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [problems, setProblems] = useState([]);
    const [balloons, setBalloons] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Realtime Listeners ---
    useEffect(() => {
        const unsubscribers = [];
        let resolved = false;

        const finish = () => {
            if (!resolved) {
                resolved = true;
                setLoading(false);
            }
        };

        // Sites
        unsubscribers.push(
            onSnapshot(collection(db, 'sites'),
                (snapshot) => setSites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
                () => {}
            )
        );

        // Teams
        unsubscribers.push(
            onSnapshot(collection(db, 'teams'),
                (snapshot) => setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
                () => {}
            )
        );

        // Problems
        unsubscribers.push(
            onSnapshot(collection(db, 'problems'),
                (snapshot) => setProblems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
                () => {}
            )
        );

        // Balloons
        unsubscribers.push(
            onSnapshot(collection(db, 'balloons'),
                (snapshot) => {
                    setBalloons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    finish();
                },
                () => finish()
            )
        );

        return () => unsubscribers.forEach(unsub => unsub());
    }, []);

    // --- Actions ---

    // Sites
    const addSite = async (name) => {
        await addDoc(collection(db, 'sites'), { name });
    };

    const removeSite = async (id) => {
        await deleteDoc(doc(db, 'sites', id));
    };

    // Teams
    const addTeam = async (name, siteId) => {
        await addDoc(collection(db, 'teams'), { name, siteId });
    };

    const addTeams = async (teamsData) => {
        const batch = writeBatch(db);
        teamsData.forEach(t => {
            const ref = doc(collection(db, 'teams'));
            batch.set(ref, { name: t.name, siteId: t.siteId });
        });
        await batch.commit();
    };

    const removeTeam = async (id) => {
        await deleteDoc(doc(db, 'teams', id));
    };

    const updateTeamDisplayName = async (teamId, displayName) => {
        await updateDoc(doc(db, 'teams', teamId), { displayName: displayName.trim() });
    };

    // Problems
    const addProblem = async (name, color, siteId = null) => {
        // Check for duplicate color in same scope (global or site-specific)
        const existingColors = problems
            .filter(p => p.siteId === siteId)
            .map(p => p.color.toLowerCase());

        if (existingColors.includes(color.toLowerCase())) {
            throw new Error(`Color ${color} is already used for another problem in this scope!`);
        }

        await addDoc(collection(db, 'problems'), { name, color, siteId });
    };

    const removeProblem = async (id) => {
        await deleteDoc(doc(db, 'problems', id));
    };

    const copyProblemsToSite = async (siteId) => {
        const globalProblems = problems.filter(p => !p.siteId);
        const batch = writeBatch(db);
        globalProblems.forEach(p => {
            const ref = doc(collection(db, 'problems'));
            batch.set(ref, { name: p.name, color: p.color, siteId: siteId });
        });
        await batch.commit();
    };

    const getProblemsForSite = (siteId) => {
        const siteSpecific = problems.filter(p => p.siteId === siteId);
        if (siteSpecific.length > 0) {
            return siteSpecific;
        }
        return problems.filter(p => !p.siteId);
    };

    // Balloons
    const addBalloon = async (problemId, teamId, siteId) => {
        await addDoc(collection(db, 'balloons'), {
            problemId,
            teamId,
            siteId,
            status: 'pending',
            timestamp: Date.now()
        });
    };

    const markDelivered = async (balloonId, deliveredByEmail) => {
        await updateDoc(doc(db, 'balloons', balloonId), {
            status: 'delivered',
            deliveredBy: deliveredByEmail || 'anonymous',
            deliveredAt: Date.now()
        });
    };

    const resetData = async () => {
        // Delete all documents in all collections
        const collections = ['sites', 'teams', 'problems', 'balloons'];
        for (const collName of collections) {
            const batch = writeBatch(db);
            const snapshot = await collection(db, collName);
            // Note: This is a simplified version. For large datasets, you'd need pagination.
        }
        // For now, just clear locally - user can manually delete in Firebase console
        alert('To fully reset, please delete collections in Firebase Console.');
    };

    return (
        <BalloonContext.Provider value={{
            sites, addSite, removeSite,
            teams, addTeam, addTeams, removeTeam, updateTeamDisplayName,
            problems, addProblem, removeProblem, copyProblemsToSite, getProblemsForSite,
            balloons, addBalloon, markDelivered,
            resetData,
            loading
        }}>
            {children}
        </BalloonContext.Provider>
    );
};
