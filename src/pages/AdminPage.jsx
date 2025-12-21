import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { SiteManager } from '../components/admin/SiteManager';
import { TeamManager } from '../components/admin/TeamManager';
import { ProblemManager } from '../components/admin/ProblemManager';
import { FaHome, FaCog, FaMapMarkerAlt, FaUsers, FaPalette, FaTrash, FaSignOutAlt, FaUser, FaPlus, FaTimes, FaCrown, FaUserShield, FaGavel } from 'react-icons/fa';

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

export const AdminPage = () => {
    const { resetData, sites, teams, problems, balloons } = useBalloonContext();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('sites');

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            await resetData();
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const tabs = [
        { id: 'sites', label: 'Sites', icon: <FaMapMarkerAlt />, count: sites.length },
        { id: 'problems', label: 'Problems', icon: <FaPalette />, count: problems.length },
        { id: 'teams', label: 'Teams', icon: <FaUsers />, count: teams.length },
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
                {activeTab === 'danger' && (
                    <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', maxWidth: '500px' }}>
                        <h3 style={{ color: 'var(--color-error)', marginTop: 0, marginBottom: 'var(--space-md)' }}>
                            ⚠️ Reset All Data
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            This will <strong>permanently delete</strong> all sites, teams, problems, and balloon records.
                            This action cannot be undone.
                        </p>
                        <button onClick={handleReset} className="btn-danger" style={{ width: '100%' }}>
                            <FaTrash /> DELETE EVERYTHING
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
