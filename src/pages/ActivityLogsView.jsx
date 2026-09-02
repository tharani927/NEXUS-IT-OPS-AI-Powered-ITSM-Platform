import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, RefreshCw, Clock, User, ShieldCheck } from 'lucide-react';

export default function ActivityLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <FileText size={14} />
            ENTERPRISE AUDIT & GOVERNANCE
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            System Activity & Audit Trail
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Immutable event log tracking incident resolutions, AI playbooks, asset telemetry alerts, and CAB approvals
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadLogs} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh Logs
        </button>
      </div>

      {/* Logs Table */}
      <div className="basic-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="analytics-title-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2>Audit Event Stream</h2>
              <p>Real-time security and operational events recorded in MongoDB</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Operator / Agent</th>
                <th>Event Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="table-empty">Loading audit events...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="table-empty">No activity logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td>
                      <span className="badge badge-open" style={{ fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: '#F8FAFC', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={13} color="#94A3B8" /> {log.user}
                      </span>
                    </td>
                    <td style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>
                      {log.details}
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
