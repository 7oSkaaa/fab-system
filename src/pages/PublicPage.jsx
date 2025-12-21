import React from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { FaTrophy, FaHome } from 'react-icons/fa';

export const PublicPage = () => {
    const { balloons, teams, sites, getProblemsForSite } = useBalloonContext();

    const siteGroups = sites.map(site => {
        let siteTeams = teams.filter(t => t.siteId === site.id);
        siteTeams.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        // Get problems for THIS site (global + site-specific)
        const siteProblems = getProblemsForSite(site.id).sort((a, b) => a.name.localeCompare(b.name));

        const teamsData = siteTeams.map(team => {
            const teamBalloons = balloons.filter(b => b.teamId === team.id);
            const balloonLookup = new Map(teamBalloons.map(b => [b.problemId, b]));
            return { ...team, balloonLookup };
        });

        return { ...site, teams: teamsData, problems: siteProblems };
    });

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

            {/* Content */}
            <div className="flex flex-col gap-lg">
                {siteGroups.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            No sites configured yet. Add sites in Admin.
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
                            {site.teams.length === 0 ? (
                                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No teams in this site.</p>
                                </div>
                            ) : site.teams.map(team => (
                                <div key={team.id} className="card" style={{
                                    borderLeft: '4px solid var(--color-primary)'
                                }}>
                                    <h3 style={{
                                        marginTop: 0,
                                        marginBottom: 'var(--space-sm)',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {team.name}
                                    </h3>

                                    {site.problems.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No problems defined.</p>
                                    ) : (
                                        <div className="balloon-grid">
                                            {site.problems.map(p => {
                                                const hasBalloon = team.balloonLookup.has(p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        className={`balloon-slot ${hasBalloon ? 'filled' : ''}`}
                                                        title={`Problem ${p.name}`}
                                                        style={hasBalloon ? { backgroundColor: p.color } : {}}
                                                    >
                                                        {hasBalloon ? '🎈' : p.name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};
