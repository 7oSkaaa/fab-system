import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBalloonContext } from '../contexts/BalloonContext';
import { useAuth } from '../contexts/AuthContext';
import { SiteManager } from '../components/admin/SiteManager';
import { TeamManager } from '../components/admin/TeamManager';
import { ProblemManager } from '../components/admin/ProblemManager';
import { FaHome, FaCog, FaMapMarkerAlt, FaUsers, FaPalette, FaTrash, FaSignOutAlt, FaUser, FaPlus, FaTimes, FaCrown, FaUserShield, FaGavel, FaListAlt, FaUndo, FaClock, FaCheck, FaBullhorn, FaChevronDown } from 'react-icons/fa';
import { balloonFillStyle } from '../utils/colorContrast';

const ROLE_LABELS = { superAdmin: 'Super admin', admin: 'Admin', judge: 'Judge' };
const ROLE_STYLES = {
    superAdmin: {
        icon: 'var(--color-warning)',
        badge: {
            background: 'rgba(245, 158, 11, 0.14)',
            color: 'var(--color-warning)',
            border: '1px solid rgba(245, 158, 11, 0.42)'
        }
    },
    admin: {
        icon: 'var(--color-primary)',
        badge: {
            background: 'rgba(20, 87, 217, 0.12)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(20, 87, 217, 0.34)'
        }
    },
    judge: {
        icon: 'var(--color-success)',
        badge: {
            background: 'rgba(22, 163, 74, 0.12)',
            color: 'var(--color-success)',
            border: '1px solid rgba(22, 163, 74, 0.34)'
        }
    }
};
const ROLE_SORT_ORDER = { superAdmin: 0, admin: 1, judge: 2 };
const ROLE_ICONS = {
    superAdmin: FaCrown,
    admin: FaUserShield,
    judge: FaGavel
};

