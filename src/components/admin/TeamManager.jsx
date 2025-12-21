import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaTrash, FaPlus, FaUsers } from 'react-icons/fa';

export const TeamManager = () => {
    const { sites, teams, addTeam, addTeams, removeTeam } = useBalloonContext();
    const [mode, setMode] = useState('single'); // 'single' | 'bulk'

    // Single
    const [teamName, setTeamName] = useState('');

    // Bulk
    const [bulkPrefix, setBulkPrefix] = useState('Team ');
    const [startId, setStartId] = useState(1);
    const [endId, setEndId] = useState(10);

    const [selectedSiteId, setSelectedSiteId] = useState('');

    // Auto-select first site
    React.useEffect(() => {
        if (sites.length > 0 && !selectedSiteId) {
            setSelectedSiteId(sites[0].id);
        }
    }, [sites, selectedSiteId]);

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        if (teamName.trim() && selectedSiteId) {
            addTeam(teamName, selectedSiteId);
            setTeamName('');
        }
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        if (!selectedSiteId) return;

        const newTeams = [];
        for (let i = Number(startId); i <= Number(endId); i++) {
            newTeams.push({
                name: `${bulkPrefix}${i}`,
                siteId: selectedSiteId
            });
        }
        if (confirm(`Create ${newTeams.length} teams (${bulkPrefix}${startId} ... ${bulkPrefix}${endId})?`)) {
            addTeams(newTeams);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginTop: 0 }}>Teams Management</h3>

            {sites.length === 0 ? (
                <div className="text-center" style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ color: 'var(--color-warning)' }}>Please add at least one Site first.</p>
                </div>
            ) : (
                <>
                    <div className="flex gap-md" style={{ marginBottom: '1rem' }}>
                        <button
                            onClick={() => setMode('single')}
                            className={mode === 'single' ? 'btn-primary' : 'btn-menu'}
                            style={{ flex: 1 }}
                        >
                            Single Entry
                        </button>
                        <button
                            onClick={() => setMode('bulk')}
                            className={mode === 'bulk' ? 'btn-primary' : 'btn-menu'}
                            style={{ flex: 1 }}
                        >
                            Bulk Entry (Ranges)
                        </button>
                    </div>

                    <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assign to Site:</label>
                            <select
                                value={selectedSiteId}
                                onChange={(e) => setSelectedSiteId(e.target.value)}
                                style={{ width: '100%', marginTop: '5px' }}
                            >
                                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {mode === 'single' ? (
                            <form onSubmit={handleSingleSubmit} className="flex gap-md">
                                <input
                                    type="text"
                                    placeholder="Team Name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button type="submit" className="btn-primary"><FaPlus /> Add</button>
                            </form>
                        ) : (
                            <form onSubmit={handleBulkSubmit} className="flex flex-col gap-md">
                                <div className="flex gap-md">
                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prefix</label>
                                        <input
                                            type="text"
                                            value={bulkPrefix}
                                            onChange={(e) => setBulkPrefix(e.target.value)}
                                            placeholder="e.g. Team "
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start ID</label>
                                        <input
                                            type="number"
                                            value={startId}
                                            onChange={(e) => setStartId(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End ID</label>
                                        <input
                                            type="number"
                                            value={endId}
                                            onChange={(e) => setEndId(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary">
                                    <FaUsers style={{ marginRight: '5px' }} />
                                    Generate {Math.max(0, endId - startId + 1)} Teams
                                </button>
                            </form>
                        )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {sites.map(site => {
                            const siteTeams = teams.filter(t => t.siteId === site.id)
                                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
                            return (
                                <div key={site.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)' }}>
                                        <FaUsers /> {site.name}
                                        <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginLeft: 'auto' }}>({siteTeams.length})</span>
                                    </h4>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {siteTeams.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No teams</span>}
                                        {siteTeams.map(team => (
                                            <div key={team.id} className="flex justify-between items-center" style={{
                                                padding: '5px 0',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <span style={{ fontSize: '0.9rem' }}>{team.name}</span>
                                                <button onClick={() => removeTeam(team.id)} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: '2px' }} title="Remove">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
