import React, { useState } from 'react';

const AppointmentForm = ({ processId, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(processId, { title, description, start, end });
        } catch (error) {
            console.error('Failed to add appointment', error);
            alert('Failed to add appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade">
                <h2>Add Google Calendar Event</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Technical Interview, HR Screen, etc." />
                    </div>
                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Zoom link, meeting notes..." />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
                        </div>
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add to Calendar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;
