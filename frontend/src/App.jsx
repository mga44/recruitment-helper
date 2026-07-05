import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProcessCard from './components/ProcessCard';
import ProcessForm from './components/ProcessForm';
import AppointmentForm from './components/AppointmentForm';
import LeetCodeTracker from './components/LeetCodeTracker';
import TaskTracker from './components/TaskTracker';
import { getProcesses, createProcess, updateProcess, deleteProcess, addAppointment, getGoogleAuthStatus, isDemoMode, resetDemoData } from './api';
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackCopied, setFeedbackCopied] = useState(false);

  const statuses = ['All', 'Applied', 'Screened', 'Technical', 'Managerial', 'Offer', 'Rejected', 'Ghosted'];

  useEffect(() => {
    fetchData();
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    try {
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
      console.error(err);
      alert('Error creating process');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateProcess(data._id, data);
      fetchData();
      setEditingProcess(null);
    } catch (err) {
      console.error(err);
      alert('Error updating process');
    }
  };

  const handleAddAppointmentSubmit = async (processId, data) => {
    try {
      await addAppointment(processId, data);
      fetchData();
      setAddingAppointmentProcessId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to add appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this process?')) {
      try {
        await deleteProcess(id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Error deleting process');
      }
    }
  };

  const buildFeedbackText = () => {
    const withFeedback = processes.filter(p => p.rejectionFeedback && p.rejectionFeedback.trim());
    const feedbackList = withFeedback
      .map(p => `# ${p.companyName}\n${p.rejectionFeedback.trim()}`)
      .join('\n\n');

    const prompt = `You are a career coach helping a software engineer improve based on recruitment rejection feedback. Below are rejection feedbacks from multiple companies. Analyze all feedback holistically and create a structured, prioritized learning plan. Group recurring themes, identify the most critical skill gaps, and suggest concrete resources and a realistic timeline for improvement. Be specific and actionable.

---

${feedbackList}`;
    return prompt;
  };

  const handleCopyFeedback = async () => {
    await navigator.clipboard.writeText(buildFeedbackText());
    setFeedbackCopied(true);
    setTimeout(() => setFeedbackCopied(false), 2000);
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
      <div className="prompt-line">
        <span className="prompt-dollar">$</span><span>recruitment-helper --dashboard</span><span className="prompt-cursor"></span>
      </div>

      {isDemoMode && (
        <div className="demo-banner">
          <span># demo_mode — data stored locally, calendar simulated</span>
          <button className="btn-secondary" onClick={() => { resetDemoData(); window.location.reload(); }}>reset</button>
        </div>
      )}
      <header className="app-header">
        <div>
          <h1>Recruitment Helper</h1>
          <p className="app-tagline">Manage your job applications with ease.</p>
        </div>
        <div className="header-links">
          {!isGoogleConnected ? (
            <a href="/api/auth/google" className="btn-secondary">connect_calendar</a>
          ) : (
            <span className="calendar-connected">calendar: connected</span>
          )}
          <button className="btn-secondary" onClick={() => setIsFeedbackOpen(true)}>feedback_summary</button>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>[ + new_application ]</button>
        </div>
      </header>

      <Dashboard processes={processes} />

      <div className="tracker-columns">
        <LeetCodeTracker />
        <TaskTracker processes={processes} />
      </div>

      <section>
        <div className="processes-toolbar">
          <span className="section-label"># processes ({filteredAndSortedProcesses.length})</span>
          <div className="processes-toolbar-controls">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">newest_first</option>
              <option value="asc">oldest_first</option>
            </select>
            <span className="view-toggle">
              <button className={`view-toggle-link ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>list</button>
              <span className="view-toggle-sep">/</span>
              <button className={`view-toggle-link ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>grid</button>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="process-empty">loading processes...</div>
        ) : (
          <div className={viewMode === 'grid' ? "process-grid" : "process-list"}>
            {viewMode === 'list' && filteredAndSortedProcesses.length > 0 && (
              <div className="process-list-header">
                <div>#</div><div>COMPANY / ROLE</div><div>STATUS</div><div>SALARY</div><div>APPLIED</div><div>LINK</div><div style={{ textAlign: 'right' }}>ACTIONS</div>
              </div>
            )}
            {filteredAndSortedProcesses.map((process, i) => (
              <ProcessCard
                key={process._id}
                process={process}
                index={i}
                viewMode={viewMode}
                onEdit={setEditingProcess}
                onDelete={handleDelete}
                onAddAppointment={setAddingAppointmentProcessId}
              />
            ))}
            {filteredAndSortedProcesses.length === 0 && (
              <div className="process-empty">No processes found. Start by adding a new application!</div>
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

      {isFeedbackOpen && (
        <div className="modal-overlay" onClick={() => setIsFeedbackOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Summary</h2>
              <span className="modal-header-meta">
                {processes.filter(p => p.rejectionFeedback && p.rejectionFeedback.trim()).length} entries
              </span>
            </div>
            <p className="modal-hint">
              Copy this prompt into an LLM to get a structured learning plan based on your rejection feedback.
            </p>
            <textarea readOnly value={buildFeedbackText()} className="feedback-textarea" />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsFeedbackOpen(false)}>close</button>
              <button className="btn-primary" onClick={handleCopyFeedback}>
                {feedbackCopied ? 'copied!' : '↵ copy_to_clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
