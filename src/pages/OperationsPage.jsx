import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { FaCheck, FaExclamationTriangle, FaHome, FaSearch, FaChevronDown } from 'react-icons/fa';
import { balloonFillStyle } from '../utils/colorContrast';

const BalloonIcon = () => (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M12 1.8c3.95 0 7.15 3.35 7.15 7.5 0 3.55-2.2 6.55-5.45 8.35L12 22.2l-1.7-4.55C7.05 15.85 4.85 12.85 4.85 9.3 4.85 5.15 8.05 1.8 12 1.8Zm0 2.3c-2.7 0-4.85 2.3-4.85 5.2 0 2.75 1.7 5.1 4.2 6.45.4.22.9.22 1.3 0 2.5-1.35 4.2-3.7 4.2-6.45 0-2.9-2.15-5.2-4.85-5.2Z"
        />
    </svg>
);

const getTeamLabel = team => `${team.seatNumber || team.name} — ${team.displayName || team.name}${team.university ? ` — ${team.university}` : ''}`;

export const OperationsPage = () => {
    const { sites, problems, teams, balloons, addBalloon, getProblemsForSite } = useBalloonContext();
    const { user } = useAuth();

    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedProblemId, setSelectedProblemId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [teamSearch, setTeamSearch] = useState('');
    const [teamMenuOpen, setTeamMenuOpen] = useState(false);
    const [activeTeamIndex, setActiveTeamIndex] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const teamPickerRef = useRef(null);

    const activeSiteId = selectedSiteId || sites[0]?.id || '';
    const siteTeams = teams.filter(t => t.siteId === activeSiteId);
    const normalizedTeamSearch = teamSearch.trim().toLowerCase();
    const filteredTeams = siteTeams
        .filter(team => !normalizedTeamSearch || [team.seatNumber, team.name, team.displayName, team.university]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(normalizedTeamSearch)))
        .sort((a, b) => String(a.seatNumber || a.name).localeCompare(String(b.seatNumber || b.name), undefined, { numeric: true }));

    const selectTeam = team => {
        setSelectedTeamId(team.id);
        setTeamSearch(getTeamLabel(team));
        setTeamMenuOpen(false);
    };

    const handleTeamKeyDown = event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setTeamMenuOpen(true);
            if (filteredTeams.length === 0) return;
            setActiveTeamIndex(current => {
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                return (current + direction + filteredTeams.length) % filteredTeams.length;
            });
        } else if (event.key === 'Enter' && teamMenuOpen && filteredTeams[activeTeamIndex]) {
            event.preventDefault();
            selectTeam(filteredTeams[activeTeamIndex]);
        } else if (event.key === 'Escape') {
            setTeamMenuOpen(false);
        }
    };

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

    const selectedProblem = (activeSiteId ? getProblemsForSite(activeSiteId) : problems)
        .find(problem => problem.id === selectedProblemId);
    const selectedTeam = siteTeams.find(team => team.id === selectedTeamId);
    const canLog = Boolean(selectedProblemId && selectedTeamId && !takenProblems.has(selectedProblemId));
    const logHint = !selectedProblemId
        ? 'Choose a problem to continue'
        : takenProblems.has(selectedProblemId)
            ? `Already logged for ${getWinnerForProblem(selectedProblemId)}`
            : !selectedTeamId
                ? 'Choose the team that solved it'
                : `Send ${selectedProblem?.name || 'problem'} balloon to operations`;

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
        setTeamSearch('');
        setTeamMenuOpen(false);
        setSelectedProblemId('');

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
                <div className="flex flex-col gap-lg" style={{ maxWidth: '880px', margin: '0 auto' }}>
                    {/* Site Selector */}
                    <div className="card">
                        <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontWeight: '600' }}>Current Site:</label>
                        <select
                            value={activeSiteId}
                            onChange={(e) => {
                                setSelectedSiteId(e.target.value);
                                setSelectedTeamId('');
                                setTeamSearch('');
                                setTeamMenuOpen(false);
                                setSelectedProblemId('');
                            }}
                            style={{ fontSize: '1.1rem' }}
                        >
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="card judge-entry-form flex flex-col gap-lg">
                        {/* Problem Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontWeight: '600' }}>Select Problem</label>
                            <div className="judge-problem-grid">
                                {(activeSiteId ? getProblemsForSite(activeSiteId) : problems).slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => {
                                    const isTaken = takenProblems.has(p.id);
                                    const isSelected = selectedProblemId === p.id;
                                    const problemTitle = p.fullName || `Problem ${p.name}`;
                                    return (
                                        <button
                                            type="button"
                                            key={p.id}
                                            className={`judge-problem-card${isSelected ? ' selected' : ''}${isTaken ? ' taken' : ''}`}
                                            style={{ '--problem-color': p.color }}
                                            aria-pressed={isSelected}
                                            aria-label={isTaken ? `${problemTitle}, already logged` : problemTitle}
                                            onClick={() => setSelectedProblemId(p.id)}
                                        >
                                            <span className="judge-problem-swatch">
                                                <span className="judge-problem-letter" style={balloonFillStyle(p.color)}>
                                                    {p.name}
                                                </span>
                                                {isTaken && (
                                                    <span className="judge-problem-check" aria-hidden="true">
                                                        <FaCheck />
                                                    </span>
                                                )}
                                            </span>
                                            <span className="judge-problem-copy">
                                                <strong title={problemTitle}>{problemTitle}</strong>
                                                <small>
                                                    {isTaken
                                                        ? getWinnerForProblem(p.id)
                                                        : (p.colorName ? `${p.colorName} balloon` : `Problem ${p.name}`)}
                                                </small>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedProblemId && takenProblems.has(selectedProblemId) && (
                                <p style={{ color: 'var(--color-warning)', fontSize: '0.9rem', marginTop: 'var(--space-sm)' }}>
                                    <FaExclamationTriangle /> Already logged for {getWinnerForProblem(selectedProblemId)}
                                </p>
                            )}
                        </div>

                        {/* Team Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontWeight: '600' }}>Select Team:</label>
                            <div
                                className="team-combobox"
                                ref={teamPickerRef}
                                onBlur={(event) => {
                                    if (!event.currentTarget.contains(event.relatedTarget)) setTeamMenuOpen(false);
                                }}
                            >
                                <FaSearch aria-hidden="true" />
                                <input
                                    type="search"
                                    value={teamSearch}
                                    onChange={(e) => {
                                        setTeamSearch(e.target.value);
                                        setSelectedTeamId('');
                                        setActiveTeamIndex(0);
                                        setTeamMenuOpen(true);
                                    }}
                                    onFocus={() => setTeamMenuOpen(true)}
                                    onKeyDown={handleTeamKeyDown}
                                    placeholder="Search seat, team, or university"
                                    role="combobox"
                                    aria-label="Search and select team"
                                    aria-expanded={teamMenuOpen}
                                    aria-controls="team-options"
                                    aria-autocomplete="list"
                                    disabled={!siteTeams.length}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className="team-combobox-toggle"
                                    onClick={() => setTeamMenuOpen(open => !open)}
                                    aria-label="Toggle team options"
                                    tabIndex={-1}
                                    disabled={!siteTeams.length}
                                >
                                    <FaChevronDown />
                                </button>
                                {teamMenuOpen && (
                                    <div className="team-options" id="team-options" role="listbox">
                                        {filteredTeams.length ? filteredTeams.map((team, index) => (
                                            <button
                                                type="button"
                                                key={team.id}
                                                role="option"
                                                aria-selected={selectedTeamId === team.id}
                                                className={index === activeTeamIndex ? 'team-option active' : 'team-option'}
                                                onMouseDown={(event) => event.preventDefault()}
                                                onMouseEnter={() => setActiveTeamIndex(index)}
                                                onClick={() => selectTeam(team)}
                                            >
                                                <strong className="team-option-seat">
                                                    <span>Seat</span>
                                                    {team.seatNumber || team.name}
                                                </strong>
                                                <span className="team-option-name">{team.displayName || team.name}</span>
                                                {team.university && <small className="team-option-university">{team.university}</small>}
                                            </button>
                                        )) : (
                                            <div className="team-option-empty">No teams match “{teamSearch}”.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {siteTeams.length === 0 && <span style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>No teams for this site.</span>}
                        </div>

                        <button
                            type="submit"
                            className="judge-log-button"
                            disabled={!canLog}
                        >
                            <span className="judge-log-button-icon" aria-hidden="true">
                                <BalloonIcon />
                            </span>
                            <span className="judge-log-button-copy">
                                <strong>Log first accepted</strong>
                                <small>
                                    {canLog
                                        ? `${selectedProblem?.name} · ${selectedTeam?.displayName || selectedTeam?.name}`
                                        : logHint}
                                </small>
                            </span>
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
