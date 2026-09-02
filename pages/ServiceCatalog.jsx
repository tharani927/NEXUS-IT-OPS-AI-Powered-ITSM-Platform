import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, ShoppingBag, RefreshCw } from 'lucide-react';
import EditServiceReqModal from '../components/EditServiceReqModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function ServiceCatalog({ onOpenNewRequest }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit & Delete states
  const [editingReq, setEditingReq] = useState(null);
  const [deletingReq, setDeletingReq] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getServiceRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateReq = async (id, formData) => {
    await api.updateServiceRequest(id, formData);
    await loadRequests();
  };

  const handleDeleteReq = async () => {
    if (!deletingReq) return;
    setDeleteLoading(true);
    try {
      await api.deleteServiceRequest(deletingReq.id);
      setDeletingReq(null);
      await loadRequests();
    } catch (err) {
      alert('Failed to delete service request: ' + err.message);
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
            <ShoppingBag size={14} />
            IT SERVICE CATALOG & PROVISIONING
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Service Request Catalog
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Submit, approve, track, and fulfill employee requests for cloud IAM access, hardware, and SaaS licenses
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadRequests}>
            <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={onOpenNewRequest}>
            <Plus size={16} /> New Service Request
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="basic-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="table-empty">
            No service requests found. Click "New Service Request" to submit one.
          </div>
        ) : (
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Title / Purpose</th>
                  <th>Category</th>
                  <th>Requested By</th>
                  <th>Urgency</th>
                  <th>Approval Status</th>
                  <th>Fulfillment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: '#4ADE80', fontFamily: 'monospace' }}>
                      {req.request_number}
                    </td>
                    <td style={{ fontWeight: 600, color: '#F8FAFC', maxWidth: '280px' }}>
                      {req.title}
                    </td>
                    <td style={{ color: '#94A3B8' }}>{req.category}</td>
                    <td style={{ color: '#CBD5E1' }}>{req.requested_by}</td>
                    <td>
                      <span className={`badge ${req.urgency === 'High' ? 'badge-high' : req.urgency === 'Low' ? 'badge-low' : 'badge-medium'}`}>
                        {req.urgency || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${req.approval_status === 'Approved' ? 'badge-approved' : req.approval_status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {req.approval_status || 'Pending Approval'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${req.status === 'Fulfilled' ? 'badge-fulfilled' : 'badge-open'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#38BDF8' }}
                          title="Edit Request"
                          onClick={() => setEditingReq(req)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#F87171' }}
                          title="Delete Request"
                          onClick={() => setDeletingReq(req)}
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

      {/* Edit Service Request Modal */}
      {editingReq && (
        <EditServiceReqModal
          request={editingReq}
          onClose={() => setEditingReq(null)}
          onSubmit={(formData) => handleUpdateReq(editingReq.id, formData)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingReq && (
        <ConfirmDeleteModal
          title={`Delete Service Request ${deletingReq.request_number}`}
          message={`Are you sure you want to permanently delete service request ${deletingReq.request_number} (${deletingReq.title})?`}
          loading={deleteLoading}
          onClose={() => setDeletingReq(null)}
          onConfirm={handleDeleteReq}
        />
      )}
    </div>
  );
}
