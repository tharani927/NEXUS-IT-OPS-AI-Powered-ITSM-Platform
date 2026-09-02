import React, { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Infrastructure from './pages/Infrastructure';
import ServiceCatalog from './pages/ServiceCatalog';
import ProblemManagement from './pages/ProblemManagement';
import ChangeManagement from './pages/ChangeManagement';
import DevOpsReleases from './pages/DevOpsReleases';
import JiraWorkItems from './pages/JiraWorkItems';
import ContainersView from './pages/ContainersView';
import AICopilot from './pages/AICopilot';
import ServiceHealth from './pages/ServiceHealth';
import KnowledgeBase from './pages/KnowledgeBase';
import ActivityLogsView from './pages/ActivityLogsView';

import IncidentDetailModal from './components/IncidentDetailModal';
import NewIncidentModal from './components/NewIncidentModal';
import NewServiceReqModal from './components/NewServiceReqModal';
import NewChangeModal from './components/NewChangeModal';

import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isNewChangeOpen, setIsNewChangeOpen] = useState(false);

  const [activeIncidentsCount, setActiveIncidentsCount] = useState(0);

  const loadHeaderMetrics = async () => {
    try {
      const metrics = await api.getMetrics();
      setActiveIncidentsCount(metrics.activeIncidents || 0);
    } catch (err) {
      console.error('Failed to fetch header metrics:', err);
    }
  };

  useEffect(() => {
    loadHeaderMetrics();
  }, []);

  const handleCreateIncident = async (formData) => {
    await api.createIncident(formData);
    await loadHeaderMetrics();
  };

  const handleCreateServiceRequest = async (formData) => {
    await api.createServiceRequest(formData);
  };

  const handleCreateChangeRequest = async (formData) => {
    await api.createChangeRequest(formData);
  };

  const handleResolveWithAI = async (incidentId) => {
    await api.resolveIncidentWithAI(incidentId);
    await loadHeaderMetrics();
  };

  return (
    <div className="app-container">
      {/* Grouped Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeIncidentsCount={activeIncidentsCount}
      />

      {/* Main Command Center Body */}
      <div className="main-content">
        <Navbar activeIncidentsCount={activeIncidentsCount} />

        {/* 1. Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenNewIncident={() => setIsNewIncidentOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* 2. Incidents */}
        {activeTab === 'incidents' && (
          <Incidents
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenNewIncident={() => setIsNewIncidentOpen(true)}
            onMetricsUpdate={loadHeaderMetrics}
          />
        )}

        {/* 3. Problem Management */}
        {activeTab === 'problems' && (
          <ProblemManagement />
        )}

        {/* 4. IT Assets / Infrastructure */}
        {activeTab === 'infrastructure' && (
          <Infrastructure
            onAlertSimulated={() => loadHeaderMetrics()}
            onMetricsUpdate={loadHeaderMetrics}
          />
        )}

        {/* 5. Service Requests */}
        {activeTab === 'catalog' && (
          <ServiceCatalog
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
          />
        )}

        {/* 6. Change Management */}
        {activeTab === 'changes' && (
          <ChangeManagement
            onOpenNewChange={() => setIsNewChangeOpen(true)}
          />
        )}

        {/* 7. DevOps & Releases */}
        {activeTab === 'devops' && (
          <DevOpsReleases />
        )}

        {/* 8. Jira / Work Items */}
        {activeTab === 'jira' && (
          <JiraWorkItems />
        )}

        {/* 9. Docker Containers Telemetry */}
        {activeTab === 'containers' && (
          <ContainersView />
        )}

        {/* 10. AI Operations Copilot */}
        {activeTab === 'copilot' && (
          <AICopilot />
        )}

        {/* 11. Service Health & Uptime */}
        {activeTab === 'servicehealth' && (
          <ServiceHealth />
        )}

        {/* 12. Knowledge Base & Runbooks */}
        {activeTab === 'knowledgebase' && (
          <KnowledgeBase
            onOpenCopilotWithPrompt={(prompt) => {
              setActiveTab('copilot');
            }}
          />
        )}

        {/* 13. Audit & Activity Stream */}
        {activeTab === 'activitylogs' && (
          <ActivityLogsView />
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onResolveWithAI={handleResolveWithAI}
        />
      )}

      {/* New Incident Modal */}
      {isNewIncidentOpen && (
        <NewIncidentModal
          onClose={() => setIsNewIncidentOpen(false)}
          onSubmit={handleCreateIncident}
        />
      )}

      {/* New Service Request Modal */}
      {isNewRequestOpen && (
        <NewServiceReqModal
          onClose={() => setIsNewRequestOpen(false)}
          onSubmit={handleCreateServiceRequest}
        />
      )}

      {/* New Change Request Modal */}
      {isNewChangeOpen && (
        <NewChangeModal
          onClose={() => setIsNewChangeOpen(false)}
          onSubmit={handleCreateChangeRequest}
        />
      )}
    </div>
  );
}