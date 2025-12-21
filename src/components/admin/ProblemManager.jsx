import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaTrash, FaPlus, FaCopy, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

const BALLOON_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Yellow', value: '#fbbf24' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'White', value: '#f1f5f9' },
    { name: 'Black', value: '#1e293b' },
];

export const ProblemManager = () => {
    const { problems, addProblem, removeProblem, sites, copyProblemsToSite } = useBalloonContext();
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(BALLOON_COLORS[0].value);
    const [selectedSiteId, setSelectedSiteId] = useState('global'); // 'global' or site ID
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (name.trim()) {
            try {
                const siteId = selectedSiteId === 'global' ? null : selectedSiteId;
                await addProblem(name, selectedColor, siteId);
                setName('');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleCopyToSite = (siteId) => {
        if (window.confirm('Copy all global problems to this site? This will create site-specific copies.')) {
            copyProblemsToSite(siteId);
        }
    };

    // Group problems
    const globalProblems = problems.filter(p => p.siteId === null || p.siteId === undefined);
    const siteProblems = sites.map(site => ({
        ...site,
        problems: problems.filter(p => p.siteId === site.id)
    }));

    return (
        <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>🎨 Problems & Colors</h3>

            {/* Site Selector for Adding */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Add problem to:
                </label>
                <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <option value="global">🌐 Global (all sites)</option>
                    {sites.map(s => (
                        <option key={s.id} value={s.id}>📍 {s.name} only</option>
                    ))}
                </select>
            </div>

            {/* Add Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="flex gap-sm items-center" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Problem (e.g. A)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '80px', flex: 'none' }}
                    />

                    <div className="flex gap-xs items-center" style={{ flexWrap: 'wrap', flex: 1 }}>
                        {BALLOON_COLORS.map(c => (
                            <div
                                key={c.name}
                                onClick={() => setSelectedColor(c.value)}
                                title={c.name}
                                style={{
                                    width: '22px', height: '22px',
                                    borderRadius: '50%',
                                    background: c.value,
                                    border: selectedColor === c.value ? '2px solid var(--color-primary)' : '2px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                        <FaPlus /> Add
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-sm) var(--space-md)',
                        color: 'var(--color-error)',
                        fontSize: '0.9rem',
                        marginBottom: 'var(--space-sm)'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Custom HEX Input */}
                <div className="flex items-center gap-sm">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Custom:</span>
                    <div className="flex items-center" style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ color: 'var(--text-dim)' }}>#</span>
                        <input
                            type="text"
                            value={selectedColor.startsWith('#') ? selectedColor.slice(1) : selectedColor}
                            onChange={(e) => setSelectedColor('#' + e.target.value.replace('#', ''))}
                            placeholder="HEX"
                            style={{ width: '70px', background: 'transparent', border: 'none', padding: '4px' }}
                        />
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: selectedColor, border: '1px solid var(--border-color)' }} />
                    </div>
                </div>
            </form>

            {/* Global Problems */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                    <FaGlobe style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: '600' }}>Global Problems</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({globalProblems.length})</span>
                </div>

                {globalProblems.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>No global problems. Add some above!</p>
                ) : (
                    <div className="flex flex-wrap gap-sm">
                        {globalProblems.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                            <ProblemBadge key={p.id} problem={p} onRemove={removeProblem} />
                        ))}
                    </div>
                )}
            </div>

            {/* Site-Specific Problems */}
            {sites.length > 0 && (
                <div>
                    <div style={{ marginBottom: 'var(--space-sm)', fontWeight: '600' }}>
                        <FaMapMarkerAlt style={{ color: 'var(--color-secondary)', marginRight: '6px' }} />
                        Site-Specific Problems
                    </div>

                    {siteProblems.map(site => (
                        <div key={site.id} style={{
                            background: 'var(--bg-elevated)',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-sm)'
                        }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                                <span style={{ fontWeight: '600' }}>{site.name}</span>
                                {globalProblems.length > 0 && site.problems.length === 0 && (
                                    <button
                                        onClick={() => handleCopyToSite(site.id)}
                                        className="btn-secondary"
                                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                    >
                                        <FaCopy /> Copy Global
                                    </button>
                                )}
                            </div>

                            {site.problems.length === 0 ? (
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>
                                    Uses global problems
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-sm">
                                    {site.problems.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                                        <ProblemBadge key={p.id} problem={p} onRemove={removeProblem} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProblemBadge = ({ problem, onRemove }) => (
    <div className="flex items-center gap-sm" style={{
        background: 'var(--bg-card)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        border: `2px solid ${problem.color}`
    }}>
        <span style={{
            width: '10px', height: '10px',
            borderRadius: '50%',
            background: problem.color,
        }} />
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{problem.name}</span>
        <button
            onClick={() => onRemove(problem.id)}
            style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-error)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex'
            }}
        >
            <FaTrash size={10} />
        </button>
    </div>
);
