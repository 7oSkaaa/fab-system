import React, { useState } from 'react';
import { useBalloonContext } from '../../contexts/BalloonContext';
import { FaFileAlt, FaTrash, FaUsers } from 'react-icons/fa';
import { parseTeamTsv } from '../../utils/teamTsv';

export const TeamManager = () => {
    const { sites, teams, addTeams, addTeamsFromTsv, removeTeam } = useBalloonContext();
    const [bulkPrefix, setBulkPrefix] = useState('Team ');
    const [startId, setStartId] = useState(1);
    const [endId, setEndId] = useState(10);
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [importStatus, setImportStatus] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);

    React.useEffect(() => {
        if (sites.length > 0 && !selectedSiteId) {
            setSelectedSiteId(sites[0].id);
        }
    }, [sites, selectedSiteId]);

    const handleBulkSubmit = async (event) => {
        event.preventDefault();
        if (!selectedSiteId) return;

        const firstId = Number(startId);
        const lastId = Number(endId);
        if (!Number.isInteger(firstId) || !Number.isInteger(lastId) || firstId > lastId) return;

        const newTeams = [];
        for (let id = firstId; id <= lastId; id += 1) {
            newTeams.push({ name: `${bulkPrefix}${id}`, siteId: selectedSiteId });
        }

        if (confirm(`Create ${newTeams.length} team IDs (${bulkPrefix}${firstId} ... ${bulkPrefix}${lastId})?`)) {
            await addTeams(newTeams);
        }
    };

    const handleTsvUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !selectedSiteId) return;

        setIsImporting(true);
        setImportStatus(null);

        try {
            const tsvTeams = parseTeamTsv(await file.text());
            await addTeamsFromTsv(tsvTeams, selectedSiteId);
            setImportStatus({ type: 'success', message: `Created ${tsvTeams.length} team${tsvTeams.length === 1 ? '' : 's'} with university metadata.` });
        } catch (error) {
            setImportStatus({ type: 'error', message: error instanceof Error ? error.message : 'Could not import this TSV.' });
        } finally {
            setIsImporting(false);
            setFileInputKey(key => key + 1);
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
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Site:</label>
                        <select
                            value={selectedSiteId}
                            onChange={(event) => {
                                setSelectedSiteId(event.target.value);
                                setImportStatus(null);
                            }}
                            style={{ width: '100%', marginTop: '5px' }}
                        >
                            {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', order: 2 }}>
                            <h4 style={{ margin: '0 0 0.75rem' }}>Optional: create team IDs manually</h4>
                            <form onSubmit={handleBulkSubmit} className="flex flex-col gap-md">
                                <div className="flex gap-md flex-wrap">
                                    <div style={{ flex: 2, minWidth: '160px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID prefix</label>
                                        <input
                                            type="text"
                                            value={bulkPrefix}
                                            onChange={(event) => setBulkPrefix(event.target.value)}
                                            placeholder="e.g. Team "
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '110px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start ID</label>
                                        <input type="number" value={startId} onChange={(event) => setStartId(event.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '110px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End ID</label>
                                        <input type="number" value={endId} onChange={(event) => setEndId(event.target.value)} />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={Number(endId) < Number(startId)}>
                                    <FaUsers /> Generate {Math.max(0, Number(endId) - Number(startId) + 1)} Team IDs
                                </button>
                            </form>
                        </div>

                        <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', order: 1 }}>
                            <h4 style={{ margin: '0 0 0.5rem' }}>Create teams from TSV</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                Column 1 is the site seat number, column 4 is the team name, and column 5 is the university. A <code>File_Version</code> row is ignored automatically.
                            </p>
                            <label className="btn-secondary" style={{ width: '100%', opacity: isImporting ? 0.6 : 1 }}>
                                <FaFileAlt /> {isImporting ? 'Importing…' : 'Choose TSV file'}
                                <input
                                    key={fileInputKey}
                                    type="file"
                                    accept=".tsv,text/tab-separated-values"
                                    onChange={handleTsvUpload}
                                    disabled={isImporting}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {importStatus && (
                                <p style={{ color: importStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-error)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
                                    {importStatus.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                        {sites.map(site => {
                            const siteTeams = teams.filter(team => team.siteId === site.id)
                                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
                            return (
                                <div key={site.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)' }}>
                                        <FaUsers /> {site.name}
                                        <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginLeft: 'auto' }}>({siteTeams.length})</span>
                                    </h4>
                                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                        {siteTeams.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No teams</span>}
                                        {siteTeams.map(team => (
                                            <div key={team.id} className="flex justify-between items-center" style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '8px' }}>
                                                <span style={{ fontSize: '0.9rem', minWidth: 0 }}>
                                                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.displayName || 'Name not assigned'}</span>
                                                    <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'monospace' }}>Seat {team.seatNumber || team.name}</span>
                                                    {team.university && (
                                                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{team.university}</span>
                                                    )}
                                                </span>
                                                <button onClick={() => removeTeam(team.id)} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: '2px' }} title="Remove team">
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
