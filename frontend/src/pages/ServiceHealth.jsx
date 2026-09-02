import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Shield,
  Zap,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function ServiceHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getServicesHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to load service health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <Activity size={14} />
            REAL-TIME INFRASTRUCTURE AVAILABILITY
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Service Health & System Status
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Live status monitoring for critical APIs, databases, authentication brokers, and edge ingress nodes
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadHealth} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {/* Aggregate Overview Banner */}
      <div className="basic-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(17, 24, 39, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Overall System Availability
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginTop: '0.2rem' }}>
              {healthData?.overallScore ?? 99.8}%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {healthData?.operationalCount ?? 5} of {healthData?.totalServices ?? 6} services fully operational
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#0B1120', borderRadius: '8px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>Operational</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ADE80' }}>
                {healthData?.operationalCount ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: '#0B1120', borderRadius: '8px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>Degraded</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24' }}>
                {healthData?.degradedCount ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: '#0B1120', borderRadius: '8px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>Outage</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F87171' }}>
                {healthData?.outageCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {healthData?.services?.map((svc) => {
          const isOperational = svc.status === 'Operational';
          const isDegraded = svc.status === 'Degraded';
          const isOutage = svc.status === 'Outage';

          return (
            <div
              key={svc.id}
              className="basic-card"
              style={{
                padding: '1.25rem',
                borderLeft: `4px solid ${isOperational ? '#22C55E' : isDegraded ? '#F59E0B' : '#EF4444'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                    {svc.name}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {svc.type}
                  </span>
                </div>
                <span className={`badge ${isOperational ? 'badge-healthy' : isDegraded ? 'badge-warning' : 'badge-critical'}`}>
                  {svc.status}
                </span>
              </div>

              {/* Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: '#0B1120', padding: '0.65rem', borderRadius: '6px', border: '1px solid #1E293B', margin: '0.75rem 0' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Uptime</span>
                  <strong style={{ fontSize: '0.85rem', color: '#38BDF8' }}>{svc.uptime}%</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Latency</span>
                  <strong style={{ fontSize: '0.85rem', color: '#F8FAFC' }}>{svc.latencyMs}ms</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>RPS</span>
                  <strong style={{ fontSize: '0.85rem', color: '#F8FAFC' }}>{svc.throughputRps}</strong>
                </div>
              </div>

              {/* Environment and Active Incidents */}
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                <strong>Environment:</strong> {svc.environment}
              </div>

              {svc.activeIncidents > 0 ? (
                <div style={{ fontSize: '0.72rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  ⚠️ Affected by {svc.activeIncidents} active P1 incident ticket
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} /> SLA compliance active (Zero blocking tickets)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