// Account Tab Component with Role Management
const AccountTab = ({ user, handleLogout }) => {
    const { isAdmin, isSuperAdmin, isProtectedSuperAdminEmail, users, addUser, removeUser, role } = useAuth();
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('judge');
    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const [error, setError] = useState('');

    const handleAddUser = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            setError('Please enter a valid email');
            return;
        }
        if (!isSuperAdmin && newRole !== 'judge') {
            setError('Admins can only add judges');
            return;
        }
        try {
            await addUser(newEmail, newRole);
            setNewEmail('');
            setRoleMenuOpen(false);
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

    const getDisplayRole = (email, userRole) => (
        isProtectedSuperAdminEmail(email) || userRole === 'superAdmin' ? 'superAdmin' : userRole
    );
    const currentDisplayRole = getDisplayRole(user?.email, role);
    const sortedUsers = users.toSorted((a, b) => {
        const roleDelta = ROLE_SORT_ORDER[getDisplayRole(a.email, a.role)] - ROLE_SORT_ORDER[getDisplayRole(b.email, b.role)];
        return roleDelta || a.email.localeCompare(b.email);
    });
    const availableRoles = isSuperAdmin ? ['superAdmin', 'admin', 'judge'] : ['judge'];
    const CurrentRoleIcon = ROLE_ICONS[currentDisplayRole];
    const NewRoleIcon = ROLE_ICONS[newRole];

    return (
        <div className="card" style={{ maxWidth: '700px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-lg)' }}>👤 Account</h3>

            {/* Current User */}
            <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Signed in as:</span>
                <p style={{ fontWeight: '600', margin: 'var(--space-xs) 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user?.email}
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        ...ROLE_STYLES[currentDisplayRole].badge
                    }}>
                        <CurrentRoleIcon style={{ fontSize: '0.72rem' }} />
                        {ROLE_LABELS[currentDisplayRole]}
                    </span>
                </p>
            </div>

            {/* User Management - Only for Admins */}
            {isAdmin && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>👥 Manage Users</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                        <strong>Super admins</strong> can add any role. <strong>Admins</strong> can add judges only.
                    </p>

                    {/* Add New User */}
                    <div className="flex gap-sm" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                        <input
                            aria-label="User email"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="email@example.com"
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <div style={{ position: 'relative', flex: '0 0 170px', minWidth: '170px' }}>
                            <button
                                type="button"
                                aria-label="User role"
                                aria-haspopup="listbox"
                                aria-expanded={roleMenuOpen}
                                onClick={() => setRoleMenuOpen(open => !open)}
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '10px',
                                    padding: '0 14px',
                                    background: 'var(--bg-elevated)',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-main)',
                                    fontWeight: 600,
                                    lineHeight: 1
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <NewRoleIcon style={{ color: ROLE_STYLES[newRole].icon, flexShrink: 0 }} />
                                    {ROLE_LABELS[newRole]}
                                </span>
                                <FaChevronDown style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }} />
                            </button>
                            {roleMenuOpen && (
                                <div
                                    role="listbox"
                                    aria-label="Choose user role"
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 6px)',
                                        left: 0,
                                        right: 0,
                                        zIndex: 10,
                                        padding: '4px',
                                        background: 'var(--bg-card)',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-lg)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {availableRoles.map(optionRole => {
                                        const OptionIcon = ROLE_ICONS[optionRole];
                                        return (
                                            <button
                                                key={optionRole}
                                                type="button"
                                                role="option"
                                                aria-selected={newRole === optionRole}
                                                onClick={() => {
                                                    setNewRole(optionRole);
                                                    setRoleMenuOpen(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    minHeight: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                    gap: '8px',
                                                    padding: '0 10px',
                                                    background: newRole === optionRole ? 'var(--bg-elevated)' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-main)',
                                                    fontWeight: 600,
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <OptionIcon style={{ color: ROLE_STYLES[optionRole].icon, flexShrink: 0 }} />
                                                {ROLE_LABELS[optionRole]}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <button onClick={handleAddUser} className="btn-primary">
                            <FaPlus /> Add
                        </button>
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-error)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>{error}</p>
                    )}

                    {/* User List */}
                    <div className="flex flex-col gap-sm">
                        {sortedUsers.map(u => {
                            const displayRole = getDisplayRole(u.email, u.role);
                            const isProtectedSuperAdmin = displayRole === 'superAdmin';
                            const isCurrentUser = u.email === user?.email?.toLowerCase();
                            const canRemoveUser = !isCurrentUser
                                && !isProtectedSuperAdminEmail(u.email)
                                && (isSuperAdmin || displayRole === 'judge');
                            const RoleIcon = ROLE_ICONS[displayRole];
                            return (
                                <div key={u.email} className="flex justify-between items-center" style={{
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: isProtectedSuperAdmin ? '1px solid var(--color-accent)' : '1px solid var(--border-color)'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <RoleIcon style={{ color: ROLE_STYLES[displayRole].icon }} />
                                        {u.email}
                                        {isCurrentUser && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>(you)</span>
                                        )}
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: 'var(--radius-full)',
                                            ...ROLE_STYLES[displayRole].badge
                                        }}>
                                            <RoleIcon style={{ fontSize: '0.68rem' }} />
                                            {ROLE_LABELS[displayRole]}
                                        </span>
                                    </span>
                                    {canRemoveUser && (
                                        <button
                                            aria-label={`Remove ${u.email}`}
                                            onClick={() => handleRemoveUser(u.email)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
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

const BalloonsManager = ({ balloons, teams, problems, sites, revertDelivery, revertPublication, deleteBalloon }) => {
    const [confirmation, setConfirmation] = useState(null);
    const [toast, setToast] = useState(null);

    const getTeam = (id) => teams.find(t => t.id === id);
    const getProblem = (id) => problems.find(p => p.id === id);
    const getSite = (id) => sites.find(s => s.id === id);

    const handleConfirmedAction = async () => {
        if (!confirmation) return;
        const actions = {
            judge: { run: deleteBalloon, message: 'Judge First Accepted entry reverted.' },
            delivery: { run: revertDelivery, message: 'Volunteer delivery reverted.' },
            publication: { run: revertPublication, message: 'Media publication reverted.' },
        };
        const action = actions[confirmation.action];
        try {
            await action.run(confirmation.id);
            setToast({ type: 'success', message: action.message });
            setConfirmation(null);
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            setToast({ type: 'error', message: error instanceof Error ? error.message : 'Could not complete this revert.' });
        }
    };

    const sorted = balloons.toSorted((a, b) => b.timestamp - a.timestamp);

    if (sorted.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No balloons logged yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-sm">
            {toast && (
                <div role="status" className="card" style={{ padding: 'var(--space-sm) var(--space-md)', color: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)', borderColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {toast.message}
                </div>
            )}
            {sorted.map(b => {
                const team = getTeam(b.teamId);
                const problem = getProblem(b.problemId);
                const site = getSite(b.siteId);
                const color = problem?.color || '#888';
                const loggedAt = new Date(b.timestamp).toLocaleString();
                const confirming = confirmation?.id === b.id;

                return (
                    <div key={b.id} className="card balloon-admin-card" style={{ borderLeftColor: color }}>
                        <div className="balloon-admin-content">
                            <div className="balloon-admin-heading">
                                <div className="balloon-admin-swatch" style={balloonFillStyle(color)}>
                                    {team?.seatNumber || team?.name || '?'}
                                </div>
                                <span className="balloon-admin-letter" style={balloonFillStyle(color)}>
                                    {problem?.name || '?'}
                                </span>
                                <div className="balloon-admin-title">
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                                        {team ? (team.displayName || team.name) : 'Unknown Team'}
                                    </span>
                                    {team?.university && (
                                        <span className="balloon-admin-university">{team.university}</span>
                                    )}
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
                                </div>
                            </div>
                            <div className="balloon-admin-details">
                                <div className="balloon-admin-event">
                                    <span>Problem {problem?.name || '?'}{problem?.colorName ? ` — ${problem.colorName}` : ''}</span>
                                    <span>{site?.name || 'Unknown site'}</span>
                                    <span>{loggedAt}</span>
                                </div>
                                <div className="balloon-admin-people">
                                    <span>Judge: {b.loggedBy || 'legacy/unknown'}</span>
                                    {b.delivered && <span>Volunteer: {b.deliveredBy || 'anonymous'}</span>}
                                    {b.published && <span>Media: {b.publishedBy || 'anonymous'}</span>}
                                </div>
                            </div>
                        </div>
                        <div className={`balloon-admin-actions${confirming ? ' is-confirming' : ''}`}>
                            {confirming ? (
                                <div className="balloon-admin-confirmation" role="alert">
                                    <span className="balloon-admin-confirmation-copy">
                                        Confirm {confirmation.action} revert?
                                    </span>
                                    <button onClick={handleConfirmedAction} className="btn-danger balloon-admin-action">Confirm</button>
                                    <button onClick={() => setConfirmation(null)} className="btn-secondary balloon-admin-action">Cancel</button>
                                </div>
                            ) : (
                                <>
                                    {b.published && (
                                        <button
                                            onClick={() => setConfirmation({ id: b.id, action: 'publication' })}
                                            className="btn-secondary balloon-admin-action"
                                        >
                                            <FaUndo /> Revert Media
                                        </button>
                                    )}
                                    {b.delivered && (
                                        <button
                                            onClick={() => setConfirmation({ id: b.id, action: 'delivery' })}
                                            className="btn-secondary balloon-admin-action"
                                        >
                                            <FaUndo /> Revert Delivery
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setConfirmation({ id: b.id, action: 'judge' })}
                                        className="btn-danger balloon-admin-action"
                                    >
                                        <FaUndo /> Revert Judge Entry
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const AdminPage = () => {
    const { resetData, resetBalloons, revertDelivery, revertPublication, deleteBalloon, sites, teams, problems, balloons } = useBalloonContext();
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
                                ? (tab.danger ? 'rgba(220, 38, 56, 0.1)' : 'rgba(20, 87, 217, 0.1)')
                                : 'var(--bg-card)',
                            color: activeTab === tab.id
                                ? (tab.danger ? 'var(--color-error)' : 'var(--color-primary)')
                                : 'var(--text-main)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s, background-color 0.2s, color 0.2s',
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
                        revertDelivery={revertDelivery}
                        revertPublication={revertPublication}
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
