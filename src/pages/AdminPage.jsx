import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { SiteManager } from '../components/admin/SiteManager';
import { TeamManager } from '../components/admin/TeamManager';
import { ProblemManager } from '../components/admin/ProblemManager';
import { FaHome, FaCog, FaMapMarkerAlt, FaUsers, FaPalette, FaTrash, FaSignOutAlt, FaUser, FaPlus, FaTimes, FaCrown, FaUserShield, FaGavel, FaListAlt, FaUndo, FaClock, FaCheck, FaBullhorn } from 'react-icons/fa';

// Account Tab Component with Role Management
const AccountTab = ({ user, handleLogout }) => {
    const { isSuperAdmin, users, addUser, removeUser, role } = useAuth();
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('judge');
    const [error, setError] = useState('');

    const handleAddUser = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            setError('Please enter a valid email');
            return;
        }
        try {
            await addUser(newEmail, newRole);
            setNewEmail('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveUser = async (email) => {
        if (window.confirm(`Remove ${email}?`)) {
            try {
                await removeUser(email);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const roleLabels = { admin: '👑 Admin', judge: '⚖️ Judge/Staff' };
    const roleColors = { admin: 'var(--color-accent)', judge: 'var(--color-primary)' };

    return (
        <div className="card" style={{ maxWidth: '700px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-lg)' }}>👤 Account</h3>

            {/* Current User */}
            <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Signed in as:</label>
                <p style={{ fontWeight: '600', margin: 'var(--space-xs) 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user?.email}
                    {isSuperAdmin && <FaCrown style={{ color: 'var(--color-accent)' }} title="Super Admin" />}
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: roleColors[role],
                        color: 'white'
                    }}>
                        {roleLabels[role]}
                    </span>
                </p>
            </div>

            {/* User Management - Only for Admins */}
            {isSuperAdmin && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>👥 Manage Users</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                        <strong>Admins</strong> can access Admin + Judge pages. <strong>Judges</strong> can only enter balloons.
                    </p>

                    {/* Add New User */}
                    <div className="flex gap-sm" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="email@example.com"
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ width: '140px' }}>
                            <option value="judge">⚖️ Judge</option>
                            <option value="admin">👑 Admin</option>
                        </select>
                        <button onClick={handleAddUser} className="btn-primary">
                            <FaPlus /> Add
                        </button>
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-error)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>{error}</p>
                    )}

                    {/* User List */}
                    <div className="flex flex-col gap-sm">
                        {users.map(u => (
                            <div key={u.email} className="flex justify-between items-center" style={{
                                padding: 'var(--space-sm) var(--space-md)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    {u.role === 'admin' ? <FaUserShield style={{ color: roleColors.admin }} /> : <FaGavel style={{ color: roleColors.judge }} />}
                                    {u.email}
                                    {u.email === user?.email?.toLowerCase() && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>(you)</span>
                                    )}
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: 'var(--radius-full)',
                                        background: roleColors[u.role],
                                        color: 'white'
                                    }}>
                                        {u.role}
                                    </span>
                                </span>
                                {u.email !== user?.email?.toLowerCase() && (
                                    <button
                                        onClick={() => handleRemoveUser(u.email)}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button onClick={handleLogout} className="btn-danger" style={{ width: '100%' }}>
                <FaSignOutAlt /> Sign Out
            </button>
        </div>
    );
};

const getBalloonBadges = (b) => {
    if (!b.delivered && !b.published) return [{ label: 'pending', icon: <FaClock />, color: 'var(--color-warning)' }];
    const badges = [];
    if (b.delivered) badges.push({ label: 'delivered', icon: <FaCheck />, color: 'var(--color-success)' });
    if (b.published) badges.push({ label: 'published', icon: <FaBullhorn />, color: 'var(--color-primary)' });
    return badges;
};

const BalloonsManager = ({ balloons, teams, problems, sites, revertBalloon, deleteBalloon }) => {
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [revertedIds, setRevertedIds] = useState(new Set());

    const getTeam = (id) => teams.find(t => t.id === id);
    const getProblem = (id) => problems.find(p => p.id === id);
    const getSite = (id) => sites.find(s => s.id === id);

    const handleRevert = async (id) => {
        await revertBalloon(id);
        setRevertedIds(prev => new Set(prev).add(id));
        setTimeout(() => setRevertedIds(prev => { const next = new Set(prev); next.delete(id); return next; }), 2500);
    };

    const handleDelete = async (id) => {
        await deleteBalloon(id);
        setConfirmDeleteId(null);
    };

    const sorted = [...balloons].sort((a, b) => b.timestamp - a.timestamp);

    if (sorted.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No balloons logged yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-sm">
            {sorted.map(b => {
                const team = getTeam(b.teamId);
                const problem = getProblem(b.problemId);
                const site = getSite(b.siteId);
                const color = problem?.color || '#888';
                const timeAgo = Math.floor((Date.now() - b.timestamp) / 60000);
                const justReverted = revertedIds.has(b.id);
                const confirmingDelete = confirmDeleteId === b.id;

                return (
                    <div key={b.id} className="card" style={{ borderLeft: `4px solid ${color}`, padding: 'var(--space-md)' }}>
                        <div className="flex justify-between items-center flex-wrap gap-sm">
                            <div className="flex flex-col gap-xs">
                                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                                        {team ? (team.displayName || team.name) : 'Unknown Team'}
                                    </span>
                                    {team?.displayName && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '400', color: 'var(--text-dim)', background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 'var(--radius-full)', fontFamily: 'monospace' }}>
                                            {team.name}
                                        </span>
                                    )}
                                    {getBalloonBadges(b).map(badge => (
                                        <span key={badge.label} style={{
                                            fontSize: '0.75rem', padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            background: badge.color + '22',
                                            color: badge.color,
                                            display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600'
                                        }}>
                                            {badge.icon} {badge.label}
                                        </span>
                                    ))}
                                    {justReverted && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '600' }}>
                                            ✓ Reverted
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <span style={{ color }}>Problem {problem?.name || '?'}{problem?.colorName ? ` — ${problem.colorName}` : ''}</span>
                                    <span>{site?.name || 'Unknown site'}</span>
                                    <span>{timeAgo}m ago</span>
                                </div>
                            </div>
                            <div className="flex gap-sm items-center">
                                {(b.delivered || b.published) && (
                                    <button
                                        onClick={() => handleRevert(b.id)}
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <FaUndo /> Revert
                                    </button>
                                )}
                                {confirmingDelete ? (
                                    <div className="flex gap-sm items-center">
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>Delete?</span>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            style={{ background: 'var(--color-error)', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDeleteId(b.id)}
                                        style={{ background: 'none', border: '2px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const AdminPage = () => {
    const { resetData, resetBalloons, revertBalloon, deleteBalloon, sites, teams, problems, balloons } = useBalloonContext();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('sites');

    const [confirmReset, setConfirmReset] = useState(null); // 'balloons' | 'all'

    const handleReset = async () => {
        if (confirmReset === 'all') {
            await resetData();
            setConfirmReset(null);
        } else {
            setConfirmReset('all');
        }
    };

    const handleResetBalloons = async () => {
        if (confirmReset === 'balloons') {
            await resetBalloons();
            setConfirmReset(null);
        } else {
            setConfirmReset('balloons');
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const tabs = [
        { id: 'sites', label: 'Sites', icon: <FaMapMarkerAlt />, count: sites.length },
        { id: 'problems', label: 'Problems', icon: <FaPalette />, count: problems.length },
        { id: 'teams', label: 'Teams', icon: <FaUsers />, count: teams.length },
        { id: 'balloons', label: 'Balloons', icon: <FaListAlt />, count: balloons.length },
        { id: 'account', label: 'Account', icon: <FaUser /> },
        { id: 'danger', label: 'Reset', icon: <FaTrash />, danger: true },
    ];

    return (
        <div className="container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
            {/* Header */}
            <header className="page-header flex justify-between items-center flex-wrap gap-md">
                <div className="page-title">
                    <h1 className="page-title-main">
                        <FaCog style={{ marginRight: '8px' }} />
                        Admin Panel
                    </h1>
                    <p className="page-title-sub">Configure your competition</p>
                </div>
                <Link to="/" className="btn-secondary">
                    <FaHome /> Home
                </Link>
            </header>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)'
            }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>{sites.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sites</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-secondary)' }}>{problems.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Problems</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-accent)' }}>{teams.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Teams</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-success)' }}>{balloons.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Balloons</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-xs)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid',
                            borderColor: activeTab === tab.id
                                ? (tab.danger ? 'var(--color-error)' : 'var(--color-primary)')
                                : 'var(--border-color)',
                            background: activeTab === tab.id
                                ? (tab.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)')
                                : 'var(--bg-card)',
                            color: activeTab === tab.id
                                ? (tab.danger ? 'var(--color-error)' : 'var(--color-primary)')
                                : 'var(--text-main)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span style={{
                                background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--bg-elevated)',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'sites' && <SiteManager />}
                {activeTab === 'problems' && <ProblemManager />}
                {activeTab === 'teams' && <TeamManager />}
                {activeTab === 'account' && <AccountTab user={user} handleLogout={handleLogout} />}
                {activeTab === 'balloons' && (
                    <BalloonsManager
                        balloons={balloons}
                        teams={teams}
                        problems={problems}
                        sites={sites}
                        revertBalloon={revertBalloon}
                        deleteBalloon={deleteBalloon}
                    />
                )}
                {activeTab === 'danger' && (
                    <div className="flex flex-col gap-md" style={{ maxWidth: '500px' }}>
                        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ color: 'var(--color-error)', marginTop: 0, marginBottom: 'var(--space-sm)' }}>
                                🎈 Reset Balloons Only
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Deletes all balloon records but keeps sites, teams, and problems intact.
                            </p>
                            {confirmReset === 'balloons' ? (
                                <div className="flex gap-sm">
                                    <button onClick={handleResetBalloons} className="btn-danger" style={{ flex: 1 }}>
                                        <FaTrash /> Confirm Reset
                                    </button>
                                    <button onClick={() => setConfirmReset(null)} className="btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleResetBalloons} className="btn-danger" style={{ width: '100%' }}>
                                    <FaTrash /> Reset Balloons
                                </button>
                            )}
                        </div>
                        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <h3 style={{ color: 'var(--color-error)', marginTop: 0, marginBottom: 'var(--space-sm)' }}>
                                ⚠️ Reset Everything
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Permanently deletes <strong>all</strong> sites, teams, problems, and balloon records.
                            </p>
                            {confirmReset === 'all' ? (
                                <div className="flex gap-sm">
                                    <button onClick={handleReset} className="btn-danger" style={{ flex: 1 }}>
                                        <FaTrash /> Confirm Delete All
                                    </button>
                                    <button onClick={() => setConfirmReset(null)} className="btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleReset} className="btn-danger" style={{ width: '100%' }}>
                                    <FaTrash /> DELETE EVERYTHING
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
