import React from 'react';

const ProcessCard = ({ process, onEdit, onDelete, onAddAppointment }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return '#6366f1';
            case 'Screened':
            case 'Technical':
            case 'Managerial': return '#f59e0b';
            case 'Offer': return '#22c55e';
            case 'Rejected':
            case 'Ghosted': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    return (
        <div className="process-card glass animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
                <div>
                    <h3>{process.companyName}</h3>
                    <p className="position-text">{process.position}</p>
                </div>
                <span className="badge" style={{ backgroundColor: `${getStatusColor(process.status)}20`, color: getStatusColor(process.status), border: `1px solid ${getStatusColor(process.status)}40` }}>
                    {process.status}
                </span>
            </div>

            <div className="card-body" style={{ flex: 1 }}>
                {process.salary && (process.salary.min || process.salary.max) && (
                    <p className="salary-info">
                        💰 {process.salary.min?.toLocaleString()} - {process.salary.max?.toLocaleString()} {process.salary.currency}
                    </p>
                )}
                <p className="date-info">📅 Applied At: {new Date(process.appliedAt).toLocaleDateString()}</p>
                {process.jobUrl && (
                    <a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="job-link">
                        View Job Post ↗
                    </a>
                )}

                {/* Appointments Section */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Appointments ({process.appointments?.length || 0})</h4>
                        <button onClick={() => onAddAppointment(process._id)} className="btn-icon" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                            + Add
                        </button>
                    </div>
                    {process.appointments && process.appointments.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                            {process.appointments.map(app => (
                                <li key={app._id || app.eventId} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                                    <strong>{app.title}</strong>
                                    <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        {new Date(app.startTime).toLocaleString()} - {new Date(app.endTime).toLocaleString()}
                                    </div>
                                    {app.meetLink && (
                                        <a href={app.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '0.2rem', color: 'var(--primary)' }}>
                                            Join Meet
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="card-footer" style={{ marginTop: 'auto' }}>
                <button onClick={() => onEdit(process)} className="btn-icon">Edit</button>
                <button onClick={() => onDelete(process._id)} className="btn-icon btn-delete">Delete</button>
            </div>
        </div>
    );
};

export default ProcessCard;
