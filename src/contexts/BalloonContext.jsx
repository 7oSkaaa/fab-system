/* eslint-disable react-refresh/only-export-components */
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
    getDocs,
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
                (snapshot) => {
                    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    setSites(list);
                },
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

    const reorderSites = async (orderedIds) => {
        const batch = writeBatch(db);
        orderedIds.forEach((id, index) => {
            batch.update(doc(db, 'sites', id), { order: index });
        });
        await batch.commit();
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
    const addProblem = async (name, color, siteId = null, colorName = '') => {
        const existingColors = problems
            .filter(p => p.siteId === siteId)
            .map(p => p.color.toLowerCase());

        if (existingColors.includes(color.toLowerCase())) {
            throw new Error(`Color ${color} is already used for another problem in this scope!`);
        }

        await addDoc(collection(db, 'problems'), { name, color, colorName, siteId });
    };

    const updateProblem = async (id, name, color, colorName) => {
        await updateDoc(doc(db, 'problems', id), { name, color, colorName });
    };

    const removeProblem = async (id) => {
        await deleteDoc(doc(db, 'problems', id));
    };

    const copyProblemsToSite = async (siteId) => {
        const globalProblems = problems.filter(p => !p.siteId);
        const batch = writeBatch(db);
        globalProblems.forEach(p => {
            const ref = doc(collection(db, 'problems'));
            batch.set(ref, { name: p.name, color: p.color, colorName: p.colorName || '', siteId: siteId });
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
            delivered: false,
            published: false,
            timestamp: Date.now()
        });
    };

    const markDelivered = async (balloonId, deliveredByEmail) => {
        await updateDoc(doc(db, 'balloons', balloonId), {
            delivered: true,
            deliveredBy: deliveredByEmail || 'anonymous',
            deliveredAt: Date.now()
        });
    };

    const markPublished = async (balloonId, publishedByEmail) => {
        await updateDoc(doc(db, 'balloons', balloonId), {
            published: true,
            publishedBy: publishedByEmail || 'anonymous',
            publishedAt: Date.now()
        });
    };

    const resetBalloons = async () => {
        const snapshot = await getDocs(collection(db, 'balloons'));
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
    };

    const revertBalloon = async (balloonId) => {
        await updateDoc(doc(db, 'balloons', balloonId), {
            delivered: false,
            published: false,
            deliveredBy: null,
            deliveredAt: null,
            publishedBy: null,
            publishedAt: null,
        });
    };

    const deleteBalloon = async (balloonId) => {
        await deleteDoc(doc(db, 'balloons', balloonId));
    };

    const resetData = async () => {
        const names = ['sites', 'teams', 'problems', 'balloons'];
        for (const name of names) {
            const snapshot = await getDocs(collection(db, name));
            const batch = writeBatch(db);
            snapshot.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        }
    };

    return (
        <BalloonContext.Provider value={{
            sites, addSite, removeSite, reorderSites,
            teams, addTeam, addTeams, removeTeam, updateTeamDisplayName,
            problems, addProblem, updateProblem, removeProblem, copyProblemsToSite, getProblemsForSite,
            balloons, addBalloon, markDelivered, markPublished, revertBalloon, deleteBalloon, resetBalloons,
            resetData,
            loading
        }}>
            {children}
        </BalloonContext.Provider>
    );
};
