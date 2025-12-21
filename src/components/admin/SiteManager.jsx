import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaTrash, FaPlus } from 'react-icons/fa';

export const SiteManager = () => {
    const { sites, addSite, removeSite } = useBalloonContext();
    const [newSiteName, setNewSiteName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newSiteName.trim()) {
            addSite(newSiteName);
            setNewSiteName('');
        }
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

            <div className="flex flex-col gap-md">
                {sites.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No sites added yet.</p>
                ) : (
                    sites.map(site => (
                        <div key={site.id} className="flex justify-between items-center" style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            <span>{site.name}</span>
                            <button onClick={() => removeSite(site.id)} className="btn-danger" style={{ padding: '5px 10px' }}>
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
