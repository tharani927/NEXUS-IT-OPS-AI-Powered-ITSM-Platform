import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Check, GitPullRequest, RefreshCw, ShieldAlert } from 'lucide-react';
import EditChangeModal from '../components/EditChangeModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function ChangeManagement({ onOpenNewChange }) {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit & Delete states
  const [editingChange, setEditingChange] = useState(null);
  const [deletingChange, setDeletingChange] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadChanges = async () => {
    try {
      setLoading(true);
      const data = await api.getChangeRequests();
      setChanges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load changes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChanges();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.updateChangeRequest(id, { cab_approval: 'Approved', status: 'Scheduled' });
      await loadChanges();
    } catch (err) {
      alert('Error approving change: ' + err.message);
    }
  };

  const handleUpdateChange = async (id, formData) => {
    await api.updateChangeRequest(id, formData);
    await loadChanges();
  };

  const handleDeleteChange = async () => {
    if (!deletingChange) return;
    setDeleteLoading(true);
    try {
      await api.deleteChangeRequest(deletingChange.id);
      setDeletingChange(null);
      await loadChanges();
    } catch (err) {
      alert('Failed to delete change request: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <GitPullRequest size={14} />
            CHANGE ADVISORY BOARD (CAB)
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Change Management (RFC)
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Submit, evaluate risk, approve, and schedule production architecture and software release changes
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadChanges}>
            <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={onOpenNewChange}>
            <Plus size={16} /> Submit Change (RFC)
          </button>
        </div>
      </div>

      {/* Changes Table */}
      <div className="basic-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading change requests...</div>
        ) : changes.length === 0 ? (
          <div className="table-empty">
            No change requests found. Click "Submit Change (RFC)" to create one.
          </div>
        ) : (
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Change ID</th>
                  <th>Change Title</th>
                  <th>Risk Level</th>
                  <th>Target Release Date</th>
                  <th>Assigned Lead</th>
                  <th>CAB Approval</th>
                  <th>RFC Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((chg) => (
                  <tr key={chg.id}>
                    <td style={{ fontWeight: 700, color: '#F59E0B', fontFamily: 'monospace' }}>
                      {chg.change_number}
                    </td>
                    <td style={{ fontWeight: 600, color: '#F8FAFC', maxWidth: '300px' }}>
                      {chg.title}
                    </td>
                    <td>
                      <span className={`badge ${chg.risk_level === 'High' ? 'badge-p1' : chg.risk_level === 'Medium' ? 'badge-p2' : 'badge-p3'}`}>
                        {chg.risk_level || 'Medium'}
                      </span>
                    </td>
                    <td style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                      {chg.implementation_date}
                    </td>
                    <td style={{ color: '#CBD5E1' }}>{chg.assigned_lead}</td>
                    <td>
                      <span className={`badge ${chg.cab_approval === 'Approved' ? 'badge-approved' : chg.cab_approval === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {chg.cab_approval}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${chg.status === 'Completed' ? 'badge-resolved' : chg.status === 'Scheduled' ? 'badge-scheduled' : 'badge-open'}`}>
                        {chg.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {chg.cab_approval !== 'Approved' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#4ADE80' }}
                            title="1-Click CAB Approve"
                            onClick={() => handleApprove(chg.id)}
                          >
                            <Check size={12} /> Approve
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#38BDF8' }}
                          title="Edit RFC"
                          onClick={() => setEditingChange(chg)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#F87171' }}
                          title="Delete RFC"
                          onClick={() => setDeletingChange(chg)}
                        >
                          <Trash2 size={12} />
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

      {/* Edit Change Modal */}
      {editingChange && (
        <EditChangeModal
          changeItem={editingChange}
          onClose={() => setEditingChange(null)}
          onSubmit={(formData) => handleUpdateChange(editingChange.id, formData)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingChange && (
        <ConfirmDeleteModal
          title={`Delete Change Request ${deletingChange.change_number}`}
          message={`Are you sure you want to permanently delete change request ${deletingChange.change_number} (${deletingChange.title})?`}
          loading={deleteLoading}
          onClose={() => setDeletingChange(null)}
          onConfirm={handleDeleteChange}
        />
      )}
    </div>
  );
}
