import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import './TaskTracker.css';

const TaskTracker = ({ processes }) => {
    const [tasks, setTasks] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
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
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    };

    const formatDaysLeft = (days) => {
        if (days < 0) return `overdue ${Math.abs(days)}d`;
        if (days === 0) return 'due today';
        if (days === 1) return 'due tomorrow';
        return `due in ${days}d`;
    };

    const pendingCount = tasks.filter(t => !t.isDone).length;

    return (
        <div>
            <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="section-header-left">
                    <span className="section-label"># tasks</span>
                    <span className="tasks-pending">{pendingCount} pending</span>
                </div>
                <span className="section-toggle-icon">{isOpen ? '▲' : '▼'}</span>
            </div>

            <div className={`section-content ${isOpen ? '' : 'collapsed'}`}>
                <form className="task-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="task description"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="relatedProcess"
                        value={formData.relatedProcess}
                        onChange={handleChange}
                    >
                        <option value="">-- general --</option>
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
                    <button type="submit" className="form-submit-link" disabled={loading}>
                        {loading ? '...' : '↵ add'}
                    </button>
                </form>

                <div className="task-list">
                    {sortedTasks.length === 0 ? (
                        <p className="task-empty">No tasks found. Add a new task to get started!</p>
                    ) : (
                        sortedTasks.map((t) => {
                            const daysLeft = getDaysLeft(t.dueDate);
                            const isOverdue = !t.isDone && daysLeft < 0;

                            return (
                                <div key={t._id} className={`task-row ${t.isDone ? 'done' : ''}`}>
                                    <button className={`task-marker ${t.isDone ? 'done' : 'pending'}`} onClick={() => handleToggleDone(t)}>
                                        {t.isDone ? '[x]' : '[ ]'}
                                    </button>
                                    <span className={`task-row-title ${t.isDone ? 'done' : ''}`}>{t.title}</span>
                                    {t.relatedProcess && (
                                        <span className="task-row-related">{t.relatedProcess.companyName || 'process task'}</span>
                                    )}
                                    <span className={`task-row-due ${isOverdue ? 'overdue' : 'due'}`}>{formatDaysLeft(daysLeft)}</span>
                                    <button className="task-row-delete" onClick={() => handleDelete(t._id)} title="Delete task">del</button>
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
