import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Rocket,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  GitCommit,
  Layers,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function DevOpsReleases() {
  const [status, setStatus] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, buildsData] = await Promise.all([
        api.getDevopsStatus(),
        api.getDevopsBuilds()
      ]);
      setStatus(statusData);
      setBuilds(buildsData);
    } catch (err) {
      console.error('Failed to load DevOps data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerBuild = async () => {
    setTriggering(true);
    try {
      // Simulate live stage progression for interactive demo
      for (let i = 0; i < 6; i++) {
        setActiveStageIndex(i);
        await new Promise(r => setTimeout(r, 400));
      }
      await api.triggerDevopsBuild({
        branch: 'main',
        commitMessage: 'feat(core): trigger automated CI/CD validation build'
      });
      await loadData();
      setActiveStageIndex(null);
    } catch (err) {
      alert('Error triggering build: ' + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const stages = [
    { name: 'Git Push', icon: GitBranch, description: 'Webhook triggers CI' },
    { name: 'Jenkins Checkout', icon: Terminal, description: 'Clone repository' },
    { name: 'Frontend Build', icon: Layers, description: 'Vite React compile' },
    { name: 'Backend Validation', icon: ShieldCheck, description: 'Express API check' },
    { name: 'Docker Build', icon: Cpu, description: 'Multi-stage container' },
    { name: 'Deploy Live', icon: Rocket, description: 'Container cluster up' }
  ];

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow">
            <Rocket size={14} />
            CONTINUOUS INTEGRATION & DEPLOYMENT
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0.2rem 0 0.35rem' }}>
            DevOps & Release Management
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Monitor live Jenkins pipelines, Docker container builds, Git commit tracking, and deployment history
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'problem-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleTriggerBuild} disabled={triggering}>
            <Play size={15} /> {triggering ? 'Running Pipeline...' : 'Trigger CI/CD Build'}
          </button>
        </div>
      </div>

      {/* CI/CD Integration Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Jenkins Card */}
        <div className="basic-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CI/CD Pipeline Engine
            </span>
            <span className={`badge ${status?.jenkins?.connected ? 'badge-healthy' : 'badge-warning'}`}>
              {status?.jenkins?.status || 'CONFIG REQUIRED'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.35rem' }}>
            Jenkins Automation
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 0.85rem' }}>
            {status?.jenkins?.connected
              ? `Connected to ${status.jenkins.serverUrl}`
              : 'Declarative Jenkinsfile pipeline in project root. Configurable via JENKINS_URL.'}
          </p>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace', background: '#0B1120', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #1E293B' }}>
            Pipeline: {status?.jenkins?.pipeline || 'nexus-it-ops-cicd'}
          </div>
        </div>

        {/* Docker Card */}
        <div className="basic-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Container Runtime
            </span>
            <span className="badge badge-healthy">
              ● RUNNING
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.35rem' }}>
            Docker & Compose
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 0.85rem' }}>
            4 Active containers: Frontend (3005), Backend (5005), MongoDB (27019), Mongo-Express (8085).
          </p>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace', background: '#0B1120', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #1E293B' }}>
            Network: itsm_network (Bridge isolated)
          </div>
        </div>

        {/* GitHub Card */}
        <div className="basic-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Source Control
            </span>
            <span className="badge badge-healthy">
              ● CONNECTED
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.35rem' }}>
            GitHub Repository
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 0.85rem' }}>
            Branch: <strong style={{ color: '#38BDF8' }}>main</strong> | Auto-trigger on Git Push
          </p>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace', background: '#0B1120', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #1E293B' }}>
            Repo: AI-Powered-ITSM-Platform
          </div>
        </div>
      </div>

      {/* Pipeline Visualization Panel */}
      <div className="basic-card" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="analytics-title-icon">
              <Rocket size={18} />
            </div>
            <div>
              <h2>End-to-End DevOps Release Pipeline</h2>
              <p>Visual workflow execution from source code commit to containerized deployment</p>
            </div>
          </div>
          <span className="badge badge-healthy">
            Automated CI/CD Flow
          </span>
        </div>

        <div className="pipeline-flow-container">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = activeStageIndex === idx;
            const isCompleted = activeStageIndex !== null && activeStageIndex > idx;

            return (
              <React.Fragment key={idx}>
                <div className={`pipeline-stage-node ${isCurrent ? 'running' : isCompleted || activeStageIndex === null ? 'success' : ''}`}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCurrent ? 'rgba(56, 189, 248, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                    color: isCurrent ? '#38BDF8' : '#4ADE80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.4rem'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div className="pipeline-stage-title">{stage.name}</div>
                  <div className="pipeline-stage-duration">{stage.description}</div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <span className={`badge ${isCurrent ? 'badge-warning' : 'badge-healthy'}`} style={{ fontSize: '0.58rem' }}>
                      {isCurrent ? 'RUNNING' : 'PASS'}
                    </span>
                  </div>
                </div>

                {idx < stages.length - 1 && (
                  <div style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 800 }}>➔</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Recent Builds Table */}
      <div className="basic-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="recent-title-icon">
              <Clock size={18} />
            </div>
            <div>
              <h2>Recent Pipeline Builds & Deployments</h2>
              <p>Audit trail of validated code builds, test executions, and Docker artifacts</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Build #</th>
                <th>Branch</th>
                <th>Commit</th>
                <th>Commit Message</th>
                <th>Duration</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((build) => (
                <tr key={build.buildNumber}>
                  <td style={{ fontWeight: 700, color: '#38BDF8' }}>#{build.buildNumber}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#94A3B8' }}>
                      <GitBranch size={13} /> {build.branch}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: '#CBD5E1', background: '#0B1120', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #1E293B' }}>
                      {build.commit}
                    </span>
                  </td>
                  <td style={{ maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {build.commitMessage}
                  </td>
                  <td style={{ color: '#94A3B8' }}>{build.durationSeconds}s</td>
                  <td style={{ color: '#64748B', fontSize: '0.74rem' }}>
                    {new Date(build.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-healthy">
                      <CheckCircle2 size={12} /> {build.status}
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
