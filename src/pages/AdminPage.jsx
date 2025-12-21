import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { SiteManager } from '../components/admin/SiteManager';
import { TeamManager } from '../components/admin/TeamManager';
import { ProblemManager } from '../components/admin/ProblemManager';
import { FaHome, FaCog, FaMapMarkerAlt, FaUsers, FaPalette, FaTrash, FaSignOutAlt, FaUser, FaPlus, FaTimes, FaCrown } from 'react-icons/fa';

// Account Tab Component
const AccountTab = ({ user, handleLogout }) => {
    const { isSuperAdmin, adminEmails, addAdmin, removeAdmin } = useAuth();
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');

    const handleAddAdmin = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            setError('Please enter a valid email');
            return;
        }
        try {
            await addAdmin(newEmail);
            setNewEmail('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (window.confirm(`Remove ${email} from admins?`)) {
            try {
                await removeAdmin(email);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-lg)' }}>👤 Account</h3>

            {/* Current User */}
            <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Signed in as:</label>
                <p style={{ fontWeight: '600', margin: 'var(--space-xs) 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user?.email}
                    {isSuperAdmin && <FaCrown style={{ color: 'var(--color-accent)' }} title="Super Admin" />}
                </p>
            </div>

            {/* Admin Management - Only for Super Admin */}
            {isSuperAdmin && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>👥 Admin Emails</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                        These emails can access Admin and Judge/Staff pages.
                    </p>

                    {/* Add New Admin */}
                    <div className="flex gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="new-admin@email.com"
                            style={{ flex: 1 }}
                        />
                        <button onClick={handleAddAdmin} className="btn-primary">
                            <FaPlus /> Add
                        </button>
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-error)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>{error}</p>
                    )}

                    {/* Admin List */}
                    <div className="flex flex-col gap-sm">
                        {adminEmails.map(email => (
                            <div key={email} className="flex justify-between items-center" style={{
                                padding: 'var(--space-sm) var(--space-md)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {email}
                                    {email === user?.email?.toLowerCase() && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>(you)</span>
                                    )}
                                </span>
                                {email !== user?.email?.toLowerCase() && (
                                    <button
                                        onClick={() => handleRemoveAdmin(email)}
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
