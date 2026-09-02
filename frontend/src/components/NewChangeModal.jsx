import React, { useState } from 'react';
import { X, GitPullRequest } from 'lucide-react';

export default function NewChangeModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    risk_level: 'Medium',
    implementation_date: new Date().toISOString().split('T')[0],
    assigned_lead: 'DevOps Lead'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      alert('Error creating change: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitPullRequest size={18} color="#38BDF8" /> Submit Change Request (RFC)
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Change Title / Architecture Purpose *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Deploy Redis cluster replica or upgrade PostgreSQL to v16"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Risk Level Assessment</label>
                <select
                  className="form-select"
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk (CAB Approval Mandatory)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Implementation Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.implementation_date}
                  onChange={(e) => setFormData({ ...formData, implementation_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Engineering Lead</label>
              <input
                type="text"
                className="form-input"
                value={formData.assigned_lead}
                onChange={(e) => setFormData({ ...formData, assigned_lead: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit RFC to CAB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
