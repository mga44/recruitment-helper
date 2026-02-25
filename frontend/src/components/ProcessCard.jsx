import React from 'react';

const ProcessCard = ({ process, onEdit, onDelete }) => {
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
        <div className="process-card glass animate-fade">
            <div className="card-header">
                <div>
                    <h3>{process.companyName}</h3>
                    <p className="position-text">{process.position}</p>
                </div>
                <span className="badge" style={{ backgroundColor: `${getStatusColor(process.status)}20`, color: getStatusColor(process.status), border: `1px solid ${getStatusColor(process.status)}40` }}>
                    {process.status}
                </span>
            </div>

            <div className="card-body">
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

            <div className="card-footer">
                <button onClick={() => onEdit(process)} className="btn-icon">Edit</button>
                <button onClick={() => onDelete(process._id)} className="btn-icon btn-delete">Delete</button>
            </div>
        </div>
    );
};

export default ProcessCard;
