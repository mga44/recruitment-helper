import React from 'react';

const getStatusColor = (status) => {
    switch (status) {
        case 'Applied': return 'var(--neutral-status)';
        case 'Screened':
        case 'Technical':
        case 'Managerial': return 'var(--warning)';
        case 'Offer': return 'var(--accent)';
        case 'Rejected':
        case 'Ghosted': return 'var(--error)';
        default: return 'var(--text-muted)';
    }
};

const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return '—';
    const min = salary.min ? Math.round(salary.min / 1000) : 0;
    const max = salary.max ? Math.round(salary.max / 1000) : 0;
    return `${min}–${max}k ${salary.currency}`;
};

const ProcessCard = ({ process, index, onEdit, onDelete, onAddAppointment, viewMode }) => {
    const statusColor = getStatusColor(process.status);

    if (viewMode === 'list') {
        return (
            <div className="process-row">
                <div className="process-row-idx">{String(index + 1).padStart(2, '0')}</div>
                <div>
                    <div className="process-row-company">{process.companyName}</div>
                    <div className="process-row-position">{process.position}</div>
                </div>
                <div className="process-row-status" style={{ color: statusColor }}>{process.status}</div>
                <div className="process-row-salary">{formatSalary(process.salary)}</div>
                <div className="process-row-date">{new Date(process.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div>
                    {process.jobUrl ? (
                        <a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="process-row-link">view ↗</a>
                    ) : (
                        <span className="process-row-link-empty">—</span>
                    )}
                </div>
                <div className="process-row-actions">
                    <button onClick={() => onEdit(process)} className="row-action-link">edit</button>
                    <button onClick={() => onDelete(process._id)} className="row-action-link row-action-delete">del</button>
                </div>
            </div>
        );
    }

    const hasFeedback = process.status === 'Rejected' && process.rejectionFeedback;
    const hasAppointments = process.appointments && process.appointments.length > 0;

    return (
        <div className="process-cell">
            <div className="process-cell-header">
                <div>
                    <div className="process-cell-company">{process.companyName}</div>
                    <div className="process-cell-position">{process.position}</div>
                </div>
                <span className="process-cell-status" style={{ color: statusColor }}>{process.status}</span>
            </div>

            <div className="process-cell-meta">
                <div>{formatSalary(process.salary)}</div>
                <div className="process-cell-meta-date">{new Date(process.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                {process.jobUrl && (
                    <a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="process-cell-link">view_posting ↗</a>
                )}
            </div>

            {hasFeedback && (
                <div className="process-cell-feedback">{process.rejectionFeedback}</div>
            )}

            {hasAppointments && (
                <div className="process-cell-appointments">
                    {process.appointments.map(app => (
                        <div key={app._id || app.eventId}>{app.title} — {new Date(app.startTime).toLocaleString('en-US')}</div>
                    ))}
                </div>
            )}

            <div className="process-cell-footer">
                <button onClick={() => onEdit(process)} className="row-action-link">edit</button>
                <button onClick={() => onDelete(process._id)} className="row-action-link row-action-delete">del</button>
                <button onClick={() => onAddAppointment(process._id)} className="row-action-link process-cell-add-appt">+ appt</button>
            </div>
        </div>
    );
};

export default ProcessCard;
