import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function NewIncidentModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    reporter: 'IT Support Desk',
    impacted_service: 'Payment Processing API'
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
      alert('Error creating incident: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#38BDF8" /> Report New IT Incident
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Payment Gateway High Latency & 504 Timeouts"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Impacted Service</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Payment Processing API"
                  value={formData.impacted_service}
                  onChange={(e) => setFormData({ ...formData, impacted_service: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Database">Database</option>
                  <option value="Security & Identity">Security & Identity</option>
                  <option value="Network Operations">Network Operations</option>
                  <option value="Application">Application</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Symptom Details / Error Trace</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe failure symptoms, HTTP status codes, or impacted user regions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ background: '#0B1120', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #1E293B', fontSize: '0.72rem', color: '#94A3B8' }}>
              ℹ️ AI will automatically score ticket priority (P1–P4), calculate SLA deadlines, and recommend resolution runbooks upon creation.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Submit Incident Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
