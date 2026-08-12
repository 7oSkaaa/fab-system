import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaTrash, FaPlus, FaGripVertical, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

export const SiteManager = () => {
    const { sites, addSite, updateSite, removeSite, reorderSites } = useBalloonContext();
    const [newSiteName, setNewSiteName] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const [deletingSiteId, setDeletingSiteId] = useState(null);
    const [error, setError] = useState('');
    const [editingSiteId, setEditingSiteId] = useState(null);
    const [editingSiteName, setEditingSiteName] = useState('');

    const sortedSites = [...sites].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newSiteName.trim()) {
            addSite(newSiteName);
            setNewSiteName('');
        }
    };

    const handleDragStart = (index) => setDragIndex(index);

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setOverIndex(index);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null);
            setOverIndex(null);
            return;
        }
        const reordered = [...sortedSites];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        reorderSites(reordered.map(s => s.id));
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleRemoveSite = async (site) => {
        const confirmed = window.confirm(
            `Delete ${site.name}? This will also delete its copied problems, teams, and balloon records. Global problems will be kept.`
        );
        if (!confirmed) return;

        setDeletingSiteId(site.id);
        setError('');
        try {
            await removeSite(site.id);
        } catch (removeError) {
            setError(removeError instanceof Error ? removeError.message : `Could not delete ${site.name}.`);
        } finally {
            setDeletingSiteId(null);
        }
    };

    const startEditing = (site) => {
        setEditingSiteId(site.id);
        setEditingSiteName(site.name);
        setError('');
    };

    const cancelEditing = () => {
        setEditingSiteId(null);
        setEditingSiteName('');
    };

    const saveSiteName = async (event) => {
        event.preventDefault();
        if (!editingSiteName.trim()) return;

        setError('');
        try {
            await updateSite(editingSiteId, editingSiteName);
            cancelEditing();
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : 'Could not update the site name.');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginTop: 0 }}>Competition Sites</h3>

            {error && (
                <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-sm)' }}>⚠️ {error}</p>
            )}

            <form onSubmit={handleSubmit} className="flex gap-md" style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="New Site Name (e.g. Hall A)"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary">
                    <FaPlus style={{ marginRight: '5px' }} /> Add
                </button>
            </form>

            <div className="flex flex-col gap-sm">
                {sortedSites.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No sites added yet.</p>
                ) : (
                    sortedSites.map((site, index) => (
                        <div
                            key={site.id}
                            draggable={editingSiteId !== site.id}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className="flex justify-between items-center"
                            style={{
                                background: overIndex === index && dragIndex !== index
                                    ? 'rgba(20, 87, 217, 0.12)'
                                    : 'rgba(255,255,255,0.05)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: overIndex === index && dragIndex !== index
                                    ? '2px solid var(--color-primary)'
                                    : '2px solid transparent',
                                opacity: dragIndex === index ? 0.4 : 1,
                                cursor: 'grab',
                                transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
                            }}
                        >
                            <div className="flex items-center gap-sm" style={{ flex: 1, minWidth: 0 }}>
                                <FaGripVertical style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                                {editingSiteId === site.id ? (
                                    <form onSubmit={saveSiteName} className="flex items-center gap-sm" style={{ flex: 1 }}>
                                        <label style={{ flex: 1 }}>
                                            <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' }}>Site name</span>
                                            <input
                                                value={editingSiteName}
                                                onChange={(event) => setEditingSiteName(event.target.value)}
                                                autoFocus
                                                style={{ padding: '6px 10px' }}
                                            />
                                        </label>
                                        <button type="submit" className="btn-primary" style={{ padding: '6px 10px' }} disabled={!editingSiteName.trim()} title="Save site name">
                                            <FaCheck />
                                        </button>
                                        <button type="button" onClick={cancelEditing} className="btn-secondary" style={{ padding: '6px 10px' }} title="Cancel editing">
                                            <FaTimes />
                                        </button>
                                    </form>
                                ) : (
                                    <span>{site.name}</span>
                                )}
                            </div>
                            {editingSiteId !== site.id && (
                                <div className="flex items-center gap-sm">
                                    <button
                                        onClick={() => startEditing(site)}
                                        className="btn-secondary"
                                        style={{ padding: '5px 10px' }}
                                        onDragStart={(event) => event.stopPropagation()}
                                        disabled={deletingSiteId !== null || editingSiteId !== null}
                                        title="Edit site name"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveSite(site)}
                                        className="btn-danger"
                                        style={{ padding: '5px 10px' }}
                                        onDragStart={(event) => event.stopPropagation()}
                                        disabled={deletingSiteId !== null}
                                        title="Delete site and its associated data"
                                    >
                                        {deletingSiteId === site.id ? 'Deleting…' : <FaTrash />}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
