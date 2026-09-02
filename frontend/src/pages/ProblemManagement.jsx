import React, { useEffect, useMemo, useState } from 'react';
import {
  SearchCheck,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Layers,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function ProblemManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState(null);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({ status: 'All' });
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const normalizeTitle = (title = '') => {
    return title
      .toLowerCase()
      .replace(/inc[-\s]?\d+/gi, '')
      .replace(/ticket[-\s]?\d+/gi, '')
      .replace(/[0-9]+/g, '')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const recurringPatterns = useMemo(() => {
    const groups = {};

    incidents.forEach((incident) => {
      const key =
        normalizeTitle(incident.title || incident.description) ||
        incident.category ||
        'unknown';

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(incident);
    });

    return Object.entries(groups)
      .filter(([, items]) => items.length >= 1)
      .map(([key, items], index) => {
        const first = items[0];
        const category = first.category || first.type || 'Infrastructure';
        let rootCause = 'Recurring service issue requiring root-cause investigation';
        const categoryText = category.toLowerCase();
        const titleText = key.toLowerCase();

        if (categoryText.includes('database') || titleText.includes('database') || titleText.includes('sql')) {
          rootCause = 'Database connection pool saturation or unindexed query lock escalation.';
        } else if (categoryText.includes('network') || titleText.includes('network') || titleText.includes('timeout')) {
          rootCause = 'Ingress gateway traffic surge exceeding container memory boundaries.';
        } else if (categoryText.includes('security') || categoryText.includes('identity') || titleText.includes('auth')) {
          rootCause = 'Domain controller SSL certificate handshake mismatch during credential validation.';
        }

        const priorities = items.map((item) => item.priority);
        let maxPriority = 'P3';
        if (priorities.includes('P1')) maxPriority = 'P1';
        else if (priorities.includes('P2')) maxPriority = 'P2';

        return {
          id: `PRB-100${index + 1}`,
          title: `Pattern: ${first.title}`,
          normalizedKey: key,
          category,
          impactedService: first.impacted_service || 'Enterprise Core Infrastructure',
          priority: maxPriority,
          count: items.length,
          incidents: items,
          suggestedRootCause: rootCause,
          firstDetected: first.created_at || 'Recent',
          status: items.some(i => i.status !== 'Resolved' && i.status !== 'Closed') ? 'Under Investigation' : 'Known Error Logged'
        };
      });
  }, [incidents]);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <SearchCheck size={14} />
            ITIL PROBLEM MANAGEMENT & ROOT CAUSE ANALYSIS
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Problem Management & Incident Clustering
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            AI-driven recurring incident detection, pattern clustering, and permanent root-cause elimination
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadIncidents} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Rescan Patterns
        </button>
      </div>

      {/* KPI Stats */}
      <div className="problem-stat-grid">
        <div className="problem-stat-card">
          <div className="problem-stat-icon blue">
            <Layers size={20} />
          </div>
          <div>
            <span>Identified Problem Patterns</span>
            <strong>{recurringPatterns.length}</strong>
          </div>
        </div>

        <div className="problem-stat-card">
          <div className="problem-stat-icon orange">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span>Active Investigations</span>
            <strong>{recurringPatterns.filter(p => p.status === 'Under Investigation').length}</strong>
          </div>
        </div>

        <div className="problem-stat-card">
          <div className="problem-stat-icon green">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Total Clustered Tickets</span>
            <strong>{incidents.length}</strong>
          </div>
        </div>
      </div>

      {/* AI Pattern Clustering Panel */}
      <div className="basic-card" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="ai-title-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h2>Detected Incident Pattern Clusters</h2>
              <p>Automated symptom grouping and root-cause hypotheses</p>
            </div>
          </div>
        </div>

        <div className="problem-pattern-list">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Scanning pattern clusters...</div>
          ) : recurringPatterns.length === 0 ? (
            <div className="table-empty">No recurring incident patterns identified.</div>
          ) : (
            recurringPatterns.map((pat) => (
              <div key={pat.id} className="problem-pattern-card">
                <div className="problem-pattern-main">
                  <div className="problem-pattern-id">{pat.id}</div>
                  <h3>{pat.title}</h3>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${pat.priority ? pat.priority.toLowerCase() : 'p3'}`}>
                      {pat.priority}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {pat.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600 }}>
                      {pat.incidents.length} Related Ticket{pat.incidents.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="problem-pattern-analysis">
                  <div className="problem-root-cause-label">AI Hypothesized Root Cause</div>
                  <p>{pat.suggestedRootCause}</p>
                </div>

                <div>
                  <button
                    className="problem-investigate-btn"
                    onClick={() => setSelectedPattern(pat)}
                  >
                    <Eye size={13} /> Investigate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Problem Lifecycle Workflow */}
      <div className="basic-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="analytics-title-icon">
              <BrainCircuit size={18} />
            </div>
            <div>
              <h2>ITIL Problem-to-Resolution Lifecycle</h2>
              <p>Standard operating procedure for permanent error resolution</p>
            </div>
          </div>
        </div>

        <div className="problem-workflow">
          <div className="workflow-step">
            <div className="workflow-number">1</div>
            <strong>Incident Triage</strong>
            <span>Detect symptom spike</span>
          </div>
          <div style={{ color: '#475569', fontWeight: 800 }}>➔</div>
          <div className="workflow-step">
            <div className="workflow-number">2</div>
            <strong>Pattern Clustering</strong>
            <span>Correlate recurring error</span>
          </div>
          <div style={{ color: '#475569', fontWeight: 800 }}>➔</div>
          <div className="workflow-step">
            <div className="workflow-number">3</div>
            <strong>Root Cause Analysis</strong>
            <span>AI hypothesis verification</span>
          </div>
          <div style={{ color: '#475569', fontWeight: 800 }}>➔</div>
          <div className="workflow-step">
            <div className="workflow-number">4</div>
            <strong>RFC Change Request</strong>
            <span>Submit permanent fix (CAB)</span>
          </div>
          <div style={{ color: '#475569', fontWeight: 800 }}>➔</div>
          <div className="workflow-step">
            <div className="workflow-number">5</div>
            <strong>CI/CD Deploy</strong>
            <span>Automated deployment</span>
          </div>
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedPattern && (
        <div className="problem-modal-overlay" onClick={() => setSelectedPattern(null)}>
          <div className="problem-modal" onClick={(e) => e.stopPropagation()}>
            <div className="problem-modal-header">
              <div>
                <span className="problem-modal-id">{selectedPattern.id}</span>
                <h2>{selectedPattern.title}</h2>
              </div>
              <button
                className="problem-modal-close"
                onClick={() => setSelectedPattern(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="problem-modal-body">
              <div className="problem-detail-grid">
                <div>
                  <span>Category</span>
                  <strong>{selectedPattern.category}</strong>
                </div>
                <div>
                  <span>Severity</span>
                  <strong style={{ color: selectedPattern.priority === 'P1' ? '#f87171' : '#fbbf24' }}>
                    {selectedPattern.priority}
                  </strong>
                </div>
                <div>
                  <span>Impacted Service</span>
                  <strong>{selectedPattern.impactedService}</strong>
                </div>
              </div>

              <div className="problem-detail-section">
                <label>AI Root Cause Hypothesis</label>
                <div style={{ background: '#0B1120', padding: '0.85rem', borderRadius: '6px', border: '1px solid #1E293B', color: '#38BDF8', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {selectedPattern.suggestedRootCause}
                </div>
              </div>

              <div className="problem-detail-section">
                <label>Linked Incident Tickets ({selectedPattern.incidents.length})</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {selectedPattern.incidents.map((inc) => (
                    <div
                      key={inc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        background: '#0B1120',
                        border: '1px solid #1E293B',
                        borderRadius: '6px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#38BDF8', marginRight: '0.5rem' }}>{inc.ticket_number}</strong>
                        <span style={{ color: '#F8FAFC' }}>{inc.title}</span>
                      </div>
                      <span className={`badge badge-${inc.priority ? inc.priority.toLowerCase() : 'p3'}`}>
                        {inc.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="problem-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPattern(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}