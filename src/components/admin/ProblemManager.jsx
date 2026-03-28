import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaTrash, FaPlus, FaCopy, FaGlobe, FaMapMarkerAlt, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

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

const ColorPicker = ({ selectedColor, onColorChange, onNameChange }) => {
    const handlePreset = (c) => {
        onColorChange(c.value);
        onNameChange(c.name);
    };
    return (
        <div className="flex gap-xs items-center" style={{ flexWrap: 'wrap' }}>
            {BALLOON_COLORS.map(c => (
                <div
                    key={c.name}
                    onClick={() => handlePreset(c)}
                    title={c.name}
                    style={{
                        width: '22px', height: '22px',
                        borderRadius: '50%',
                        background: c.value,
                        border: selectedColor === c.value ? '2px solid var(--color-primary)' : '2px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                    }}
                />
            ))}
        </div>
    );
};

export const ProblemManager = () => {
    const { problems, addProblem, updateProblem, removeProblem, sites, copyProblemsToSite } = useBalloonContext();

    // Add form state
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(BALLOON_COLORS[0].value);
    const [selectedColorName, setSelectedColorName] = useState(BALLOON_COLORS[0].name);
    const [selectedSiteId, setSelectedSiteId] = useState('global');
    const [error, setError] = useState('');

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editColorName, setEditColorName] = useState('');

    // Copy confirm
    const [confirmCopySiteId, setConfirmCopySiteId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) return;
        try {
            const siteId = selectedSiteId === 'global' ? null : selectedSiteId;
            await addProblem(name.trim(), selectedColor, siteId, selectedColorName);
            setName('');
        } catch (err) {
            setError(err.message);
        }
    };

    const startEdit = (p) => {
        setEditingId(p.id);
        setEditName(p.name);
        setEditColor(p.color);
        setEditColorName(p.colorName || '');
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = async () => {
        if (!editName.trim()) return;
        await updateProblem(editingId, editName.trim(), editColor, editColorName);
        setEditingId(null);
    };

    const handleCopyToSite = (siteId) => {
        if (confirmCopySiteId === siteId) {
            copyProblemsToSite(siteId);
            setConfirmCopySiteId(null);
        } else {
            setConfirmCopySiteId(siteId);
        }
    };

    const globalProblems = problems.filter(p => p.siteId === null || p.siteId === undefined);
    const siteProblems = sites.map(site => ({
        ...site,
        problems: problems.filter(p => p.siteId === site.id)
    }));

    const renderProblemRow = (p) => {
        if (editingId === p.id) {
            return (
                <div key={p.id} className="flex flex-col gap-sm" style={{
                    background: 'var(--bg-elevated)',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${editColor}`,
                    width: '100%',
                }}>
                    <div className="flex gap-sm items-center" style={{ flexWrap: 'wrap' }}>
                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Letter (e.g. A)"
                            style={{ width: '70px', flex: 'none' }}
                            autoFocus
                        />
                        <input
                            value={editColorName}
                            onChange={(e) => setEditColorName(e.target.value)}
                            placeholder="Color name (e.g. Blue)"
                            style={{ flex: 1, minWidth: '120px' }}
                        />
                    </div>
                    <ColorPicker
                        selectedColor={editColor}
                        onColorChange={setEditColor}
                        onNameChange={setEditColorName}
                    />
                    <div className="flex items-center gap-sm">
                        <div className="flex items-center" style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--text-dim)' }}>#</span>
                            <input
                                type="text"
                                value={editColor.startsWith('#') ? editColor.slice(1) : editColor}
                                onChange={(e) => { setEditColor('#' + e.target.value.replace('#', '')); setEditColorName(''); }}
                                placeholder="HEX"
                                style={{ width: '70px', background: 'transparent', border: 'none', padding: '4px' }}
                            />
                            <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: editColor, border: '1px solid var(--border-color)' }} />
                        </div>
                        <button onClick={saveEdit} className="btn-primary" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCheck /> Save
                        </button>
                        <button onClick={cancelEdit} className="btn-secondary" style={{ padding: '6px 10px' }}>
                            <FaTimes />
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <ProblemBadge key={p.id} problem={p} onRemove={removeProblem} onEdit={startEdit} />
        );
    };

    return (
        <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>🎨 Problems & Colors</h3>

            {/* Site Selector */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Add problem to:
                </label>
                <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} style={{ width: '100%' }}>
                    <option value="global">🌐 Global (all sites)</option>
                    {sites.map(s => <option key={s.id} value={s.id}>📍 {s.name} only</option>)}
                </select>
            </div>

            {/* Add Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="flex gap-sm items-center" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Letter (e.g. A)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '80px', flex: 'none' }}
                    />
                    <input
                        type="text"
                        placeholder="Color name (e.g. Blue)"
                        value={selectedColorName}
                        onChange={(e) => setSelectedColorName(e.target.value)}
                        style={{ flex: 1, minWidth: '130px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                        <FaPlus /> Add
                    </button>
                </div>

                <ColorPicker
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                    onNameChange={setSelectedColorName}
                />

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-sm) var(--space-md)',
                        color: 'var(--color-error)',
                        fontSize: '0.9rem',
                        marginTop: 'var(--space-sm)',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Custom HEX */}
                <div className="flex items-center gap-sm" style={{ marginTop: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Custom:</span>
                    <div className="flex items-center" style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ color: 'var(--text-dim)' }}>#</span>
                        <input
                            type="text"
                            value={selectedColor.startsWith('#') ? selectedColor.slice(1) : selectedColor}
                            onChange={(e) => { setSelectedColor('#' + e.target.value.replace('#', '')); setSelectedColorName(''); }}
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
                        {[...globalProblems].sort((a, b) => a.name.localeCompare(b.name)).map(renderProblemRow)}
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
                                    confirmCopySiteId === site.id ? (
                                        <div className="flex gap-sm">
                                            <button onClick={() => handleCopyToSite(site.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                                <FaCheck /> Confirm
                                            </button>
                                            <button onClick={() => setConfirmCopySiteId(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleCopyToSite(site.id)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                            <FaCopy /> Copy Global
                                        </button>
                                    )
                                )}
                            </div>
                            {site.problems.length === 0 ? (
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>Uses global problems</p>
                            ) : (
                                <div className="flex flex-wrap gap-sm">
                                    {[...site.problems].sort((a, b) => a.name.localeCompare(b.name)).map(renderProblemRow)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProblemBadge = ({ problem, onRemove, onEdit }) => (
    <div className="flex items-center gap-sm" style={{
        background: 'var(--bg-card)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${problem.color}`,
    }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: problem.color, flexShrink: 0 }} />
        <div className="flex flex-col" style={{ lineHeight: 1.2 }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{problem.name}</span>
            {problem.colorName && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{problem.colorName}</span>
            )}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{problem.color}</span>
        </div>
        <button
            onClick={() => onEdit(problem)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '2px', display: 'flex' }}
        >
            <FaEdit size={11} />
        </button>
        <button
            onClick={() => onRemove(problem.id)}
            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '2px', display: 'flex' }}
        >
            <FaTrash size={11} />
        </button>
    </div>
);
