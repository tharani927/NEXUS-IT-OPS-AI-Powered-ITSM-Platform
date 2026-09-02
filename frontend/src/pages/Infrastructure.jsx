import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Server, AlertTriangle, Edit2, Trash2, RefreshCw, Cpu, Activity, ShieldCheck } from 'lucide-react';
import NewAssetModal from '../components/NewAssetModal';
import EditAssetModal from '../components/EditAssetModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function Infrastructure({ onAlertSimulated, onMetricsUpdate }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await api.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCreateAsset = async (formData) => {
    await api.createAsset(formData);
    await loadAssets();
    if (onMetricsUpdate) onMetricsUpdate();
  };

  const handleUpdateAsset = async (id, formData) => {
    await api.updateAsset(id, formData);
    await loadAssets();
    if (onMetricsUpdate) onMetricsUpdate();
  };

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    setDeleteLoading(true);
    try {
      await api.deleteAsset(deletingAsset.id);
      setDeletingAsset(null);
      await loadAssets();
      if (onMetricsUpdate) onMetricsUpdate();
    } catch (err) {
      alert('Failed to delete asset: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSimulateAlert = async (assetId) => {
    try {
      const res = await api.simulateAssetAlert(assetId);
      alert(`⚠️ Telemetry Alert simulated for node! Auto-created incident ${res.ticketNumber}`);
      await loadAssets();
      if (onAlertSimulated) onAlertSimulated();
      if (onMetricsUpdate) onMetricsUpdate();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <Server size={14} />
            HARDWARE & CLOUD INFRASTRUCTURE
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            IT Assets & Infrastructure Telemetry
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Monitor server nodes, Kubernetes clusters, DB instances, and trigger fault simulations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadAssets}>
            <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setIsNewAssetOpen(true)}>
            <Plus size={16} /> Add IT Asset
          </button>
        </div>
      </div>

      {/* Asset Table */}
      <div className="basic-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading asset inventory...</div>
        ) : assets.length === 0 ? (
          <div className="table-empty">
            No infrastructure assets configured. Click "Add IT Asset" to create one.
          </div>
        ) : (
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Server / Node Name</th>
                  <th>Type</th>
                  <th>Environment</th>
                  <th>IP Address</th>
                  <th>CPU / Memory Telemetry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const isHealthy = asset.status === 'Healthy';
                  const isWarning = asset.status === 'Warning';
                  const isCritical = asset.status === 'Critical';

                  return (
                    <tr key={asset.id}>
                      <td style={{ fontWeight: 700, color: '#38BDF8', fontFamily: 'monospace' }}>
                        {asset.asset_tag}
                      </td>
                      <td style={{ fontWeight: 600, color: '#F8FAFC' }}>
                        {asset.name}
                      </td>
                      <td style={{ color: '#94A3B8' }}>{asset.type}</td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: asset.environment === 'Production' ? '#F8FAFC' : '#94A3B8' }}>
                          {asset.environment}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#CBD5E1' }}>
                        {asset.ip_address}
                      </td>
                      <td style={{ minWidth: '160px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginBottom: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>CPU: <strong>{asset.cpu_usage ?? 20}%</strong></span>
                          <span>RAM: <strong>{asset.memory_usage ?? 35}%</strong></span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#0B1120', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${asset.cpu_usage ?? 20}%`,
                            height: '100%',
                            background: (asset.cpu_usage ?? 20) > 85 ? '#EF4444' : (asset.cpu_usage ?? 20) > 60 ? '#F59E0B' : '#22C55E'
                          }} />
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isHealthy ? 'badge-healthy' : isWarning ? 'badge-warning' : 'badge-critical'}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#F87171' }}
                            title="Simulate Node Alert & Failover"
                            onClick={() => handleSimulateAlert(asset.id)}
                          >
                            <AlertTriangle size={12} /> Alert
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#38BDF8' }}
                            title="Edit Asset"
                            onClick={() => setEditingAsset(asset)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#F87171' }}
                            title="Delete Asset"
                            onClick={() => setDeletingAsset(asset)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Asset Modal */}
      {isNewAssetOpen && (
        <NewAssetModal
          onClose={() => setIsNewAssetOpen(false)}
          onSubmit={handleCreateAsset}
        />
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <EditAssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSubmit={(formData) => handleUpdateAsset(editingAsset.id, formData)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingAsset && (
        <ConfirmDeleteModal
          title={`Delete Asset ${deletingAsset.asset_tag}`}
          message={`Are you sure you want to permanently delete asset ${deletingAsset.name} (${deletingAsset.asset_tag})?`}
          loading={deleteLoading}
          onClose={() => setDeletingAsset(null)}
          onConfirm={handleDeleteAsset}
        />
      )}
    </div>
  );
}
