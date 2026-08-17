import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { FaTrophy, FaHome, FaFilter, FaUniversity } from 'react-icons/fa';

export const PublicPage = () => {
    const { balloons, teams, sites, getProblemsForSite } = useBalloonContext();
    const [selectedSiteId, setSelectedSiteId] = useState('all');
    const activeSiteId = selectedSiteId === 'all' || sites.some(site => site.id === selectedSiteId)
        ? selectedSiteId
        : 'all';

    const visibleSites = activeSiteId === 'all'
        ? sites
        : sites.filter(site => site.id === activeSiteId);
    const siteAccents = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

    const teamsWithBalloons = teams.filter(team => balloons.some(balloon => balloon.teamId === team.id));

    const siteGroups = visibleSites.map(site => {
        const siteProblems = getProblemsForSite(site.id).sort((a, b) => a.name.localeCompare(b.name));
        const problemLookup = new Map(siteProblems.map(problem => [problem.id, problem]));

        const teamsData = teams
            .filter(team => team.siteId === site.id)
            .map(team => {
                const awardedBalloons = balloons
                    .filter(balloon => balloon.teamId === team.id)
                    .map(balloon => ({
                        ...balloon,
                        problem: problemLookup.get(balloon.problemId)
                    }))
                    .filter(balloon => balloon.problem)
                    .sort((a, b) => a.problem.name.localeCompare(b.problem.name));

                return { ...team, awardedBalloons };
            })
            .filter(team => team.awardedBalloons.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        return { ...site, teams: teamsData };
    }).filter(site => site.teams.length > 0);

    return (
        <div className="container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
            {/* Header */}
            <header className="page-header flex justify-between items-center flex-wrap gap-md">
                <div className="page-title">
                    <h1 className="page-title-main">
                        <FaTrophy style={{ color: 'var(--color-accent)', marginRight: '8px' }} />
                        <span className="text-gradient">Live Scoreboard</span>
                    </h1>
                </div>
                <Link to="/" className="btn-secondary">
                    <FaHome /> Home
                </Link>
            </header>

            {sites.length > 1 && (
                <section className="scoreboard-site-switcher" aria-labelledby="scoreboard-site-filter-label">
                    <div className="scoreboard-site-switcher-heading">
                        <span id="scoreboard-site-filter-label"><FaFilter /> Contest sites</span>
                        <small>Choose a site to focus the scoreboard</small>
                    </div>
                    <div className="scoreboard-site-buttons" role="group" aria-label="Filter scoreboard by site">
                        <button
                            type="button"
                            className={`scoreboard-site-button all-sites ${activeSiteId === 'all' ? 'active' : ''}`}
                            style={{ '--site-accent': 'var(--color-accent)' }}
                            aria-pressed={activeSiteId === 'all'}
                            onClick={() => setSelectedSiteId('all')}
                        >
                            <span className="scoreboard-site-name"><i aria-hidden="true" /> All sites</span>
                            <small>{sites.length} sites · {teamsWithBalloons.length} with balloons</small>
                        </button>
                        {sites.map((site, index) => {
                            const teamCount = teamsWithBalloons.filter(team => team.siteId === site.id).length;
                            return (
                                <button
                                    type="button"
                                    key={site.id}
                                    className={`scoreboard-site-button ${activeSiteId === site.id ? 'active' : ''}`}
                                    style={{ '--site-accent': siteAccents[index % siteAccents.length] }}
                                    aria-pressed={activeSiteId === site.id}
                                    onClick={() => setSelectedSiteId(site.id)}
                                >
                                    <span className="scoreboard-site-name"><i aria-hidden="true" /> {site.name}</span>
                                    <small>{teamCount} {teamCount === 1 ? 'team' : 'teams'} with balloons</small>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Content */}
            <div className="flex flex-col gap-lg">
                {sites.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            No sites configured yet. Add sites in Admin.
                        </p>
                    </div>
                ) : siteGroups.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            No first-accepted balloons yet{activeSiteId === 'all' ? '.' : ' at this site.'}
                        </p>
                    </div>
                ) : siteGroups.map(site => (
                    <section key={site.id}>
                        <div className="site-badge" style={{ marginBottom: 'var(--space-md)' }}>
                            🏢 {site.name}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: 'var(--space-md)'
                        }}>
                            {site.teams.map(team => (
                                <div key={team.id} className="card" style={{
                                    borderLeft: '4px solid var(--color-primary)'
                                }}>
                                    <div style={{
                                        marginTop: 0,
                                        marginBottom: 'var(--space-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {team.displayName || team.name}
                                        </h3>
                                        {team.displayName && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: '400', color: 'var(--text-dim)', background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 'var(--radius-full)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                {team.name}
                                            </span>
                                        )}
                                    </div>

                                    {team.university && (
                                        <div className="flex items-center gap-xs" style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            <FaUniversity aria-hidden="true" />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={team.university}>
                                                {team.university}
                                            </span>
                                        </div>
                                    )}

                                    <div className="balloon-grid">
                                        {team.awardedBalloons.map(balloon => (
                                            <div
                                                key={balloon.problem.id}
                                                className="balloon-slot filled"
                                                title={`Problem ${balloon.problem.name}${balloon.problem.colorName ? ` — ${balloon.problem.colorName}` : ''} ${balloon.problem.color}`}
                                                style={{ backgroundColor: balloon.problem.color }}
                                            >
                                                {balloon.problem.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};
