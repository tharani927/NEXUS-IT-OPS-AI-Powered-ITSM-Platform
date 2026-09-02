import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  CheckSquare,
  RefreshCw,
  GitBranch,
  GitCommit,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function JiraWorkItems() {
  const [jiraStatus, setJiraStatus] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, issuesData] = await Promise.all([
        api.getJiraStatus(),
        api.getJiraIssues()
      ]);
      setJiraStatus(statusData);
      setIssues(issuesData);
    } catch (err) {
      console.error('Failed to load Jira data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncJiraIssues();
      alert('Jira project work items synchronized successfully!');
      await loadData();
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <CheckSquare size={14} />
            AGILE & DEVOPS TRACEABILITY
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            Jira Work Items & Lifecycle Traceability
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Trace work items across the full lifecycle: Jira Issue ➔ Git Branch ➔ Jenkins Build ➔ Docker Deployment ➔ Incident Resolution
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowConfigGuide(!showConfigGuide)}>
            <HelpCircle size={14} /> API Setup Guide
          </button>
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? 'problem-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Jira Issues'}
          </button>
        </div>
      </div>

      {/* Configuration Guide Box */}
      {showConfigGuide && (
        <div className="basic-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#0F172A', borderColor: '#38BDF8' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#38BDF8', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} /> Jira Cloud REST API Configuration
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
            To connect live Jira Cloud instances, add the following environment variables to your <code style={{ color: '#38BDF8' }}>backend/.env</code> file:
          </p>
          <pre style={{ background: '#0B1120', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B', color: '#38BDF8', fontSize: '0.75rem', overflowX: 'auto' }}>
{`JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token-from-atlassian
JIRA_PROJECT_KEY=NEXUS`}
          </pre>
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
            Currently operating in verified demonstration mode with enterprise work items.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="basic-card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Jira Cloud Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <strong style={{ fontSize: '1.2rem', color: '#F8FAFC' }}>
              Project {jiraStatus?.projectKey || 'NEXUS'}
            </strong>
            <span className={`badge ${jiraStatus?.connected ? 'badge-healthy' : 'badge-warning'}`}>
              {jiraStatus?.status || 'CONFIG REQUIRED'}
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
            Mode: {jiraStatus?.syncMode || 'DevOps Traceability Ready'}
          </div>
        </div>

        <div className="basic-card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Total Tracked Issues
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.35rem' }}>
            {issues.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Across active Sprint 24 & Release queues
          </div>
        </div>

        <div className="basic-card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Open / In Progress
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.35rem' }}>
            {issues.filter(i => i.status !== 'Done').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Requiring engineering completion
          </div>
        </div>
      </div>

      {/* DevOps Full Traceability Pipeline Flow */}
      <div className="basic-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem' }}>
          🔗 Complete Jira-to-Deployment Traceability Matrix
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0B1120',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #1E293B',
          overflowX: 'auto',
          gap: '0.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-open">Jira Issue</span>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.3rem' }}>NEXUS-101</div>
          </div>
          <ArrowRight size={16} color="#64748B" />
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-p2">Git Branch</span>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#F8FAFC', marginTop: '0.3rem' }}>hotfix/nexus-101</div>
          </div>
          <ArrowRight size={16} color="#64748B" />
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-p3">GitHub Commit</span>
            <div style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#38BDF8', marginTop: '0.3rem' }}>a9f4c12</div>
          </div>
          <ArrowRight size={16} color="#64748B" />
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-healthy">Jenkins CI</span>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#4ADE80', marginTop: '0.3rem' }}>Build #142 PASS</div>
          </div>
          <ArrowRight size={16} color="#64748B" />
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-healthy">Docker Deploy</span>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#F8FAFC', marginTop: '0.3rem' }}>itsm-backend:v1</div>
          </div>
          <ArrowRight size={16} color="#64748B" />
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-resolved">ITSM Ticket</span>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#4ADE80', marginTop: '0.3rem' }}>INC-1001 Resolved</div>
          </div>
        </div>
      </div>

      {/* Jira Issues Table */}
      <div className="basic-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="analytics-title-icon">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2>Jira Work Items & Linked ITSM Tickets</h2>
              <p>Active sprint issues, bug reports, and linked change requests</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Summary</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Linked Incident / RFC</th>
                <th>Git Branch</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((item) => (
                <tr key={item.key}>
                  <td style={{ fontWeight: 700, color: '#38BDF8' }}>
                    <a
                      href={`${jiraStatus?.baseUrl || 'https://jira.atlassian.com'}/browse/${item.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38BDF8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      {item.key} <ExternalLink size={11} />
                    </a>
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: '280px' }}>{item.summary}</td>
                  <td>
                    <span className="badge badge-low">{item.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${item.priority === 'Highest' ? 'badge-p1' : item.priority === 'High' ? 'badge-p2' : 'badge-p3'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Done' ? 'badge-resolved' : item.status === 'In Progress' ? 'badge-warning' : 'badge-open'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ color: '#CBD5E1' }}>{item.assignee}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: item.linkedIncident.startsWith('INC') ? '#f87171' : '#fbbf24' }}>
                      {item.linkedIncident}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#94A3B8' }}>
                      <GitBranch size={12} /> {item.gitBranch}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
