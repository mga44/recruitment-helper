import React from 'react';

const Dashboard = ({ processes }) => {
    const stats = {
        total: processes.length,
        interviewing: processes.filter(p => ['Screened', 'Technical', 'Managerial'].includes(p.status)).length,
        offers: processes.filter(p => p.status === 'Offer').length,
        active: processes.filter(p => !['Rejected', 'Ghosted', 'Offer'].includes(p.status)).length
    };

    return (
        <div className="stats-line">
            <span className="stats-value">{stats.total}</span> <span className="stats-word">total</span>
            <span className="stats-sep">/</span>
            <span className="stats-value">{stats.active}</span> <span className="stats-word">active</span>
            <span className="stats-sep">/</span>
            <span className="stats-value stats-warning">{stats.interviewing}</span> <span className="stats-word">interviewing</span>
            <span className="stats-sep">/</span>
            <span className="stats-value stats-accent">{stats.offers}</span> <span className="stats-word">offers</span>
        </div>
    );
};

export default Dashboard;
