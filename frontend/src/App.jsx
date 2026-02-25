import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProcessCard from './components/ProcessCard';
import ProcessForm from './components/ProcessForm';
import LeetCodeTracker from './components/LeetCodeTracker';
import { getProcesses, createProcess, updateProcess, deleteProcess } from './api';
import './App.css';

function App() {
  const [processes, setProcesses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [loading, setLoading] = useState(true);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="main-content">
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
              <h2>Processes</h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{processes.length} items found</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading processes...</div>
            ) : (
              <div className="process-grid">
                {processes.map(process => (
                  <ProcessCard
                    key={process._id}
                    process={process}
                    onEdit={setEditingProcess}
                    onDelete={handleDelete}
                  />
                ))}
                {processes.length === 0 && (
                  <div className="glass" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No processes found. Start by adding a new application!</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
        <div className="sidebar">
          <LeetCodeTracker />
        </div>
      </div>


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
