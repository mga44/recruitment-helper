import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProcessCard from './components/ProcessCard';
import ProcessForm from './components/ProcessForm';
import LeetCodeTracker from './components/LeetCodeTracker';
import TaskTracker from './components/TaskTracker';
import { getProcesses, createProcess, updateProcess, deleteProcess } from './api';
import './App.css';

function App() {
  const [processes, setProcesses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  const statuses = ['All', 'Applied', 'Screened', 'Technical', 'Managerial', 'Offer', 'Rejected', 'Ghosted'];

  useEffect(() => {
    fetchData();
  }, []);

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
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>+ Add Application</button>
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
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filteredAndSortedProcesses.length} items found</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading processes...</div>
        ) : (
          <div className="process-grid">
            {filteredAndSortedProcesses.map(process => (
              <ProcessCard
                key={process._id}
                process={process}
                onEdit={setEditingProcess}
                onDelete={handleDelete}
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
    </div>
  );
}

export default App;
