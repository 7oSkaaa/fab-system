import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { SiteManager } from '../components/admin/SiteManager';
import { TeamManager } from '../components/admin/TeamManager';
import { ProblemManager } from '../components/admin/ProblemManager';
import { FaHome, FaCog, FaMapMarkerAlt, FaUsers, FaPalette, FaTrash } from 'react-icons/fa';

export const AdminPage = () => {
    const { resetData, sites, teams, problems, balloons } = useBalloonContext();
    const [activeTab, setActiveTab] = useState('sites');

    const handleReset = () => {
        if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            resetData();
        }
    };

    const tabs = [
        { id: 'sites', label: 'Sites', icon: <FaMapMarkerAlt />, count: sites.length },
        { id: 'problems', label: 'Problems', icon: <FaPalette />, count: problems.length },
        { id: 'teams', label: 'Teams', icon: <FaUsers />, count: teams.length },
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
