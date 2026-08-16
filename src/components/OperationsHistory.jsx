import React from 'react';
import { FaBoxOpen, FaBullhorn, FaCheck, FaClock, FaUniversity } from 'react-icons/fa';

const formatActionTime = (timestamp) => {
    if (!timestamp) return 'Time unavailable';
    return new Date(timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const OperationsHistory = ({ balloons, getTeam, getProblem, getSite }) => {
    if (balloons.length === 0) {
        return (
            <div className="card operations-history-empty">
                <FaBoxOpen aria-hidden="true" />
                <h3>No activity yet</h3>
                <p>Delivered and published balloons will appear here.</p>
            </div>
        );
    }

    return (
        <div className="operations-history-list">
            {balloons.map(balloon => {
                const team = getTeam(balloon.teamId);
                const problem = getProblem(balloon.problemId);
                const site = getSite(balloon.siteId);
                const problemColor = problem?.color || 'var(--color-primary)';

                return (
                    <article key={balloon.id} className="card operations-history-card" style={{ '--problem-color': problemColor }}>
                        <div className="operations-history-summary">
                            <div className="operations-history-seat">Seat {team?.seatNumber || team?.name || '?'}</div>
                            <div className="operations-history-team">
                                <h3>{team ? (team.displayName || team.name) : 'Unknown Team'}</h3>
                                <div className="operations-history-metadata">
                                    <span>{site?.name || 'Unknown site'}</span>
                                    {team?.university && <span><FaUniversity aria-hidden="true" /> {team.university}</span>}
                                </div>
                            </div>
                            <div className="operations-history-problem">
                                <span style={{ color: problemColor }}>Problem {problem?.name || '?'}</span>
                                <strong>{problem?.fullName || problem?.colorName || `Problem ${problem?.name || '?'}`}</strong>
                            </div>
                        </div>

                        <div className="operations-history-events" aria-label="Completed balloon actions">
                            {balloon.delivered && (
                                <div className="operations-history-event delivered">
                                    <span className="operations-history-event-icon"><FaCheck aria-hidden="true" /></span>
                                    <span>
                                        <strong>Delivered</strong>
                                        <small>{balloon.deliveredBy || 'Anonymous volunteer'}</small>
                                    </span>
                                    <time dateTime={balloon.deliveredAt ? new Date(balloon.deliveredAt).toISOString() : undefined}>
                                        <FaClock aria-hidden="true" /> {formatActionTime(balloon.deliveredAt)}
                                    </time>
                                </div>
                            )}
                            {balloon.published && (
                                <div className="operations-history-event published">
                                    <span className="operations-history-event-icon"><FaBullhorn aria-hidden="true" /></span>
                                    <span>
                                        <strong>Published</strong>
                                        <small>{balloon.publishedBy || 'Anonymous publisher'}</small>
                                    </span>
                                    <time dateTime={balloon.publishedAt ? new Date(balloon.publishedAt).toISOString() : undefined}>
                                        <FaClock aria-hidden="true" /> {formatActionTime(balloon.publishedAt)}
                                    </time>
                                </div>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
};
