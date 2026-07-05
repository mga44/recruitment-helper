import React, { useState, useEffect } from 'react';
import { getProblems, logProblem, getDailyStats } from '../api';
import './LeetCodeTracker.css';

const LeetCodeTracker = () => {
    const [problems, setProblems] = useState([]);
    const [dailyCount, setDailyCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
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

    const goalMet = dailyCount >= goal;
    const bar = '█'.repeat(dailyCount) + '░'.repeat(Math.max(goal - dailyCount, 0));

    return (
        <div>
            <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="section-header-left">
                    <span className="section-label"># leetcode</span>
                    <span className={`leetcode-status ${goalMet ? 'goal-met' : 'in-progress'}`}>
                        {dailyCount}/{goal} · {goalMet ? 'goal met' : 'keep going'}
                    </span>
                </div>
                <span className="section-toggle-icon">{isOpen ? '▲' : '▼'}</span>
            </div>

            <div className={`section-content ${isOpen ? '' : 'collapsed'}`}>
                <div className="leetcode-bar">{bar} {dailyCount}/{goal}</div>

                <form className="leetcode-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="problem title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="url"
                        name="url"
                        placeholder="url (optional)"
                        value={formData.url}
                        onChange={handleChange}
                    />
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <button type="submit" className="form-submit-link" disabled={loading}>
                        {loading ? '...' : '↵ log'}
                    </button>
                </form>

                <div className="problem-list">
                    {problems.slice(0, 5).map((p) => (
                        <div key={p._id} className="problem-item">
                            <div className="problem-item-info">
                                <span className="problem-item-title">{p.title}</span>
                                <span className={`problem-item-difficulty difficulty-${p.difficulty}`}>{p.difficulty}</span>
                            </div>
                            {p.url && (
                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="problem-item-link">↗</a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeetCodeTracker;
