import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { FaBoxOpen, FaClock, FaMapMarkerAlt, FaCheck, FaHome, FaFilter, FaGoogle, FaSignOutAlt, FaUser, FaSync } from 'react-icons/fa';

export const VolunteerPage = () => {
    const { balloons, teams, sites, problems, markDelivered } = useBalloonContext();
    const { user, loginWithGoogle, logout } = useAuth();
    const [selectedSiteId, setSelectedSiteId] = useState('all');
    const [loggingIn, setLoggingIn] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    // Auto-refresh every 15 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setLastRefresh(Date.now()); // Trigger re-render
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getProblem = (id) => problems.find(p => p.id === id);
    const getTeam = (id) => teams.find(t => t.id === id);
    const getSite = (id) => sites.find(s => s.id === id);

    // Filter undelivered balloons (independent of published state)
    let pendingBalloons = balloons.filter(b => !b.delivered);

    // Apply site filter
    if (selectedSiteId !== 'all') {
        pendingBalloons = pendingBalloons.filter(b => b.siteId === selectedSiteId);
    }

    // Sort by timestamp
    pendingBalloons.sort((a, b) => a.timestamp - b.timestamp);

    const handleDeliver = (id) => {
        markDelivered(id, user?.email);
    };

    const handleGoogleLogin = async () => {
        setLoggingIn(true);
        await loginWithGoogle();
        setLoggingIn(false);
    };

    const handleManualRefresh = () => {
        setLastRefresh(Date.now());
        setCountdown(15);
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
            <header className="page-header flex justify-between items-center flex-wrap gap-md">
                <div className="page-title">
                    <h1 className="page-title-main">🚀 Balloon Delivery</h1>
                    <p className="page-title-sub" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {pendingBalloons.length} Pending
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
                ) : (
                    <div className="flex justify-between items-center flex-wrap gap-sm">
                        <span style={{ color: 'var(--text-muted)' }}>Sign in to track your deliveries</span>
                        <button onClick={handleGoogleLogin} className="btn-primary" disabled={loggingIn} style={{ padding: '6px 16px' }}>
                            <FaGoogle /> {loggingIn ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                    </div>
                )}
            </div>

            {/* Site Filter */}
            {sites.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
                    <div className="flex items-center gap-md flex-wrap">
                        <div className="flex items-center gap-sm" style={{ color: 'var(--text-muted)' }}>
                            <FaFilter /> <span style={{ fontWeight: '600' }}>Filter by Site:</span>
                        </div>
                        <select
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

            {pendingBalloons.length === 0 ? (
                <div className="card flex flex-col items-center justify-center" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                    <FaBoxOpen size={48} style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-md)' }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>All Caught Up!</h3>
                    <p style={{ color: 'var(--text-dim)' }}>
                        {selectedSiteId === 'all' ? 'No pending balloons to deliver.' : 'No pending balloons for this site.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-md">
                    {pendingBalloons.map(b => {
                        const problem = getProblem(b.problemId);
                        const team = getTeam(b.teamId);
                        const site = getSite(b.siteId);
                        const color = problem ? problem.color : '#888';
                        const timeAgo = Math.floor((Date.now() - b.timestamp) / 60000);

                        return (
                            <div key={b.id} className="card" style={{
                                borderLeft: `6px solid ${color}`,
                            }}>
                                <div className="flex justify-between items-start flex-wrap gap-md">
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                                            {team ? (team.displayName || team.name) : 'Unknown Team'}
                                        </h2>
                                        <div className="flex items-center gap-xs" style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
                                            <FaMapMarkerAlt /> {site ? site.name : 'Unknown'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: color }}>
                                            Problem {problem ? problem.name : '?'}
                                        </div>
                                        <div className="flex items-center gap-xs" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', justifyContent: 'flex-end' }}>
                                            <FaClock /> {timeAgo}m ago
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeliver(b.id)}
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: 'var(--space-md)', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                                >
                                    <FaCheck /> Mark Delivered
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
