import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import {
  AlertCircle,
  CheckCircle,
  Server,
  Plus,
  Activity,
  ShieldCheck,
  Brain,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Database,
  Network,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function Dashboard({ onSelectIncident, onOpenNewIncident, onNavigateTab }) {
  const [metrics, setMetrics] = useState(null);
  const [allIncidents, setAllIncidents] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, inc] = await Promise.all([
        api.getMetrics(),
        api.getIncidents({ status: 'All' }),
      ]);

      setMetrics(m);
      const incidents = Array.isArray(inc) ? inc : [];
      setAllIncidents(incidents);
      setRecentIncidents(incidents.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const health = Number(metrics?.infrastructureHealthScore ?? 100);
  const activeIncidents = Number(metrics?.activeIncidents ?? 0);
  const resolvedIncidents = Number(metrics?.resolvedIncidents ?? 0);
  const assets = Number(metrics?.activeAssetsCount ?? 0);

  const priorityCounts = useMemo(() => {
    return {
      P1: allIncidents.filter((i) => i.priority === 'P1').length,
      P2: allIncidents.filter((i) => i.priority === 'P2').length,
      P3: allIncidents.filter((i) => i.priority === 'P3').length,
      P4: allIncidents.filter((i) => i.priority === 'P4').length,
    };
  }, [allIncidents]);

  const activeIncidentList = useMemo(() => {
    return allIncidents.filter(
      (incident) =>
        incident.status &&
        incident.status.toLowerCase() !== 'resolved' &&
        incident.status.toLowerCase() !== 'closed'
    );
  }, [allIncidents]);

  const activePriorityIncidents = useMemo(() => {
    const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
    return [...activeIncidentList]
      .sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5))
      .slice(0, 4);
  }, [activeIncidentList]);

  const aiAnalysis = useMemo(() => {
    const p1 = priorityCounts.P1;
    const p2 = priorityCounts.P2;
    const insights = [];

    let riskScore = 0;
    riskScore += p1 * 30;
    riskScore += p2 * 15;
    if (health < 80) riskScore += 20;
    if (health < 60) riskScore += 15;
    if (activeIncidents >= 5) riskScore += 10;
    riskScore = Math.min(riskScore, 100);

    let riskLevel = 'LOW';
    if (riskScore >= 60) riskLevel = 'CRITICAL';
    else if (riskScore >= 30) riskLevel = 'ELEVATED';

    if (p1 > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: `${p1} critical P1 incident${p1 > 1 ? 's' : ''} active`,
        description: 'Urgent resolution required to meet mission-critical SLAs.'
      });
    } else if (activeIncidents > 0) {
      insights.push({
        type: 'info',
        icon: AlertCircle,
        title: `${activeIncidents} active ticket${activeIncidents > 1 ? 's' : ''} in queue`,
        description: 'Review the active incident queue and prioritize unresolved tasks.'
      });
    } else {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Zero blocking incidents detected',
        description: 'Operational queues are performing within nominal thresholds.'
      });
    }

    if (health < 80) {
      insights.push({
        type: 'warning',
        icon: Database,
        title: `Infrastructure health is at ${health}%`,
        description: 'Investigate unhealthy DB clusters and high-latency ingress nodes.'
      });
    } else {
      insights.push({
        type: 'success',
        icon: Server,
        title: `Infrastructure health score: ${health}%`,
        description: 'Kubernetes nodes, DB clusters, and API gateways are healthy.'
      });
    }

    let recommendation = 'Continue continuous monitoring of infrastructure and incidents.';
    if (p1 > 0 && health < 80) {
      recommendation = 'Execute AI resolution playbooks for P1 incidents and scale bottlenecked DB connections.';
    } else if (p1 > 0) {
      recommendation = 'Initiate immediate P1 incident command bridge and review recent deployments.';
    } else if (health < 80) {
      recommendation = 'Inspect unhealthy nodes before service degradation spreads across production tiers.';
    }

    return { insights, riskScore, riskLevel, recommendation };
  }, [priorityCounts, health, activeIncidents]);

  if (loading && !metrics) {
    return (
      <div className="page-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#94A3B8', gap: '0.75rem' }}>
          <Activity size={24} className="problem-spin" color="#38BDF8" />
          <span>Connecting to NEXUS Operations Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="eyebrow">
            <Activity size={14} />
            IT OPERATIONS CENTER
          </div>
          <h1>Operations Command Center</h1>
          <p>Real-time enterprise IT infrastructure visibility, AI risk scoring, and incident triage</p>
        </div>

        <div className="dashboard-header-actions">
          <div className="status-indicator">
            <span className="status-dot-pulse"></span>
            <ShieldCheck size={15} />
            <span>NOC Active</span>
          </div>

          <button className="btn btn-primary" onClick={onOpenNewIncident}>
            <Plus size={16} /> Create Incident
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        {/* Active Incidents */}
        <div className="dashboard-kpi-card kpi-danger">
          <div className="kpi-top">
            <div className="kpi-icon">
              <AlertCircle size={18} />
            </div>
            <span className="kpi-label">Active Incidents</span>
          </div>
          <div className="kpi-value">{activeIncidents}</div>
          <div className="kpi-footer">
            <span>Open support tickets</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="dashboard-kpi-card kpi-success">
          <div className="kpi-top">
            <div className="kpi-icon">
              <CheckCircle size={18} />
            </div>
            <span className="kpi-label">Resolved Tickets</span>
          </div>
          <div className="kpi-value">{resolvedIncidents}</div>
          <div className="kpi-footer">
            <span>Completed resolutions</span>
            <TrendingUp size={14} />
          </div>
        </div>

        {/* IT Assets */}
        <div className="dashboard-kpi-card kpi-blue">
          <div className="kpi-top">
            <div className="kpi-icon">
              <Server size={18} />
            </div>
            <span className="kpi-label">Monitored Assets</span>
          </div>
          <div className="kpi-value">{assets}</div>
          <div className="kpi-footer">
            <span>Clusters, DBs & Nodes</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        {/* Health */}
        <div className="dashboard-kpi-card kpi-health">
          <div className="kpi-top">
            <div className="kpi-icon">
              <Activity size={18} />
            </div>
            <span className="kpi-label">Infrastructure Health</span>
          </div>
          <div className="kpi-value">{health}%</div>
          <div className="kpi-progress">
            <div className="kpi-progress-fill" style={{ width: `${Math.min(health, 100)}%` }} />
          </div>
          <div className="kpi-footer">
            <span>Uptime availability ratio</span>
            <ShieldCheck size={14} />
          </div>
        </div>
      </div>

      {/* AI Insights & System Health Grid */}
      <div className="dashboard-main-grid">
        {/* AI Operational Insights */}
        <div className="basic-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <div className="ai-title-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h2>AI Operational Risk & Analysis</h2>
                <p>Real-time machine learning telemetry analysis</p>
              </div>
            </div>
            <span className="ai-badge">
              <Brain size={12} /> AI ACTIVE
            </span>
          </div>

          {/* Risk Summary Box */}
          <div style={{
            margin: '0.85rem 1rem 0.4rem',
            padding: '0.85rem',
            borderRadius: '8px',
            background: aiAnalysis.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : aiAnalysis.riskLevel === 'ELEVATED' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
            border: `1px solid ${aiAnalysis.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.35)' : aiAnalysis.riskLevel === 'ELEVATED' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(34, 197, 94, 0.35)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={15} color={aiAnalysis.riskLevel === 'CRITICAL' ? '#f87171' : aiAnalysis.riskLevel === 'ELEVATED' ? '#fbbf24' : '#4ade80'} />
                <strong style={{ fontSize: '0.76rem', color: '#F8FAFC' }}>
                  AI Operational Risk Score: {aiAnalysis.riskScore}/100
                </strong>
              </div>
              <span className={`badge ${aiAnalysis.riskLevel === 'CRITICAL' ? 'badge-critical' : aiAnalysis.riskLevel === 'ELEVATED' ? 'badge-warning' : 'badge-healthy'}`}>
                {aiAnalysis.riskLevel}
              </span>
            </div>

            <div style={{ width: '100%', height: '5px', background: '#0B1120', borderRadius: '999px', marginTop: '0.55rem', overflow: 'hidden' }}>
              <div style={{
                width: `${aiAnalysis.riskScore}%`,
                height: '100%',
                background: aiAnalysis.riskLevel === 'CRITICAL' ? '#EF4444' : aiAnalysis.riskLevel === 'ELEVATED' ? '#F59E0B' : '#22C55E',
                borderRadius: 'inherit',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Dynamic Insights */}
          <div className="insight-list">
            {aiAnalysis.insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div key={idx} className={`insight-item ${insight.type}`}>
                  <div className="insight-icon">
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{insight.title}</strong>
                    <span>{insight.description}</span>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </div>
              );
            })}
          </div>

          {/* Recommendation Box */}
          <div style={{ margin: '0 1rem 0.85rem', padding: '0.75rem 0.85rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', gap: '0.65rem' }}>
            <Brain size={16} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', color: '#38BDF8', fontSize: '0.74rem', marginBottom: '0.15rem' }}>
                AI Recommended Action
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                {aiAnalysis.recommendation}
              </span>
            </div>
          </div>

          <div className="ai-footer">
            <Brain size={14} color="#A855F7" />
            AI analysis continually correlates telemetry across databases, clusters, and incident queues.
          </div>
        </div>

        {/* System Health */}
        <div className="basic-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <div className="health-title-icon">
                <Activity size={18} />
              </div>
              <div>
                <h2>Infrastructure Health</h2>
                <p>Asset availability ratio</p>
              </div>
            </div>
            <span className="health-score" style={{ color: '#4ADE80', fontWeight: 800, fontSize: '0.9rem' }}>
              {health}%
            </span>
          </div>

          <div className="health-main">
            <div className="health-ring" style={{ '--health': Math.min(health, 100) }}>
              <div className="health-ring-inner">
                <strong>{health}%</strong>
                <span>Availability</span>
              </div>
            </div>

            <div className="health-summary">
              <div>
                <span>Operational State</span>
                <strong style={{ color: health >= 80 ? '#4ADE80' : '#FBBF24' }}>
                  {health >= 80 ? 'All Systems Nominal' : 'Attention Required'}
                </strong>
              </div>
              <div>
                <span>Monitored Nodes</span>
                <strong>{assets} Active Services</strong>
              </div>
            </div>
          </div>

          <div className="health-services">
            <div className="health-service">
              <div><Server size={15} color="#38BDF8" /> Kubernetes Clusters</div>
              <span className="health-online">MONITORED</span>
            </div>
            <div className="health-service">
              <div><Database size={15} color="#38BDF8" /> PostgreSQL & Redis DBs</div>
              <span className="health-online">MONITORED</span>
            </div>
            <div className="health-service">
              <div><Network size={15} color="#38BDF8" /> API Ingress Gateways</div>
              <span className="health-online">MONITORED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Priority Overview */}
      <div className="basic-card" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="analytics-title-icon">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2>Incident Priority Distribution</h2>
              <p>Active severity breakdown across IT operations</p>
            </div>
          </div>
          <span className="live-label" style={{ color: '#4ADE80', fontSize: '0.7rem', fontWeight: 700 }}>
            ● LIVE METRICS
          </span>
        </div>

        <div className="priority-grid">
          {[
            { key: 'P1', label: 'Critical Outages', count: priorityCounts.P1, className: 'priority-p1' },
            { key: 'P2', label: 'High Priority', count: priorityCounts.P2, className: 'priority-p2' },
            { key: 'P3', label: 'Medium Priority', count: priorityCounts.P3, className: 'priority-p3' },
            { key: 'P4', label: 'Low / Minor', count: priorityCounts.P4, className: 'priority-p4' },
          ].map((p) => (
            <div key={p.key} className={`priority-card ${p.className}`}>
              <div className="priority-card-top">
                <span>{p.key}</span>
                <AlertCircle size={15} />
              </div>
              <strong>{p.count}</strong>
              <span>{p.label}</span>
              <div className="priority-bar">
                <div style={{ width: `${Math.min(p.count * 25, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Incidents Queue */}
      <div className="basic-card" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="incident-title-icon">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2>Active Priority Incidents</h2>
              <p>High-impact tickets requiring engineering triage</p>
            </div>
          </div>
          {onNavigateTab && (
            <button className="dashboard-link-button" onClick={() => onNavigateTab('incidents')}>
              View all tickets <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div className="priority-incident-list">
          {activePriorityIncidents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
              <CheckCircle size={24} color="#22C55E" style={{ margin: '0 auto 0.4rem', display: 'block' }} />
              All recent incidents resolved. Zero active blocking tickets.
            </div>
          ) : (
            activePriorityIncidents.map((incident) => (
              <div
                key={incident.id}
                className="priority-incident-row"
                onClick={() => onSelectIncident(incident)}
              >
                <div className={`incident-priority-dot ${incident.priority?.toLowerCase() || 'p3'}`} />
                <div className="incident-main">
                  <div className="incident-id">{incident.ticket_number}</div>
                  <strong>{incident.title}</strong>
                  <span>{incident.category || 'Infrastructure'} • {incident.assigned_team || 'Tier-1 Desk'}</span>
                </div>
                <span className={`badge badge-${incident.priority ? incident.priority.toLowerCase() : 'p3'}`}>
                  {incident.priority || 'P3'}
                </span>
                <span className={`badge ${incident.status?.toLowerCase() === 'resolved' ? 'badge-resolved' : 'badge-open'}`}>
                  {incident.status}
                </span>
                <ChevronRight size={16} color="#64748B" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="basic-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="recent-title-icon">
              <Clock size={18} />
            </div>
            <div>
              <h2>Recent IT Service Desk Incidents</h2>
              <p>Latest tickets logged by Alertmanager and support engineers</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="simple-table dashboard-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Incident Title</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">No tickets logged.</td>
                </tr>
              ) : (
                recentIncidents.map((incident) => (
                  <tr key={incident.id} className="dashboard-table-row">
                    <td>
                      <button className="ticket-link" onClick={() => onSelectIncident(incident)}>
                        {incident.ticket_number}
                      </button>
                    </td>
                    <td>
                      <strong style={{ color: '#F8FAFC', fontSize: '0.8rem' }}>{incident.title}</strong>
                    </td>
                    <td>
                      <span className={`badge badge-${incident.priority ? incident.priority.toLowerCase() : 'p3'}`}>
                        {incident.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#94A3B8' }}>{incident.category || 'Infrastructure'}</span>
                    </td>
                    <td>
                      <span className={`badge ${incident.status?.toLowerCase() === 'resolved' ? 'badge-resolved' : 'badge-open'}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-incident-btn" onClick={() => onSelectIncident(incident)}>
                        View Details <ChevronRight size={12} />
                      </button>
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