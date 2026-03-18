import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import './TaskTracker.css';

const TaskTracker = ({ processes }) => {
    const [tasks, setTasks] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        relatedProcess: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const allTasks = await getTasks();
            setTasks(allTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate) return;

        setLoading(true);
        try {
            await createTask({
                ...formData,
                relatedProcess: formData.relatedProcess || null
            });
            setFormData({ title: '', dueDate: '', relatedProcess: '' });
            await fetchData();
        } catch (err) {
            console.error('Error creating task:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDone = async (task) => {
        try {
            await updateTask(task._id, { isDone: !task.isDone });
            await fetchData();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteTask(id);
            await fetchData();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    // Sorting: undone first, then ordered by due date ascending
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.isDone !== b.isDone) {
            return a.isDone ? 1 : -1;
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const getDaysLeft = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateString);
        due.setHours(0, 0, 0, 0);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatDaysLeft = (days) => {
        if (days < 0) return `Overdue by ${Math.abs(days)} day(s)`;
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        return `Due in ${days} days`;
    };

    return (
        <div className={`task-tracker ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="task-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 className="task-title">TODO Tracker</h2>
                    <div className="mini-stats" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.2rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                        {tasks.filter(t => !t.isDone).length} pending
                    </div>
                </div>
                <button className="toggle-btn" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
                    {isCollapsed ? '▼' : '▲'}
                </button>
            </div>

            <div className="task-content-wrapper">
                <form className="task-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Task description..."
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="relatedProcess"
                        value={formData.relatedProcess}
                        onChange={handleChange}
                    >
                        <option value="">-- General Task --</option>
                        {processes.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.companyName} - {p.position}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Task'}
                    </button>
                </form>

                <div className="task-list">
                    {sortedTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>No tasks found. Add a new task to get started!</p>
                    ) : (
                        sortedTasks.map((t) => {
                            const daysLeft = getDaysLeft(t.dueDate);
                            const isUrgent = !t.isDone && daysLeft <= 2;
                            const isOverdue = !t.isDone && daysLeft < 0;

                            return (
                                <div key={t._id} className={`task-item ${t.isDone ? 'done' : ''} ${isUrgent ? 'urgent' : ''}`}>
                                    <input
                                        type="checkbox"
                                        className="task-checkbox"
                                        checked={t.isDone}
                                        onChange={() => handleToggleDone(t)}
                                    />
                                    <div className="task-info">
                                        <strong>{t.title}</strong>
                                        <div className="task-meta">
                                            {t.relatedProcess && t.relatedProcess.companyName ? (
                                                <span style={{ marginRight: '1rem', color: '#61dafb' }}>
                                                    🏢 {t.relatedProcess.companyName}
                                                </span>
                                            ) : t.relatedProcess ? (
                                                <span style={{ marginRight: '1rem', color: '#61dafb' }}>
                                                    🏢 Process Task
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
                                        📅 {formatDaysLeft(daysLeft)}
                                    </div>
                                    <div className="task-actions">
                                        <button onClick={() => handleDelete(t._id)} title="Delete Task">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskTracker;
