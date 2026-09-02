import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Search, Edit2, Trash2, Eye, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import EditIncidentModal from '../components/EditIncidentModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function Incidents({ onSelectIncident, onOpenNewIncident, onMetricsUpdate }) {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ status: 'All', priority: 'All' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit & Delete Modal states
  const [editingIncident, setEditingIncident] = useState(null);
  const [deletingIncident, setDeletingIncident] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents(filters);
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  const handleUpdateIncident = async (id, formData) => {
    await api.updateIncident(id, formData);
    await loadIncidents();
    if (onMetricsUpdate) onMetricsUpdate();
  };

  const handleDeleteIncident = async () => {
    if (!deletingIncident) return;
    setDeleteLoading(true);
    try {
      await api.deleteIncident(deletingIncident.id);
      setDeletingIncident(null);
      await loadIncidents();
      if (onMetricsUpdate) onMetricsUpdate();
    } catch (err) {
      alert('Failed to delete incident: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = incidents.filter((inc) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      inc.ticket_number?.toLowerCase().includes(q) ||
      inc.title?.toLowerCase().includes(q) ||
      inc.category?.toLowerCase().includes(q) ||
      inc.impacted_service?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <AlertCircle size={14} />
            INCIDENT RESOLUTION QUEUE
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Incident Management
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Track, triage, diagnose with AI, and resolve enterprise IT support tickets
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadIncidents}>
            <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={onOpenNewIncident}>
            <Plus size={16} /> New Incident Ticket
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="basic-card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={15} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by ticket #, title, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} color="#64748B" />
              <select
                className="form-select"
                style={{ width: '150px' }}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <select
              className="form-select"
              style={{ width: '150px' }}
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="All">All Priorities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List Table */}
      <div className="basic-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            No incident tickets found matching your filter criteria.
          </div>
        ) : (
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Incident Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Assigned Team</th>
                  <th>Impacted Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <button className="ticket-link" onClick={() => onSelectIncident(inc)}>
                        {inc.ticket_number}
                      </button>
                    </td>
                    <td style={{ fontWeight: 600, color: '#F8FAFC', maxWidth: '300px' }}>
                      {inc.title}
                    </td>
                    <td style={{ color: '#94A3B8' }}>{inc.category || 'Infrastructure'}</td>
                    <td>
                      <span className={`badge badge-${inc.priority ? inc.priority.toLowerCase() : 'p3'}`}>
                        {inc.priority || 'P3'}
                      </span>
                    </td>
                    <td style={{ color: '#CBD5E1' }}>{inc.assigned_team || 'Tier-1 Desk'}</td>
                    <td style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {inc.impacted_service || 'General'}
                    </td>
                    <td>
                      <span className={`badge ${inc.status === 'Resolved' || inc.status === 'Closed' ? 'badge-resolved' : 'badge-open'}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          title="View Details & AI Playbook"
                          onClick={() => onSelectIncident(inc)}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#38BDF8' }}
                          title="Edit Ticket"
                          onClick={() => setEditingIncident(inc)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#F87171' }}
                          title="Delete Ticket"
                          onClick={() => setDeletingIncident(inc)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Incident Modal */}
      {editingIncident && (
        <EditIncidentModal
          incident={editingIncident}
          onClose={() => setEditingIncident(null)}
          onSubmit={(formData) => handleUpdateIncident(editingIncident.id, formData)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingIncident && (
        <ConfirmDeleteModal
          title={`Delete Incident ${deletingIncident.ticket_number}`}
          message={`Are you sure you want to permanently delete ticket ${deletingIncident.ticket_number} (${deletingIncident.title})?`}
          loading={deleteLoading}
          onClose={() => setDeletingIncident(null)}
          onConfirm={handleDeleteIncident}
        />
      )}
    </div>
  );
}
