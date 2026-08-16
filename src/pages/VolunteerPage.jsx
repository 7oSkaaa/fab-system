import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { BalloonAlerts } from '../components/BalloonAlerts';
import { OperationsHistory } from '../components/OperationsHistory';
import { FaBoxOpen, FaClock, FaCheck, FaBullhorn, FaHome, FaFilter, FaGoogle, FaSignOutAlt, FaUser, FaSync, FaUniversity, FaHistory, FaTasks } from 'react-icons/fa';

const isInAppBrowser = () => {
    const ua = navigator.userAgent;
    return /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|MicroMessenger/.test(ua) ||
        (/iPhone|iPod|iPad/.test(ua) && !/Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua));
};

const sortByDeliveryPriority = (firstBalloon, secondBalloon) => {
    const deliveryPriority = Number(firstBalloon.delivered) - Number(secondBalloon.delivered);
    if (deliveryPriority !== 0) return deliveryPriority;

    return (firstBalloon.timestamp ?? Number.MAX_SAFE_INTEGER) -
        (secondBalloon.timestamp ?? Number.MAX_SAFE_INTEGER);
};

export const VolunteerPage = () => {
    const { balloons, teams, sites, problems, markDelivered, markPublished } = useBalloonContext();
    const { user, loginWithGoogle, logout } = useAuth();
    const [selectedSiteId, setSelectedSiteId] = useState('all');
    const [loggingIn, setLoggingIn] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [activeView, setActiveView] = useState('queue');

    // Auto-refresh every 15 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev <= 1 ? 15 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getProblem = (id) => problems.find(p => p.id === id);
    const getTeam = (id) => teams.find(t => t.id === id);
    const getSite = (id) => sites.find(s => s.id === id);

    const siteBalloons = selectedSiteId === 'all'
        ? balloons
        : balloons.filter(balloon => balloon.siteId === selectedSiteId);

    // Keep the ticket visible until both delivery and publication are complete.
    const pendingBalloons = siteBalloons.filter(balloon => !balloon.delivered || !balloon.published);
    const historyBalloons = siteBalloons
        .filter(balloon => balloon.delivered || balloon.published)
        .sort((firstBalloon, secondBalloon) => {
            const firstActionAt = Math.max(firstBalloon.deliveredAt || 0, firstBalloon.publishedAt || 0, firstBalloon.timestamp || 0);
            const secondActionAt = Math.max(secondBalloon.deliveredAt || 0, secondBalloon.publishedAt || 0, secondBalloon.timestamp || 0);
            return secondActionAt - firstActionAt;
        });

    // Undelivered balloons are urgent; within each group, handle the oldest first.
    pendingBalloons.sort(sortByDeliveryPriority);

    const handleDeliver = (id) => {
        markDelivered(id, user?.email);
    };

    const handlePublish = (id) => {
        markPublished(id, user?.email);
    };

    const handleGoogleLogin = async () => {
        setLoggingIn(true);
        await loginWithGoogle();
        setLoggingIn(false);
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
            <BalloonAlerts
                audience="Operations"
            />
            <header className="page-header flex justify-between items-center flex-wrap gap-md">
                <div className="page-title">
                    <h1 className="page-title-main">🎈 Balloon Operations</h1>
                    <p className="page-title-sub" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {activeView === 'queue' ? `${pendingBalloons.length} Pending` : `${historyBalloons.length} Activity Records`}
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <FaSync style={{ fontSize: '0.6rem' }} /> {countdown}s
                        </span>
                    </p>
                </div>
                <Link to="/" className="btn-secondary">
                    <FaHome /> Home
                </Link>
            </header>

            {/* User Login/Info Bar */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
                {user ? (
                    <div className="flex justify-between items-center flex-wrap gap-sm">
                        <div className="flex items-center gap-sm">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                            ) : (
                                <FaUser style={{ color: 'var(--text-muted)' }} />
                            )}
                            <span style={{ fontWeight: '500' }}>{user.email}</span>
                        </div>
                        <button onClick={logout} className="btn-secondary" style={{ padding: '6px 12px' }}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                ) : isInAppBrowser() ? (
                    <div className="flex justify-between items-center flex-wrap gap-sm">
                        <span style={{ color: 'var(--color-warning)', fontSize: '0.9rem' }}>
                            Open in Safari or Chrome to sign in — Google blocks in-app browsers.
                        </span>
                        <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="btn-secondary" style={{ padding: '6px 12px' }}>
                            Copy Link
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center flex-wrap gap-sm">
                        <span style={{ color: 'var(--text-muted)' }}>Sign in to track deliveries and publications</span>
                        <button onClick={handleGoogleLogin} className="btn-primary" disabled={loggingIn} style={{ padding: '6px 16px' }}>
                            <FaGoogle /> {loggingIn ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                    </div>
                )}
            </div>

            <div className="operations-view-switcher" role="tablist" aria-label="Balloon operations views">
                <button
                    type="button"
                    id="queue-tab"
                    role="tab"
                    aria-selected={activeView === 'queue'}
                    aria-controls="queue-panel"
                    className={activeView === 'queue' ? 'active' : ''}
                    onClick={() => setActiveView('queue')}
                >
                    <FaTasks aria-hidden="true" />
                    <span>Active Queue<small>Balloon actions still waiting</small></span>
                    <strong>{pendingBalloons.length}</strong>
                </button>
                <button
                    type="button"
                    id="history-tab"
                    role="tab"
                    aria-selected={activeView === 'history'}
                    aria-controls="history-panel"
                    className={activeView === 'history' ? 'active' : ''}
                    onClick={() => setActiveView('history')}
                >
                    <FaHistory aria-hidden="true" />
                    <span>Activity History<small>Delivered and published records</small></span>
                    <strong>{historyBalloons.length}</strong>
                </button>
            </div>

            {/* Site Filter */}
            {sites.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
                    <div className="flex items-center gap-md flex-wrap">
                        <label htmlFor="operations-site-filter" className="flex items-center gap-sm" style={{ color: 'var(--text-muted)' }}>
                            <FaFilter /> <span style={{ fontWeight: '600' }}>Filter by Site:</span>
                        </label>
                        <select
                            id="operations-site-filter"
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                            style={{ minWidth: '200px', flex: 1, maxWidth: '300px' }}
                        >
                            <option value="all">All Sites</option>
                            {sites.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <section
                id={`${activeView}-panel`}
                role="tabpanel"
                aria-labelledby={`${activeView}-tab`}
            >
            {activeView === 'history' ? (
                <OperationsHistory
                    balloons={historyBalloons}
                    getTeam={getTeam}
                    getProblem={getProblem}
                    getSite={getSite}
                />
            ) : pendingBalloons.length === 0 ? (
                <div className="card flex flex-col items-center justify-center" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                    <FaBoxOpen size={48} style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-md)' }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>All Caught Up!</h3>
                    <p style={{ color: 'var(--text-dim)' }}>
                        {selectedSiteId === 'all' ? 'No balloons waiting for delivery or publication.' : 'No pending balloons for this site.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-md">
                    {pendingBalloons.map(b => {
                        const problem = getProblem(b.problemId);
                        const team = getTeam(b.teamId);
                        const site = getSite(b.siteId);
                        const color = problem ? problem.color : '#888';
                        const loggedAt = new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={b.id} className="card" style={{
                                borderLeft: `6px solid ${color}`,
                            }}>
                                <div className="ticket-details">
                                    <div className="ticket-team-details">
                                        <div className="seat-number">Seat {team?.seatNumber || team?.name || '?'}</div>
                                        <h2 style={{ margin: '6px 0 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            {team ? (team.displayName || team.name) : 'Unknown Team'}
                                        </h2>
                                        <div style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                                            Site: {site ? site.name : 'Unknown'}
                                        </div>
                                        {team?.university && (
                                            <div className="flex items-center gap-xs" style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.85rem' }}>
                                                <FaUniversity /> {team.university}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ticket-problem-details">
                                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            Problem {problem ? problem.name : '?'}
                                        </div>
                                        <div className="ticket-problem-name">
                                            {problem?.fullName || `Problem ${problem?.name || '?'}`}
                                        </div>
                                        {problem?.colorName && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {problem.colorName} <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{problem.color}</span>
                                            </div>
                                        )}
                                        <div className="ticket-time flex items-center gap-xs">
                                            <FaClock /> {loggedAt}
                                        </div>
                                    </div>
                                </div>

                                <div className="ticket-actions">
                                    <button
                                        onClick={() => handleDeliver(b.id)}
                                        className={b.delivered ? 'ticket-action completed' : 'ticket-action deliver'}
                                        disabled={b.delivered}
                                    >
                                        <FaCheck /> {b.delivered ? 'Delivered' : 'Mark Delivered'}
                                    </button>
                                    <button
                                        onClick={() => handlePublish(b.id)}
                                        className={b.published ? 'ticket-action completed' : 'ticket-action publish'}
                                        disabled={b.published}
                                    >
                                        <FaBullhorn /> {b.published ? 'Published' : 'Mark Published'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </section>
        </div>
    );
};
