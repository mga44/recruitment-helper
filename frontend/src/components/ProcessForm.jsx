import React, { useState } from 'react';

const ProcessForm = ({ process, onSubmit, onCancel }) => {
    // The form mounts fresh each time the modal opens, so initializing from
    // the edited process here covers both create and edit.
    const [formData, setFormData] = useState(() => process ? {
        ...process,
        appliedAt: new Date(process.appliedAt).toISOString().split('T')[0]
    } : {
        companyName: '',
        position: '',
        status: 'Applied',
        salary: { min: '', max: '', currency: 'USD' },
        jobUrl: '',
        appliedAt: new Date().toISOString().split('T')[0],
        additionalInformation: '',
        rejectionFeedback: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade">
                <h2>{process ? 'Edit Process' : 'New Application'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Google, Meta, etc." />
                    </div>
                    <div className="form-group">
                        <label>Position</label>
                        <input name="position" value={formData.position} onChange={handleChange} required placeholder="Fullstack Developer" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option>Applied</option>
                                <option>Screened</option>
                                <option>Technical</option>
                                <option>Managerial</option>
                                <option>Offer</option>
                                <option>Rejected</option>
                                <option>Ghosted</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Applied At</label>
                            <input type="date" name="appliedAt" value={formData.appliedAt} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Min Salary</label>
                            <input type="number" name="salary.min" value={formData.salary.min} onChange={handleChange} placeholder="0" />
                        </div>
                        <div className="form-group">
                            <label>Max Salary</label>
                            <input type="number" name="salary.max" value={formData.salary.max} onChange={handleChange} placeholder="0" />
                        </div>
                        <div className="form-group" style={{ flex: 0.5 }}>
                            <label>Currency</label>
                            <input name="salary.currency" value={formData.salary.currency} onChange={handleChange} placeholder="USD" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Job URL</label>
                        <input name="jobUrl" value={formData.jobUrl} onChange={handleChange} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                        <label>Additional Info</label>
                        <textarea name="additionalInformation" value={formData.additionalInformation} onChange={handleChange} placeholder="Remote, Hybrid, etc." rows="3" />
                    </div>
                    {formData.status === 'Rejected' && (
                        <div className="form-group animate-fade">
                            <label>Rejection Feedback</label>
                            <textarea name="rejectionFeedback" value={formData.rejectionFeedback || ''} onChange={handleChange} placeholder="Feedback on what to improve, missing skills, etc." rows="3" />
                        </div>
                    )}
                    <div className="modal-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{process ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProcessForm;
