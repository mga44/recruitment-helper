import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProcessCard from './components/ProcessCard';
import ProcessForm from './components/ProcessForm';
import AppointmentForm from './components/AppointmentForm';
import LeetCodeTracker from './components/LeetCodeTracker';
import TaskTracker from './components/TaskTracker';
import { getProcesses, createProcess, updateProcess, deleteProcess, addAppointment } from './api';
import './App.css';

function App() {
  const [processes, setProcesses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [addingAppointmentProcessId, setAddingAppointmentProcessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const statuses = ['All', 'Applied', 'Screened', 'Technical', 'Managerial', 'Offer', 'Rejected', 'Ghosted'];

  useEffect(() => {
    fetchData();
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    try {
      const { getGoogleAuthStatus } = await import('./api');
      const data = await getGoogleAuthStatus();
      setIsGoogleConnected(data.connected);
    } catch {
      console.warn('Could not connect to fetch Google auth status');
    }
  };

  const fetchData = async () => {
    try {
      const data = await getProcesses();
      setProcesses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createProcess(data);
      fetchData();
      setIsFormOpen(false);
    } catch (err) {
      alert('Error creating process');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateProcess(data._id, data);
      fetchData();
      setEditingProcess(null);
    } catch (err) {
      alert('Error updating process');
    }
  };

  const handleAddAppointmentSubmit = async (processId, data) => {
    try {
      await addAppointment(processId, data);
      fetchData();
      setAddingAppointmentProcessId(null);
    } catch (err) {
      alert('Failed to add appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this process?')) {
      try {
        await deleteProcess(id);
        fetchData();
      } catch (err) {
        alert('Error deleting process');
      }
    }
  };

  const filteredAndSortedProcesses = processes
    .filter(p => statusFilter === 'All' || p.status === statusFilter)
    .sort((a, b) => {
      // Priority scoring: 0-High (Offer, Managerial, Screened, Technical), 1-Normal (Applied), 2-Low (Rejected, Ghosted)
      const getStatusPriority = (status) => {
        if (['Offer', 'Managerial', 'Screened', 'Technical'].includes(status)) return 0;
        if (['Rejected', 'Ghosted'].includes(status)) return 2;
        return 1; // Default for Applied
      };

      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within the same priority, sort by date
      const dateA = new Date(a.appliedAt);
      const dateB = new Date(b.appliedAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Recruitment <span style={{ color: 'var(--primary)' }}>Helper</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your job applications with ease.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!isGoogleConnected ? (
            <button className="btn-secondary" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} style={{ borderColor: '#4285F4', color: '#4285F4' }}>
              Connect Google Calendar
            </button>
          ) : (
            <span style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', color: '#34A853', border: '1px solid #34A853', borderRadius: '4px', backgroundColor: '#34A85310' }}>
              ✓ Google Calendar Connected
            </span>
          )}
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>+ Add Application</button>
        </div>
      </header>

      <Dashboard processes={processes} />

      <LeetCodeTracker />
      
      <TaskTracker processes={processes} />

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Processes</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Sort:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filteredAndSortedProcesses.length} items found</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading processes...</div>
        ) : (
          <div className={viewMode === 'grid' ? "process-grid" : "process-list"}>
            {viewMode === 'list' && filteredAndSortedProcesses.length > 0 && (
              <div className="process-list-header">
                <div className="col-info">Company / Position</div>
                <div className="col-status">Status</div>
                <div className="col-salary">Salary Range</div>
                <div className="col-date">Applied Date</div>
                <div className="col-link">Job Link</div>
                <div className="col-actions">Actions</div>
              </div>
            )}
            {filteredAndSortedProcesses.map(process => (
              <ProcessCard
                key={process._id}
                process={process}
                viewMode={viewMode}
                onEdit={setEditingProcess}
                onDelete={handleDelete}
                onAddAppointment={setAddingAppointmentProcessId}
              />
            ))}
            {filteredAndSortedProcesses.length === 0 && (
              <div className="glass" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No processes found. Start by adding a new application!</p>
              </div>
            )}
          </div>
        )}
      </section>


      {(isFormOpen || editingProcess) && (
        <ProcessForm
          process={editingProcess}
          onSubmit={editingProcess ? handleUpdate : handleCreate}
          onCancel={() => { setIsFormOpen(false); setEditingProcess(null); }}
        />
      )}

      {addingAppointmentProcessId && (
        <AppointmentForm 
          processId={addingAppointmentProcessId}
          onSubmit={handleAddAppointmentSubmit}
          onCancel={() => setAddingAppointmentProcessId(null)}
        />
      )}
    </div>
  );
}

export default App;
