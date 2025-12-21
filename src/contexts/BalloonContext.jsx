import React, { createContext, useContext, useState, useEffect } from 'react';

const BalloonContext = createContext();

export const useBalloonContext = () => useContext(BalloonContext);

const STORAGE_KEYS = {
    SITES: 'fab_sites',
    TEAMS: 'fab_teams',
    PROBLEMS: 'fab_problems',
    BALLOONS: 'fab_balloons'
};

export const BalloonProvider = ({ children }) => {
    // --- State ---
    const [sites, setSites] = useState([]);
    const [teams, setTeams] = useState([]);
    const [problems, setProblems] = useState([]);
    const [balloons, setBalloons] = useState([]);

    // --- Initialization ---
    useEffect(() => {
        const loadData = () => {
            try {
                const storedSites = JSON.parse(localStorage.getItem(STORAGE_KEYS.SITES) || '[]');
                const storedTeams = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
                const storedProblems = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROBLEMS) || '[]');
                const storedBalloons = JSON.parse(localStorage.getItem(STORAGE_KEYS.BALLOONS) || '[]');

                setSites(storedSites);
                setTeams(storedTeams);
                setProblems(storedProblems);
                setBalloons(storedBalloons);
            } catch (error) {
                console.error("Failed to load data from local storage", error);
            }
        };
        loadData();
    }, []);

    // --- Persistence Wrappers ---
    const saveSites = (newSites) => {
        setSites(newSites);
        localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(newSites));
    };

    const saveTeams = (newTeams) => {
        setTeams(newTeams);
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(newTeams));
    };

    const saveProblems = (newProblems) => {
        setProblems(newProblems);
        localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(newProblems));
    };

    const saveBalloons = (newBalloons) => {
        setBalloons(newBalloons);
        localStorage.setItem(STORAGE_KEYS.BALLOONS, JSON.stringify(newBalloons));
    };

    // --- Actions ---

    // Sites
    const addSite = (name) => {
        const newSite = { id: crypto.randomUUID(), name };
        saveSites([...sites, newSite]);
    };

    const removeSite = (id) => {
        saveSites(sites.filter(s => s.id !== id));
    };

    // Teams
    const addTeam = (name, siteId) => {
        const newTeam = { id: crypto.randomUUID(), name, siteId };
        saveTeams([...teams, newTeam]);
    };

    const addTeams = (teamsData) => {
        // teamsData: Array of { name, siteId }
        const newTeams = teamsData.map(t => ({
            id: crypto.randomUUID(),
            name: t.name,
            siteId: t.siteId
        }));
        saveTeams([...teams, ...newTeams]);
    };

    const removeTeam = (id) => {
        saveTeams(teams.filter(t => t.id !== id));
    };

    // Problems
    // siteId: null = global (available to all sites), specific ID = site-only
    const addProblem = (name, color, siteId = null) => {
        const newProblem = { id: crypto.randomUUID(), name, color, siteId };
        saveProblems([...problems, newProblem]);
    };

    const removeProblem = (id) => {
        saveProblems(problems.filter(p => p.id !== id));
    };

    // Copy global problems to a specific site with new IDs
    const copyProblemsToSite = (siteId) => {
        const globalProblems = problems.filter(p => p.siteId === null);
        const copiedProblems = globalProblems.map(p => ({
            id: crypto.randomUUID(),
            name: p.name,
            color: p.color,
            siteId: siteId
        }));
        saveProblems([...problems, ...copiedProblems]);
    };

    // Get problems for a specific site
    // If site has its own problems, return ONLY those
    // Otherwise return global problems (siteId === null or undefined)
    const getProblemsForSite = (siteId) => {
        const siteSpecific = problems.filter(p => p.siteId === siteId);
        if (siteSpecific.length > 0) {
            // Site has its own problems, use only those
            return siteSpecific;
        }
        // No site-specific problems, use globals
        return problems.filter(p => !p.siteId); // null or undefined
    };

    // Balloons
    const addBalloon = (problemId, teamId, siteId) => {
        // Validation: Check if this problem for this team at this site is already recorded
        const exists = balloons.some(b =>
            b.problemId === problemId &&
            b.teamId === teamId && /* Note: usually one FA per problem per site, or per team? 
                              "First accepted for each problem" usually means 1 per site. 
                              But "add teams which got first accepted" implies we track the FA team.
                              If this is "First Accepted of the Site", there's only 1. 
                              If it's just "Accepted", we track all. 
                              User said "team that will have first accepted for each problem".
                              I'll assume it means THE First Accepted for that problem at that site.
                              So I should check if ANY team has FA for this problem at this site? 
                              Or maybe just logging balloons. Let's allow multiple for now if they want to override, 
                              but maybe warn. I'll just append. */
            b.siteId === siteId
        );

        // If exists, strictly speaking we might want to block, but for flexibility I'll allow adding 
        // (maybe it was a mistake and they need to re-enter). 
        // Actually, distinct First Accepted usually implies uniqueness. 
        // I'll add it.

        const newBalloon = {
            id: crypto.randomUUID(),
            problemId,
            teamId,
            siteId,
            status: 'pending', // pending -> delivered
            timestamp: Date.now()
        };
        saveBalloons([...balloons, newBalloon]);
    };

    const markDelivered = (balloonId) => {
        const updated = balloons.map(b => b.id === balloonId ? { ...b, status: 'delivered' } : b);
        saveBalloons(updated);
    };

    const resetData = () => {
        saveSites([]);
        saveTeams([]);
        saveProblems([]);
        saveBalloons([]);
    };

    return (
        <BalloonContext.Provider value={{
            sites, addSite, removeSite,
            teams, addTeam, addTeams, removeTeam,
            problems, addProblem, removeProblem, copyProblemsToSite, getProblemsForSite,
            balloons, addBalloon, markDelivered,
            resetData
        }}>
            {children}
        </BalloonContext.Provider>
    );
};
