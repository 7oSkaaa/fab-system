/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, hasFirebaseConfig } from '../firebase';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    writeBatch,
    getDocs,
    query,
    where,
} from 'firebase/firestore';

const BalloonContext = createContext();

export const useBalloonContext = () => useContext(BalloonContext);

const deleteDocumentsInBatches = async (documents) => {
    const commits = [];
    for (let start = 0; start < documents.length; start += 500) {
        const batch = writeBatch(db);
        documents.slice(start, start + 500).forEach(document => batch.delete(document.ref));
        commits.push(batch.commit());
    }
    await Promise.all(commits);
};

const normalizeTeamIdentifier = (value) => {
    const normalized = value.trim().toLowerCase();
    const numericMatch = normalized.match(/^(?:team\s*)?(\d+)$/);
    return numericMatch ? numericMatch[1].replace(/^0+(?=\d)/, '') : normalized;
};

export const BalloonProvider = ({ children }) => {
    // --- State ---
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [problems, setProblems] = useState([]);
    const [balloons, setBalloons] = useState([]);
    const [loading, setLoading] = useState(hasFirebaseConfig);

    // --- Realtime Listeners ---
    useEffect(() => {
        if (!hasFirebaseConfig) {
            return undefined;
        }

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

    const updateSite = async (id, name) => {
        const trimmedName = name.trim();
        if (!trimmedName) throw new Error('Site name cannot be empty.');
        if (sites.some(site => site.id !== id && site.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
            throw new Error(`A site named "${trimmedName}" already exists.`);
        }
        await updateDoc(doc(db, 'sites', id), { name: trimmedName });
    };

    const removeSite = async (id) => {
        const relatedCollections = ['problems', 'teams', 'balloons'];
        const snapshots = await Promise.all(relatedCollections.map(collectionName =>
            getDocs(query(collection(db, collectionName), where('siteId', '==', id)))
        ));

        await Promise.all(snapshots.map(snapshot => deleteDocumentsInBatches(snapshot.docs)));

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
    const addTeams = async (teamsData) => {
        const batch = writeBatch(db);
        teamsData.forEach(t => {
            const ref = doc(collection(db, 'teams'));
            batch.set(ref, { name: t.name, siteId: t.siteId });
        });
        await batch.commit();
    };

    const addTeamsFromTsv = async (tsvTeams, siteId) => {
        if (!siteId) throw new Error('Select a site before importing teams.');
        if (tsvTeams.length > 500) throw new Error('A single TSV import can contain at most 500 teams.');

        const siteTeams = teams.filter(team => team.siteId === siteId);
        const existingIdentifiers = new Set(siteTeams.flatMap(team =>
            [team.seatNumber, team.externalId, team.name].filter(Boolean).map(normalizeTeamIdentifier)
        ));
        const importedIdentifiers = new Set();

        tsvTeams.forEach(team => {
            const identifier = normalizeTeamIdentifier(team.seatNumber);
            if (existingIdentifiers.has(identifier)) {
                throw new Error(`Seat number "${team.seatNumber}" already exists for this site.`);
            }
            if (importedIdentifiers.has(identifier)) {
                throw new Error(`Seat number "${team.seatNumber}" appears more than once in this TSV.`);
            }
            importedIdentifiers.add(identifier);
        });

        const batch = writeBatch(db);
        tsvTeams.forEach(team => {
            const ref = doc(collection(db, 'teams'));
            batch.set(ref, {
                seatNumber: team.seatNumber,
                externalId: team.seatNumber,
                name: team.seatNumber,
                displayName: team.teamName,
                university: team.university,
                siteId,
            });
        });
        await batch.commit();
    };

    const removeTeam = async (id) => {
        await deleteDoc(doc(db, 'teams', id));
    };

    // Problems
    const addProblem = async (name, color, siteId = null, colorName = '', details = {}) => {
        const scopedProblems = problems.filter(problem => siteId === null
            ? problem.siteId === null || problem.siteId === undefined
            : problem.siteId === siteId);
        const existingColors = problems
            .filter(p => siteId === null ? p.siteId === null || p.siteId === undefined : p.siteId === siteId)
            .map(p => p.color.toLowerCase());

        if (existingColors.includes(color.toLowerCase())) {
            throw new Error(`Color ${color} is already used for another problem in this scope!`);
        }
        if (scopedProblems.some(problem => problem.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`Problem ${name} already exists in this scope.`);
        }
        if (details.shortName && scopedProblems.some(problem => problem.shortName?.toLowerCase() === details.shortName.toLowerCase())) {
            throw new Error(`Problem short-name ${details.shortName} already exists in this scope.`);
        }

        await addDoc(collection(db, 'problems'), { name, color, colorName, siteId, ...details });
    };

    const addProblemsFromConfig = async (configProblems, siteId = null) => {
        if (configProblems.length > 500) {
            throw new Error('A single YAML import can contain at most 500 problems.');
        }

        const scopedProblems = problems.filter(problem => siteId === null
            ? problem.siteId === null || problem.siteId === undefined
            : problem.siteId === siteId);
        const existingLetters = new Set(scopedProblems.map(problem => problem.name.toLowerCase()));
        const existingShortNames = new Set(scopedProblems.map(problem => problem.shortName?.toLowerCase()).filter(Boolean));
        const existingColors = new Set(scopedProblems.map(problem => problem.color.toLowerCase()));

        configProblems.forEach(problem => {
            if (existingLetters.has(problem.letter.toLowerCase())) {
                throw new Error(`Problem ${problem.letter} already exists in this scope.`);
            }
            if (existingShortNames.has(problem.shortName.toLowerCase())) {
                throw new Error(`Problem short-name ${problem.shortName} already exists in this scope.`);
            }
            if (existingColors.has(problem.color.toLowerCase())) {
                throw new Error(`Color ${problem.color} is already used in this scope.`);
            }
        });

        const batch = writeBatch(db);
        configProblems.forEach(problem => {
            const ref = doc(collection(db, 'problems'));
            batch.set(ref, {
                name: problem.letter,
                letter: problem.letter,
                shortName: problem.shortName,
                fullName: problem.fullName,
                colorName: problem.colorName,
                color: problem.color,
                siteId,
            });
        });
        await batch.commit();
    };

    const updateProblem = async (id, name, color, colorName, details = {}) => {
        await updateDoc(doc(db, 'problems', id), { name, color, colorName, ...details });
    };

    const removeProblem = async (id) => {
        await deleteDoc(doc(db, 'problems', id));
    };

    const copyProblemsToSite = async (siteId) => {
        const globalProblems = problems.filter(p => !p.siteId);
        const batch = writeBatch(db);
        globalProblems.forEach(p => {
            const ref = doc(collection(db, 'problems'));
            batch.set(ref, {
                name: p.name,
                letter: p.letter || p.name,
                shortName: p.shortName || '',
                fullName: p.fullName || '',
                color: p.color,
                colorName: p.colorName || '',
                siteId,
            });
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
    const addBalloon = async (problemId, teamId, siteId, loggedByEmail) => {
        const reference = await addDoc(collection(db, 'balloons'), {
            problemId,
            teamId,
            siteId,
            loggedBy: loggedByEmail || 'anonymous',
            delivered: false,
            published: false,
            timestamp: Date.now()
        });
        if (auth?.currentUser) {
            auth.currentUser.getIdToken().then(idToken => fetch('/api/push/notify', {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ balloonId: reference.id }),
            }).then(response => {
                if (!response.ok) console.error('Could not send balloon notifications:', response.status);
            })).catch(error => console.error('Could not send balloon notifications:', error));
        }
        return reference.id;
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

    const revertDelivery = async (balloonId) => {
        await updateDoc(doc(db, 'balloons', balloonId), {
            delivered: false,
            deliveredBy: null,
            deliveredAt: null,
        });
    };

    const revertPublication = async (balloonId) => {
        await updateDoc(doc(db, 'balloons', balloonId), {
            published: false,
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
            sites, addSite, updateSite, removeSite, reorderSites,
            teams, addTeams, addTeamsFromTsv, removeTeam,
            problems, addProblem, addProblemsFromConfig, updateProblem, removeProblem, copyProblemsToSite, getProblemsForSite,
            balloons, addBalloon, markDelivered, markPublished, revertDelivery, revertPublication, deleteBalloon, resetBalloons,
            resetData,
            loading
        }}>
            {children}
        </BalloonContext.Provider>
    );
};
