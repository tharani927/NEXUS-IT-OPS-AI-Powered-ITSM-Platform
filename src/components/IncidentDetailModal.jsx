import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export default function IncidentDetailModal({ incident, onClose, onResolveWithAI }) {
  const [isResolving, setIsResolving] = useState(false);

  if (!incident) return null;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolveWithAI(incident.id);
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const isResolved = incident.status === 'Resolved' || incident.status === 'Closed';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.95rem' }}>
              {incident.ticket_number}
            </span>
            <span className={`badge badge-${incident.priority ? incident.priority.toLowerCase() : 'p3'}`}>
              {incident.priority || 'P3'}
            </span>
            <span className={`badge ${isResolved ? 'badge-resolved' : 'badge-open'}`}>
              {incident.status}
            </span>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
            {incident.title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {incident.description || 'No additional symptom details recorded.'}
          </p>

          {/* Key Attributes Box */}
          <div style={{
            background: '#0B1120',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.78rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.65rem',
            marginBottom: '1.25rem'
          }}>
            <div><span style={{ color: '#64748B' }}>Impacted Service:</span> <strong style={{ color: '#F8FAFC' }}>{incident.impacted_service || 'General'}</strong></div>
            <div><span style={{ color: '#64748B' }}>Assigned Team:</span> <strong style={{ color: '#F8FAFC' }}>{incident.assigned_team || 'Tier-1 IT Desk'}</strong></div>
            <div><span style={{ color: '#64748B' }}>Category:</span> <strong style={{ color: '#F8FAFC' }}>{incident.category || 'Infrastructure'}</strong></div>
            <div><span style={{ color: '#64748B' }}>Reporter:</span> <strong style={{ color: '#F8FAFC' }}>{incident.reporter || 'Alertmanager'}</strong></div>
          </div>

          {/* AI Recommended Resolution Steps */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} /> AI Recommended Resolution Playbook
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', whiteSpace: 'pre-line', lineHeight: 1.45, margin: 0, fontFamily: 'monospace' }}>
              {incident.ai_suggested_resolution || '1. Verify service ingress latency metrics.\n2. Scale pod replica count and refresh database connection pool.'}
            </p>
          </div>

          {/* 1-Click AI Auto Resolve */}
          {!isResolved && (
            <button
              className="btn btn-success"
              style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
              onClick={handleResolve}
              disabled={isResolving}
            >
              <CheckCircle size={16} />
              {isResolving ? 'Executing Playbook...' : 'Execute AI Playbook & Mark Resolved'}
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
