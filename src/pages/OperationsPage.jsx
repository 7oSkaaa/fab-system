import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaHome, FaUndo } from 'react-icons/fa';

export const OperationsPage = () => {
    const { sites, problems, teams, balloons, addBalloon, revertJudgeBalloon, getProblemsForSite } = useBalloonContext();
    const { user } = useAuth();

    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedProblemId, setSelectedProblemId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [confirmRevertId, setConfirmRevertId] = useState(null);

    const activeSiteId = selectedSiteId || sites[0]?.id || '';
    const siteTeams = teams.filter(t => t.siteId === activeSiteId);

    const takenProblems = new Set();
    balloons.forEach(b => {
        if (b.siteId === activeSiteId) {
            takenProblems.add(b.problemId);
        }
    });

    const getWinnerForProblem = (pId) => {
        const b = balloons.find(b => b.siteId === activeSiteId && b.problemId === pId);
        if (!b) return null;
        const t = teams.find(team => team.id === b.teamId);
        return t ? (t.displayName ? `${t.name} — ${t.displayName}` : t.name) : 'Unknown Team';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeSiteId || !selectedProblemId || !selectedTeamId) {
            setFeedback({ type: 'error', msg: 'Please fill all fields.' });
            return;
        }

        if (takenProblems.has(selectedProblemId)) {
            setFeedback({ type: 'error', msg: `Problem already logged for ${getWinnerForProblem(selectedProblemId)}. Use the Admin panel to revert if needed.` });
            return;
        }

        await addBalloon(selectedProblemId, selectedTeamId, activeSiteId, user?.email);
        setFeedback({ type: 'success', msg: 'Balloon Request Sent!' });
        setSelectedTeamId('');
        setSelectedProblemId('');

        setTimeout(() => setFeedback(null), 3000);
    };

    const handleRevert = async (balloonId) => {
        try {
            await revertJudgeBalloon(balloonId, user?.email);
            setConfirmRevertId(null);
            setFeedback({ type: 'success', msg: 'First Accepted reverted successfully.' });
            setTimeout(() => setFeedback(null), 3000);
        } catch (error) {
            setFeedback({ type: 'error', msg: error instanceof Error ? error.message : 'Could not revert this entry.' });
        }
    };

    const ownBalloons = balloons
        .filter(balloon => balloon.loggedBy === user?.email)
        .sort((a, b) => b.timestamp - a.timestamp);

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
                            value={activeSiteId}
                            onChange={(e) => {
                                setSelectedSiteId(e.target.value);
                                setSelectedTeamId('');
                                setSelectedProblemId('');
                            }}
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
                                {(activeSiteId ? getProblemsForSite(activeSiteId) : problems).slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => {
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
                                            {p.colorName && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400', display: 'block', marginTop: '2px' }}>
                                                    {p.colorName}
                                                </span>
                                            )}
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
                                    <option key={t.id} value={t.id}>{t.displayName ? `${t.name} — ${t.displayName}` : t.name}</option>
                                ))}
                            </select>
                            {siteTeams.length === 0 && <span style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>No teams for this site.</span>}
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '14px 24px', fontSize: '1.1rem' }}
                            disabled={!selectedProblemId || !selectedTeamId || takenProblems.has(selectedProblemId)}
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

                    {ownBalloons.length > 0 && (
                        <div className="card flex flex-col gap-sm">
                            <h3 style={{ margin: 0 }}>My First Accepted entries</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                You can revert an entry until delivery or publication begins. After that, ask an admin.
                            </p>
                            {ownBalloons.map(balloon => {
                                const problem = problems.find(item => item.id === balloon.problemId);
                                const team = teams.find(item => item.id === balloon.teamId);
                                const canRevert = !balloon.delivered && !balloon.published;
                                const confirming = confirmRevertId === balloon.id;
                                return (
                                    <div key={balloon.id} className="flex justify-between items-center gap-sm flex-wrap" style={{ padding: 'var(--space-sm)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                                        <span>
                                            <strong>Problem {problem?.name || '?'}</strong> — {team ? (team.displayName || team.name) : 'Unknown Team'}
                                        </span>
                                        {confirming ? (
                                            <div className="flex items-center gap-sm" role="alert">
                                                <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>Revert this First Accepted?</span>
                                                <button onClick={() => handleRevert(balloon.id)} className="btn-danger" style={{ padding: '5px 10px' }}>Confirm</button>
                                                <button onClick={() => setConfirmRevertId(null)} className="btn-secondary" style={{ padding: '5px 10px' }}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmRevertId(balloon.id)}
                                                className="btn-secondary"
                                                style={{ padding: '6px 10px' }}
                                                disabled={!canRevert}
                                                title={canRevert ? 'Revert First Accepted' : 'Only an admin can revert after delivery or publication'}
                                            >
                                                <FaUndo /> Revert
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
