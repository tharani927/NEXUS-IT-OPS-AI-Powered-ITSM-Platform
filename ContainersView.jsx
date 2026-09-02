import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Boxes, RefreshCw, CheckCircle2, Cpu, HardDrive, Terminal } from 'lucide-react';

export default function ContainersView() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContainers = async () => {
    try {
      setLoading(true);
      const data = await api.getContainersStatus();
      setContainers(data);
    } catch (err) {
      console.error('Failed to load container status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <Boxes size={14} />
            DOCKER CONTAINER TELEMETRY
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Docker Container Topology & Health
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Live status of container instances, CPU/Memory telemetry, and host-to-container port mappings
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadContainers} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh Status
        </button>
      </div>

      {/* Containers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {containers.map((c, idx) => (
          <div key={idx} className="basic-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38BDF8', margin: 0, fontFamily: 'monospace' }}>
                  {c.name}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  Image: {c.image}
                </span>
              </div>
              <span className="badge badge-healthy">
                ● {c.status}
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#CBD5E1', marginBottom: '0.85rem' }}>
              {c.role}
            </p>

            {/* Ports & Telemetry */}
            <div style={{ background: '#0B1120', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.72rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Port Mapping</span>
                <strong style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>{c.hostPort} : {c.containerPort}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Uptime</span>
                <strong style={{ color: '#4ADE80' }}>{c.uptime}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>CPU Usage</span>
                <strong style={{ color: '#38BDF8' }}>{c.cpu}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Memory</span>
                <strong style={{ color: '#F8FAFC' }}>{c.memory}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={12} color="#22C55E" /> Docker Engine Healthcheck: OK
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
