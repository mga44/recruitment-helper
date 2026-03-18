import React, { useState, useEffect } from 'react';
import { getProblems, logProblem, getDailyStats } from '../api';
import './LeetCodeTracker.css';

const LeetCodeTracker = () => {
    const [problems, setProblems] = useState([]);
    const [dailyCount, setDailyCount] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        difficulty: 'Easy'
    });
    const [loading, setLoading] = useState(false);

    const goal = 3;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const allProblems = await getProblems();
            const stats = await getDailyStats();
            setProblems(allProblems);
            setDailyCount(stats.count);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return;

        setLoading(true);
        try {
            await logProblem(formData);
            setFormData({ title: '', url: '', difficulty: 'Easy' });
            await fetchData();
        } catch (err) {
            console.error('Error logging problem:', err);
        } finally {
            setLoading(false);
        }
    };

    const progress = Math.min((dailyCount / goal) * 100, 100);

    return (
        <div className={`leetcode-tracker ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="leetcode-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 className="leetcode-title">LeetCode Tracker</h2>
                    <div className="mini-stats">
                        {dailyCount}/{goal}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={`daily-status ${dailyCount >= goal ? 'goal-reached' : ''}`}>
                        {dailyCount >= goal ? '🏆 Goal Met!' : 'Keep going!'}
                    </div>
                    <button className="toggle-btn">
                        {isCollapsed ? '▼' : '▲'}
                    </button>
                </div>
            </div>

            <div className="leetcode-content-wrapper">
                <div className="leetcode-progress">
                    <div className="progress-circle-container">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke="#ffa116"
                                strokeWidth="8"
                                strokeDasharray="339.29"
                                strokeDashoffset={339.29 - (339.29 * progress) / 100}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        <div className="progress-text">
                            {dailyCount}/{goal}
                        </div>
                    </div>
                    <p>Problems solved today</p>
                </div>

                <form className="leetcode-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Problem Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="url"
                        name="url"
                        placeholder="Problem URL (optional)"
                        value={formData.url}
                        onChange={handleChange}
                    />
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging...' : 'Log Problem'}
                    </button>
                </form>

                <div className="problem-list">
                    <h3>Recent Solved Problems</h3>
                    {problems.slice(0, 5).map((p) => (
                        <div key={p._id} className="problem-item">
                            <div>
                                <strong>{p.title}</strong>
                                <div className={`difficulty-${p.difficulty}`}>{p.difficulty}</div>
                            </div>
                            {p.url && (
                                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: '#ffa116' }}>
                                    View
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default LeetCodeTracker;
