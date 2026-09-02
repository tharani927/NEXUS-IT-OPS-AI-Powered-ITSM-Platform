import React from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  Server,
  ShoppingBag,
  GitPullRequest,
  Bot,
  SearchCheck,
  Rocket,
  CheckSquare,
  Activity,
  BookOpen,
  Boxes,
  FileText,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeIncidentsCount = 0 }) {
  const navigationGroups = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Service Operations',
      items: [
        { id: 'incidents', label: 'Incidents', icon: AlertCircle, count: activeIncidentsCount > 0 ? activeIncidentsCount : null },
        { id: 'problems', label: 'Problem Management', icon: SearchCheck },
        { id: 'infrastructure', label: 'IT Assets & Telemetry', icon: Server },
        { id: 'catalog', label: 'Service Requests', icon: ShoppingBag },
        { id: 'changes', label: 'Change Management', icon: GitPullRequest }
      ]
    },
    {
      title: 'DevOps & CI/CD',
      items: [
        { id: 'devops', label: 'DevOps & Releases', icon: Rocket },
        { id: 'jira', label: 'Jira / Work Items', icon: CheckSquare },
        { id: 'containers', label: 'Docker Containers', icon: Boxes }
      ]
    },
    {
      title: 'Intelligence & Runbooks',
      items: [
        { id: 'copilot', label: 'AI Operations Copilot', icon: Bot, isAi: true },
        { id: 'servicehealth', label: 'Service Health', icon: Activity },
        { id: 'knowledgebase', label: 'Knowledge Base', icon: BookOpen },
        { id: 'activitylogs', label: 'Audit & Activity', icon: FileText }
      ]
    }
  ];

  return (
    <aside className="nexus-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon-box">
          N
        </div>
        <div>
          <div className="sidebar-logo-text">
            NEXUS <span>IT OPS</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.02em' }}>
            ITSM & DEVOPS PLATFORM
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="sidebar-group">
            <span className="sidebar-group-title">{group.title}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`sidebar-item-btn ${isActive ? 'active' : ''}`}
                >
                  <div className="sidebar-item-content">
                    <Icon
                      size={16}
                      color={isActive ? '#38BDF8' : item.isAi ? '#A855F7' : '#94A3B8'}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.count && (
                    <span className="sidebar-item-badge">
                      {item.count}
                    </span>
                  )}
                  {item.isAi && !item.count && (
                    <span style={{ fontSize: '0.58rem', background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}