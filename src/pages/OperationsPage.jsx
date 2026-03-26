import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaHome } from 'react-icons/fa';

export const OperationsPage = () => {
    const { sites, problems, teams, balloons, addBalloon, getProblemsForSite, updateTeamDisplayName } = useBalloonContext();

    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedProblemId, setSelectedProblemId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [customTeamName, setCustomTeamName] = useState('');

    useEffect(() => {
        if (sites.length > 0 && !selectedSiteId) {
            setSelectedSiteId(sites[0].id);
        }
    }, [sites, selectedSiteId]);

    useEffect(() => {
        setSelectedTeamId('');
    }, [selectedSiteId]);

    const siteTeams = teams.filter(t => t.siteId === selectedSiteId);

    const takenProblems = new Set();
    balloons.forEach(b => {
        if (b.siteId === selectedSiteId) {
            takenProblems.add(b.problemId);
        }
    });

    const getWinnerForProblem = (pId) => {
        const b = balloons.find(b => b.siteId === selectedSiteId && b.problemId === pId);
        if (!b) return null;
        const t = teams.find(team => team.id === b.teamId);
        return t ? t.name : 'Unknown Team';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSiteId || !selectedProblemId || !selectedTeamId) {
            setFeedback({ type: 'error', msg: 'Please fill all fields.' });
            return;
        }

        if (takenProblems.has(selectedProblemId)) {
            if (!window.confirm(`Problem is already taken by ${getWinnerForProblem(selectedProblemId)}. Overwrite?`)) {
                return;
            }
        }

        addBalloon(selectedProblemId, selectedTeamId, selectedSiteId);
        if (customTeamName.trim()) {
            updateTeamDisplayName(selectedTeamId, customTeamName.trim());
        }
        setFeedback({ type: 'success', msg: 'Balloon Request Sent!' });
        setSelectedTeamId('');
        setSelectedProblemId('');
        setCustomTeamName('');

        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
            <header className="page-header flex justify-between items-center flex-wrap gap-md">
                <div className="page-title">
                    <h1 className="page-title-main">👨‍⚖️ Judge / Staff</h1>
                    <p className="page-title-sub">Log First Accepted</p>
                </div>
                <Link to="/" className="btn-secondary">
                    <FaHome /> Home
                </Link>
            </header>

            {sites.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Please configure sites first.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {/* Site Selector */}
                    <div className="card">
                        <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontWeight: '600' }}>Current Site:</label>
                        <select
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                            style={{ fontSize: '1.1rem' }}
                        >
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="card flex flex-col gap-lg">
                        {/* Problem Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontWeight: '600' }}>Select Problem:</label>
                            <div className="flex flex-wrap gap-sm">
                                {(selectedSiteId ? getProblemsForSite(selectedSiteId) : problems).slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => {
                                    const isTaken = takenProblems.has(p.id);
                                    const isSelected = selectedProblemId === p.id;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedProblemId(p.id)}
                                            style={{
                                                padding: '10px 18px',
                                                borderRadius: 'var(--radius-md)',
                                                border: isSelected ? `2px solid ${p.color}` : '2px solid var(--border-color)',
                                                background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                                                opacity: isTaken ? 0.5 : 1,
                                                position: 'relative',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, display: 'inline-block', marginRight: '6px' }} />
                                            {p.name}
                                            {isTaken && <FaCheckCircle style={{ position: 'absolute', top: -6, right: -6, color: 'var(--color-success)', background: 'var(--bg-base)', borderRadius: '50%' }} />}
                                        </div>
                                    );
                                })}
                            </div>
                            {selectedProblemId && takenProblems.has(selectedProblemId) && (
                                <p style={{ color: 'var(--color-warning)', fontSize: '0.9rem', marginTop: 'var(--space-sm)' }}>
                                    <FaExclamationTriangle /> Taken by: {getWinnerForProblem(selectedProblemId)}
                                </p>
                            )}
                        </div>

                        {/* Team Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontWeight: '600' }}>Select Team:</label>
                            <select
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                disabled={!siteTeams.length}
                            >
                                <option value="">-- Choose Team --</option>
                                {siteTeams.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {siteTeams.length === 0 && <span style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>No teams for this site.</span>}
                            <input
                                type="text"
                                placeholder="Override team display name (optional)"
                                value={customTeamName}
                                onChange={(e) => setCustomTeamName(e.target.value)}
                                style={{ marginTop: 'var(--space-sm)' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                If provided, this name will be shown on the public scoreboard instead of the default team name.
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '14px 24px', fontSize: '1.1rem' }}
                            disabled={!selectedProblemId || !selectedTeamId}
                        >
                            <FaPaperPlane /> Log First Accepted
                        </button>

                        {feedback && (
                            <div style={{
                                textAlign: 'center',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                                border: `2px solid ${feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`
                            }}>
                                {feedback.msg}
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};
