import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaTrash, FaPlus, FaGripVertical } from 'react-icons/fa';

export const SiteManager = () => {
    const { sites, addSite, removeSite, reorderSites } = useBalloonContext();
    const [newSiteName, setNewSiteName] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

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

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginTop: 0 }}>Competition Sites</h3>

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
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className="flex justify-between items-center"
                            style={{
                                background: overIndex === index && dragIndex !== index
                                    ? 'rgba(139, 92, 246, 0.15)'
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
                            <div className="flex items-center gap-sm">
                                <FaGripVertical style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                                <span>{site.name}</span>
                            </div>
                            <button
                                onClick={() => removeSite(site.id)}
                                className="btn-danger"
                                style={{ padding: '5px 10px' }}
                                onDragStart={(e) => e.stopPropagation()}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
