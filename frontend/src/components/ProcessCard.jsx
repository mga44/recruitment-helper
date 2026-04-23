import React from 'react';

const ProcessCard = ({ process, onEdit, onDelete, onAddAppointment, viewMode }) => {
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

    const isListView = viewMode === 'list';

    return (
        <div className={`process-card glass animate-fade ${isListView ? 'list-view' : ''}`}>
            {isListView ? (
                <>
                    <div className="col-info">
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{process.companyName}</h3>
                        <p className="position-text" style={{ fontSize: '0.8rem', margin: 0 }}>{process.position}</p>
                    </div>
                    
                    <div className="col-status">
                        <span className="badge" style={{ 
                            backgroundColor: `${getStatusColor(process.status)}20`, 
                            color: getStatusColor(process.status), 
                            border: `1px solid ${getStatusColor(process.status)}40`,
                            fontSize: '0.65rem'
                        }}>
                            {process.status}
                        </span>
                    </div>

                    <div className="col-salary">
                        {process.salary && (process.salary.min || process.salary.max) ? (
                            <p className="salary-info" style={{ fontSize: '0.85rem', margin: 0 }}>
                                💰 {process.salary.min?.toLocaleString()} - {process.salary.max?.toLocaleString()} {process.salary.currency}
                            </p>
                        ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                    </div>

                    <div className="col-date">
                        <p className="date-info" style={{ fontSize: '0.8rem', margin: 0 }}>📅 {new Date(process.appliedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="col-link">
                        {process.jobUrl ? (
                            <a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="job-link" style={{ margin: 0 }}>
                                View Job ↗
                            </a>
                        ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                    </div>

                    <div className="col-actions">
                        <div className="list-actions">
                            <button onClick={() => onEdit(process)} className="btn-icon">Edit</button>
                            <button onClick={() => onDelete(process._id)} className="btn-icon btn-delete">Delete</button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="card-header">
                        <div>
                            <h3 style={{ fontSize: '1.25rem' }}>{process.companyName}</h3>
                            <p className="position-text" style={{ fontSize: '0.9rem' }}>{process.position}</p>
                        </div>
                        <span className="badge" style={{ 
                            backgroundColor: `${getStatusColor(process.status)}20`, 
                            color: getStatusColor(process.status), 
                            border: `1px solid ${getStatusColor(process.status)}40`,
                        }}>
                            {process.status}
                        </span>
                    </div>

                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        </div>
                        
                        {process.status === 'Rejected' && process.rejectionFeedback && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#ef4444' }}>Rejection Feedback</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                    {process.rejectionFeedback}
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
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
                                                {new Date(app.startTime).toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="card-footer">
                        <button onClick={() => onEdit(process)} className="btn-icon">Edit</button>
                        <button onClick={() => onDelete(process._id)} className="btn-icon btn-delete">Delete</button>
                        <button onClick={() => onAddAppointment(process._id)} className="btn-icon" style={{ marginLeft: 'auto' }}>Appointment</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProcessCard;
