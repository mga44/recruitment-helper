import React from 'react';

const Dashboard = ({ processes }) => {
    const stats = {
        total: processes.length,
        interviewing: processes.filter(p => ['Screened', 'Technical', 'Managerial'].includes(p.status)).length,
        offers: processes.filter(p => p.status === 'Offer').length,
        active: processes.filter(p => !['Rejected', 'Ghosted', 'Offer'].includes(p.status)).length
    };

    return (
        <div className="dashboard-grid">
            <div className="stat-card glass animate-fade" style={{ animationDelay: '0s' }}>
                <span className="stat-label">Total Applications</span>
                <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card glass animate-fade" style={{ animationDelay: '0.1s' }}>
                <span className="stat-label">Active Processes</span>
                <span className="stat-value">{stats.active}</span>
            </div>
            <div className="stat-card glass animate-fade" style={{ animationDelay: '0.2s' }}>
                <span className="stat-label">Interviewing</span>
                <span className="stat-value">{stats.interviewing}</span>
            </div>
            <div className="stat-card glass animate-fade" style={{ animationDelay: '0.3s' }}>
                <span className="stat-label">Offers</span>
                <span className="stat-value">{stats.offers}</span>
            </div>
        </div>
    );
};

export default Dashboard;
