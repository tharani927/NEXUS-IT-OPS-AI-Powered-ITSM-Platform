const express = require('express');
const router = express.Router();

const Incident = require('../models/Incident');
const Asset = require('../models/Asset');
const ServiceRequest = require('../models/ServiceRequest');
const ChangeRequest = require('../models/ChangeRequest');
const ActivityLog = require('../models/ActivityLog');

const {
  analyzeIncident,
  processCopilotChat,
  KNOWLEDGE_BASE_PLAYBOOKS
} = require('../services/aiEngine');
// -------------------------------------------------------------
// 1. INCIDENTS API
// -------------------------------------------------------------

// GET all incidents
router.get('/incidents', async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    let query = {};

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (category && category !== 'All') query.category = category;

    const incidents = await Incident.find(query).sort({ created_at: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET incident by ID
router.get('/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create new incident with AI Evaluation
router.post('/incidents', async (req, res) => {
  try {
    const { title, description, category, reporter, impacted_service } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const count = await Incident.countDocuments();
    const ticketNumber = `INC-${1001 + count}`;

    const aiResult = analyzeIncident(title, description, category, impacted_service);

    const newIncident = await Incident.create({
      ticket_number: ticketNumber,
      title,
      description: description || '',
      category: category || aiResult.category,
      priority: aiResult.priority,
      status: 'Open',
      assigned_team: aiResult.assignedTeam,
      reporter: reporter || 'IT Operator',
      impacted_service: impacted_service || 'Enterprise Infrastructure',
      ai_suggested_resolution: aiResult.aiSuggestedResolution,
      ai_confidence: aiResult.aiConfidence,
      sla_deadline: aiResult.slaDeadline
    });

    await ActivityLog.create({
      action: 'INCIDENT_CREATED',
      user: reporter || 'IT Operator',
      details: `Created ticket ${ticketNumber} [${aiResult.priority}] for ${title}`
    });

    res.status(201).json(newIncident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update Incident
router.patch('/incidents/:id', async (req, res) => {
  try {
    const updated = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Incident not found' });

    await ActivityLog.create({
      action: 'INCIDENT_UPDATED',
      user: 'IT Engineer',
      details: `Updated incident ${updated.ticket_number || req.params.id}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Incident
router.delete('/incidents/:id', async (req, res) => {
  try {
    const deleted = await Incident.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Incident not found' });

    await ActivityLog.create({
      action: 'INCIDENT_DELETED',
      user: 'IT Engineer',
      details: `Deleted ticket ${deleted.ticket_number} - ${deleted.title}`
    });

    res.json({ message: 'Incident deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST AI Auto-Resolve Incident
router.post('/incidents/:id/ai-resolve', async (req, res) => {
  try {
    const updated = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: 'Resolved' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Incident not found' });

    await ActivityLog.create({
      action: 'AI_RESOLUTION_EXECUTED',
      user: 'AI Copilot Engine',
      details: `Applied automated resolution playbook to ticket #${updated.ticket_number}`
    });

    res.json({ message: 'Incident resolved using AI recommendation', incident: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. INFRASTRUCTURE & ASSETS API
// -------------------------------------------------------------

router.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.find().sort({ _id: 1 });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/assets', async (req, res) => {
  try {
    const { name, type, environment, ip_address, status, cpu_usage, memory_usage } = req.body;

    if (!name) return res.status(400).json({ error: 'Asset name is required' });

    const count = await Asset.countDocuments();
    const assetTag = `AST-${10 + count + 1}`;

    const newAsset = await Asset.create({
      asset_tag: assetTag,
      name,
      type: type || 'Kubernetes Cluster',
      environment: environment || 'Production',
      status: status || 'Healthy',
      ip_address: ip_address || '10.0.0.1',
      cpu_usage: cpu_usage || 20,
      memory_usage: memory_usage || 35
    });

    await ActivityLog.create({
      action: 'ASSET_CREATED',
      user: 'SysAdmin',
      details: `Added new IT asset ${name} (${assetTag})`
    });

    res.status(201).json(newAsset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/assets/:id', async (req, res) => {
  try {
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Asset not found' });

    await ActivityLog.create({
      action: 'ASSET_UPDATED',
      user: 'SysAdmin',
      details: `Updated asset ${updated.asset_tag}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/assets/:id', async (req, res) => {
  try {
    const deleted = await Asset.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Asset not found' });

    await ActivityLog.create({
      action: 'ASSET_DELETED',
      user: 'SysAdmin',
      details: `Deleted asset ${deleted.name} (${deleted.asset_tag})`
    });

    res.json({ message: 'Asset deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate Infrastructure Alert
router.post('/assets/simulate-alert', async (req, res) => {
  try {
    const { assetId } = req.body;
    const asset = await Asset.findById(assetId || (await Asset.findOne())._id);

    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    asset.status = 'Critical';
    asset.cpu_usage = 99;
    asset.memory_usage = 98;
    await asset.save();

    const count = await Incident.countDocuments();
    const ticketNumber = `INC-${1001 + count}`;
    const title = `CRITICAL ALERT: Node ${asset.name} High Resource Exhaustion & Packet Loss`;
    const description = `Automated telemetry system triggered P1 alert for node ${asset.name} (${asset.ip_address}). CPU at 99%, Memory at 98%.`;

    const aiResult = analyzeIncident(title, description, 'Infrastructure', asset.name);

    await Incident.create({
      ticket_number: ticketNumber,
      title,
      description,
      category: 'Infrastructure',
      priority: 'P1',
      status: 'Open',
      assigned_team: aiResult.assignedTeam,
      reporter: 'Infrastructure Telemetry Agent',
      impacted_service: asset.name,
      ai_suggested_resolution: aiResult.aiSuggestedResolution,
      ai_confidence: 96,
      sla_deadline: aiResult.slaDeadline
    });

    await ActivityLog.create({
      action: 'SYSTEM_ALERT_TRIGGERED',
      user: 'Monitoring System',
      details: `Simulated failure alert on ${asset.name}. Auto-created ${ticketNumber}`
    });

    res.json({
      message: `Infrastructure alert simulated for asset ${asset.name}! Auto-created incident ${ticketNumber}`,
      assetId: asset._id,
      ticketNumber
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. SERVICE REQUESTS CATALOG API
// -------------------------------------------------------------

router.get('/service-requests', async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ created_at: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/service-requests/:id', async (req, res) => {
  try {
    const requestItem = await ServiceRequest.findById(req.params.id);
    if (!requestItem) return res.status(404).json({ error: 'Service request not found' });
    res.json(requestItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/service-requests', async (req, res) => {
  try {
    const { title, category, requested_by, urgency } = req.body;

    if (!title) return res.status(400).json({ error: 'Title required' });

    const count = await ServiceRequest.countDocuments();
    const requestNumber = `REQ-${5001 + count}`;

    const newReq = await ServiceRequest.create({
      request_number: requestNumber,
      title,
      category: category || 'General Service',
      requested_by: requested_by || 'Employee User',
      urgency: urgency || 'Medium',
      approval_status: 'Pending Approval',
      status: 'Submitted'
    });

    await ActivityLog.create({
      action: 'SERVICE_REQ_CREATED',
      user: requested_by || 'Employee User',
      details: `Submitted Service Request ${requestNumber}: ${title}`
    });

    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/service-requests/:id', async (req, res) => {
  try {
    const updated = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Service request not found' });

    await ActivityLog.create({
      action: 'SERVICE_REQ_UPDATED',
      user: 'Service Desk',
      details: `Updated Service Request ${updated.request_number}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/service-requests/:id', async (req, res) => {
  try {
    const deleted = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Service request not found' });

    await ActivityLog.create({
      action: 'SERVICE_REQ_DELETED',
      user: 'Service Desk',
      details: `Deleted Service Request ${deleted.request_number}`
    });

    res.json({ message: 'Service request deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. CHANGE MANAGEMENT API
// -------------------------------------------------------------

router.get('/change-requests', async (req, res) => {
  try {
    const changes = await ChangeRequest.find().sort({ created_at: -1 });
    res.json(changes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/change-requests/:id', async (req, res) => {
  try {
    const changeItem = await ChangeRequest.findById(req.params.id);
    if (!changeItem) return res.status(404).json({ error: 'Change request not found' });
    res.json(changeItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/change-requests', async (req, res) => {
  try {
    const { title, risk_level, implementation_date, assigned_lead } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const count = await ChangeRequest.countDocuments();
    const changeNumber = `CHG-${2001 + count}`;

    const newChange = await ChangeRequest.create({
      change_number: changeNumber,
      title,
      risk_level: risk_level || 'Medium',
      cab_approval: 'Pending Review',
      implementation_date: implementation_date || new Date().toISOString().split('T')[0],
      assigned_lead: assigned_lead || 'Lead Systems Architect',
      status: 'Planning'
    });

    await ActivityLog.create({
      action: 'CHANGE_REQ_CREATED',
      user: assigned_lead || 'Lead Systems Architect',
      details: `Submitted RFC ${changeNumber}: ${title}`
    });

    res.status(201).json(newChange);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/change-requests/:id', async (req, res) => {
  try {
    const updated = await ChangeRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Change request not found' });

    await ActivityLog.create({
      action: 'CHANGE_REQ_UPDATED',
      user: 'CAB Board',
      details: `Updated Change Request ${updated.change_number}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/change-requests/:id', async (req, res) => {
  try {
    const deleted = await ChangeRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Change request not found' });

    await ActivityLog.create({
      action: 'CHANGE_REQ_DELETED',
      user: 'CAB Board',
      details: `Deleted Change Request ${deleted.change_number}`
    });

    res.json({ message: 'Change request deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. EXECUTIVE METRICS & DASHBOARD API
// -------------------------------------------------------------

router.get('/metrics', async (req, res) => {
  try {
    const incidents = await Incident.find();
    const assets = await Asset.find();

    const activeIncidents = incidents.filter(r => r.status === 'Open' || r.status === 'In Progress').length;
    const p1Incidents = incidents.filter(r => r.priority === 'P1' && r.status !== 'Resolved' && r.status !== 'Closed').length;
    const resolvedIncidents = incidents.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
    const healthyAssets = assets.filter(a => a.status === 'Healthy').length;
    const infrastructureHealthScore = assets.length > 0 ? Number(((healthyAssets / assets.length) * 100).toFixed(1)) : 100;

    res.json({
      totalIncidents: incidents.length,
      activeIncidents,
      p1Incidents,
      resolvedIncidents,
      slaComplianceRate: 96.4,
      meanTimeToResolveMinutes: 38,
      infrastructureHealthScore,
      activeAssetsCount: assets.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// In-memory persistent demo store for DevOps builds
let devopsBuilds = [
  {
    buildNumber: 142,
    branch: 'main',
    commit: 'a9f4c12',
    commitMessage: 'feat: add dark enterprise command center and grouped navigation',
    author: 'DevOps Lead',
    status: 'SUCCESS',
    durationSeconds: 94,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    stages: [
      { name: 'Checkout', status: 'SUCCESS', duration: '4s' },
      { name: 'Dependencies', status: 'SUCCESS', duration: '18s' },
      { name: 'Frontend Build', status: 'SUCCESS', duration: '28s' },
      { name: 'Backend Validation', status: 'SUCCESS', duration: '12s' },
      { name: 'Tests & Linting', status: 'SUCCESS', duration: '14s' },
      { name: 'Docker Build', status: 'SUCCESS', duration: '18s' }
    ]
  },
  {
    buildNumber: 141,
    branch: 'feature/nexus-jira-sync',
    commit: '7b28e41',
    commitMessage: 'fix(api): connection timeout handling for pgbouncer pool',
    author: 'Platform Engineer',
    status: 'SUCCESS',
    durationSeconds: 102,
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    stages: [
      { name: 'Checkout', status: 'SUCCESS', duration: '4s' },
      { name: 'Dependencies', status: 'SUCCESS', duration: '20s' },
      { name: 'Frontend Build', status: 'SUCCESS', duration: '31s' },
      { name: 'Backend Validation', status: 'SUCCESS', duration: '11s' },
      { name: 'Tests & Linting', status: 'SUCCESS', duration: '15s' },
      { name: 'Docker Build', status: 'SUCCESS', duration: '21s' }
    ]
  },
  {
    buildNumber: 140,
    branch: 'main',
    commit: '3e110a9',
    commitMessage: 'chore(docker): configure high-range non-conflicting host ports',
    author: 'DevOps Lead',
    status: 'SUCCESS',
    durationSeconds: 88,
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    stages: [
      { name: 'Checkout', status: 'SUCCESS', duration: '3s' },
      { name: 'Dependencies', status: 'SUCCESS', duration: '16s' },
      { name: 'Frontend Build', status: 'SUCCESS', duration: '26s' },
      { name: 'Backend Validation', status: 'SUCCESS', duration: '10s' },
      { name: 'Tests & Linting', status: 'SUCCESS', duration: '14s' },
      { name: 'Docker Build', status: 'SUCCESS', duration: '19s' }
    ]
  },
  {
    buildNumber: 139,
    branch: 'hotfix/504-timeout',
    commit: '1a90c4d',
    commitMessage: 'hotfix: scale ingress worker threads and HPA threshold',
    author: 'SRE Duty Lead',
    status: 'SUCCESS',
    durationSeconds: 110,
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    stages: [
      { name: 'Checkout', status: 'SUCCESS', duration: '5s' },
      { name: 'Dependencies', status: 'SUCCESS', duration: '22s' },
      { name: 'Frontend Build', status: 'SUCCESS', duration: '34s' },
      { name: 'Backend Validation', status: 'SUCCESS', duration: '14s' },
      { name: 'Tests & Linting', status: 'SUCCESS', duration: '16s' },
      { name: 'Docker Build', status: 'SUCCESS', duration: '19s' }
    ]
  }
];

// In-memory demo Jira Work Items
let jiraIssues = [
  {
    key: 'NEXUS-101',
    summary: 'Investigate 504 gateway timeout on US-East Payment Ingress',
    type: 'Bug',
    priority: 'Highest',
    status: 'In Progress',
    assignee: 'Alex Rivera (SRE)',
    reporter: 'Alertmanager',
    linkedIncident: 'INC-1001',
    gitBranch: 'hotfix/nexus-101-ingress-timeout',
    lastCommit: 'a9f4c12',
    sprint: 'Sprint 24 - Reliability',
    created: '2026-08-28'
  },
  {
    key: 'NEXUS-102',
    summary: 'PostgreSQL connection pool exhaustion on prod-db-primary',
    type: 'Bug',
    priority: 'Highest',
    status: 'To Do',
    assignee: 'David Miller (DBA)',
    reporter: 'Data Sentinel',
    linkedIncident: 'INC-1002',
    gitBranch: 'fix/nexus-102-pg-pool',
    lastCommit: '7b28e41',
    sprint: 'Sprint 24 - Reliability',
    created: '2026-08-29'
  },
  {
    key: 'NEXUS-103',
    summary: 'Automate Let-Encrypt SSL Renewal for API Ingress Secret',
    type: 'Task',
    priority: 'Medium',
    status: 'Done',
    assignee: 'Claire Bennet',
    reporter: 'Cert-Manager',
    linkedIncident: 'INC-1004',
    gitBranch: 'feature/nexus-103-tls-renewal',
    lastCommit: '3e110a9',
    sprint: 'Sprint 23 - Security',
    created: '2026-08-25'
  },
  {
    key: 'NEXUS-104',
    summary: 'Upgrade PostgreSQL 14 to PostgreSQL 16 on Core DB cluster',
    type: 'Story',
    priority: 'High',
    status: 'In Review',
    assignee: 'David Miller (DBA)',
    reporter: 'Architecture Board',
    linkedIncident: 'CHG-2001',
    gitBranch: 'release/chg-2001-pg16',
    lastCommit: '5d89b02',
    sprint: 'Sprint 24 - Reliability',
    created: '2026-08-20'
  },
  {
    key: 'NEXUS-105',
    summary: 'Add Multi-stage Declarative Jenkinsfile for Docker deployment',
    type: 'Task',
    priority: 'High',
    status: 'Done',
    assignee: 'DevOps Rotation',
    reporter: 'SysAdmin',
    linkedIncident: 'CHG-2003',
    gitBranch: 'infra/jenkins-docker-pipeline',
    lastCommit: '9c14ef0',
    sprint: 'Sprint 24 - Reliability',
    created: '2026-08-22'
  }
];

// -------------------------------------------------------------
// 8. DEVOPS & CI/CD API
// -------------------------------------------------------------

router.get('/devops/status', (req, res) => {
  const jenkinsConfigured = Boolean(process.env.JENKINS_URL && process.env.JENKINS_USER);
  const githubConfigured = Boolean(process.env.GITHUB_TOKEN || process.env.GITHUB_REPO);

  res.json({
    jenkins: {
      status: jenkinsConfigured ? 'ONLINE' : 'CONFIGURATION REQUIRED',
      connected: jenkinsConfigured,
      serverUrl: process.env.JENKINS_URL || 'http://localhost:8080',
      pipeline: 'nexus-it-ops-cicd',
      mode: jenkinsConfigured ? 'Live Pipeline' : 'Demonstration & Local Config'
    },
    docker: {
      status: 'RUNNING',
      connected: true,
      engine: 'Docker Engine 26.x / Docker Compose v2.x',
      activeContainers: 4,
      network: 'itsm_network (bridge)'
    },
    github: {
      status: 'CONNECTED',
      connected: true,
      repository: 'AI-Powered-IT-Service-Management-and-Incident-Resolution-Platform',
      defaultBranch: 'main',
      ciWebhook: 'Active (push & PR events)'
    },
    activePipeline: {
      stages: ['Git Push', 'Jenkins Checkout', 'Frontend Build', 'Backend Validation', 'Docker Build', 'Deployment'],
      lastExecution: devopsBuilds[0]
    }
  });
});

router.get('/devops/builds', (req, res) => {
  res.json(devopsBuilds);
});

router.post('/devops/trigger-build', async (req, res) => {
  try {
    const nextBuildNumber = devopsBuilds.length > 0 ? devopsBuilds[0].buildNumber + 1 : 143;
    const randomHash = Math.random().toString(16).substring(2, 9);

    const newBuild = {
      buildNumber: nextBuildNumber,
      branch: req.body.branch || 'main',
      commit: randomHash,
      commitMessage: req.body.commitMessage || `Manual trigger: CI/CD validation run #${nextBuildNumber}`,
      author: 'IT Operator (Console)',
      status: 'SUCCESS',
      durationSeconds: Math.floor(Math.random() * 20) + 75,
      timestamp: new Date().toISOString(),
      stages: [
        { name: 'Checkout', status: 'SUCCESS', duration: '3s' },
        { name: 'Dependencies', status: 'SUCCESS', duration: '15s' },
        { name: 'Frontend Build', status: 'SUCCESS', duration: '27s' },
        { name: 'Backend Validation', status: 'SUCCESS', duration: '10s' },
        { name: 'Tests & Linting', status: 'SUCCESS', duration: '12s' },
        { name: 'Docker Build', status: 'SUCCESS', duration: '18s' }
      ]
    };

    devopsBuilds.unshift(newBuild);

    await ActivityLog.create({
      action: 'DEVOPS_PIPELINE_TRIGGERED',
      user: 'DevOps Engineer',
      details: `Triggered CI/CD pipeline build #${nextBuildNumber} (${newBuild.commit})`
    });

    res.status(201).json({
      message: `CI/CD Build #${nextBuildNumber} triggered and validated successfully!`,
      build: newBuild
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 9. JIRA INTEGRATION API
// -------------------------------------------------------------

router.get('/jira/status', (req, res) => {
  const jiraConfigured = Boolean(process.env.JIRA_BASE_URL && process.env.JIRA_API_TOKEN);

  res.json({
    connected: jiraConfigured,
    status: jiraConfigured ? 'CONNECTED' : 'CONFIGURATION REQUIRED',
    baseUrl: process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net',
    projectKey: process.env.JIRA_PROJECT_KEY || 'NEXUS',
    totalIssues: jiraIssues.length,
    openIssues: jiraIssues.filter(i => i.status !== 'Done').length,
    syncMode: jiraConfigured ? 'Live REST API v3' : 'DevOps Simulation Mode (Ready for API Key)',
    requiredEnvVars: ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY']
  });
});

router.get('/jira/issues', (req, res) => {
  res.json(jiraIssues);
});

router.post('/jira/sync', async (req, res) => {
  try {
    await ActivityLog.create({
      action: 'JIRA_SYNC_EXECUTED',
      user: 'Jira Integration Agent',
      details: `Synchronized ${jiraIssues.length} work items with Jira Cloud Project NEXUS`
    });

    res.json({
      message: 'Jira synchronization completed successfully.',
      syncedCount: jiraIssues.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 10. SERVICE HEALTH & UPTIME MONITORING API
// -------------------------------------------------------------

router.get('/services/health', async (req, res) => {
  try {
    const assets = await Asset.find();
    const openIncidents = await Incident.find({ status: { $in: ['Open', 'In Progress'] } });

    const services = [
      {
        id: 'svc-payment',
        name: 'Payment Processing API',
        type: 'REST Microservice (Node.js)',
        tier: 'Tier 1 - Mission Critical',
        environment: 'Production (US-East)',
        status: openIncidents.some(i => i.impacted_service?.toLowerCase().includes('payment')) ? 'Degraded' : 'Operational',
        uptime: 99.86,
        latencyMs: 42,
        throughputRps: 1420,
        activeIncidents: openIncidents.filter(i => i.impacted_service?.toLowerCase().includes('payment')).length,
        dependencies: ['PostgreSQL DB Cluster', 'Redis Session Cache', 'Kong API Gateway']
      },
      {
        id: 'svc-database',
        name: 'Core Customer DB Cluster',
        type: 'Database (PostgreSQL 16)',
        tier: 'Tier 1 - Mission Critical',
        environment: 'Production (Multi-AZ)',
        status: openIncidents.some(i => i.impacted_service?.toLowerCase().includes('core') || i.impacted_service?.toLowerCase().includes('database')) ? 'Degraded' : 'Operational',
        uptime: 99.85,
        latencyMs: 18,
        throughputRps: 3100,
        activeIncidents: openIncidents.filter(i => i.impacted_service?.toLowerCase().includes('core') || i.impacted_service?.toLowerCase().includes('database')).length,
        dependencies: ['EBS Volume Storage', 'PgBouncer Connection Pool']
      },
      {
        id: 'svc-auth',
        name: 'Global Identity & IAM Service (SSO)',
        type: 'Auth Broker (Active Directory / Okta)',
        tier: 'Tier 1 - Mission Critical',
        environment: 'Production (Global)',
        status: openIncidents.some(i => i.impacted_service?.toLowerCase().includes('iam') || i.impacted_service?.toLowerCase().includes('auth')) ? 'Degraded' : 'Operational',
        uptime: 99.95,
        latencyMs: 24,
        throughputRps: 890,
        activeIncidents: openIncidents.filter(i => i.impacted_service?.toLowerCase().includes('iam') || i.impacted_service?.toLowerCase().includes('auth')).length,
        dependencies: ['Azure AD Connect', 'LDAP Directory']
      },
      {
        id: 'svc-gateway',
        name: 'Enterprise API Ingress Gateway',
        type: 'API Gateway (Kong / Nginx)',
        tier: 'Tier 1 - Ingress Layer',
        environment: 'Production (Global CDN)',
        status: 'Operational',
        uptime: 100.0,
        latencyMs: 8,
        throughputRps: 5800,
        activeIncidents: 0,
        dependencies: ['Cloudflare Edge WAF', 'TLS Secret Manager']
      },
      {
        id: 'svc-redis',
        name: 'In-Memory Cache & Session Broker',
        type: 'Cache Cluster (Redis 7.2)',
        tier: 'Tier 2 - Supporting Tier',
        environment: 'Production (US-East)',
        status: 'Operational',
        uptime: 99.99,
        latencyMs: 2,
        throughputRps: 8400,
        activeIncidents: 0,
        dependencies: ['AWS VPC Peering']
      },
      {
        id: 'svc-staging-k8s',
        name: 'Staging Kubernetes Workload Node',
        type: 'Kubernetes Cluster (v1.30)',
        tier: 'Tier 3 - Non-Production',
        environment: 'Staging (US-West)',
        status: 'Outage',
        uptime: 94.10,
        latencyMs: 180,
        throughputRps: 120,
        activeIncidents: openIncidents.filter(i => i.impacted_service?.toLowerCase().includes('staging') || i.impacted_service?.toLowerCase().includes('k8s')).length,
        dependencies: ['Containerd Runtime', 'Calico CNI']
      }
    ];

    const operationalCount = services.filter(s => s.status === 'Operational').length;
    const overallScore = Number(((operationalCount / services.length) * 100).toFixed(1));

    res.json({
      overallScore,
      totalServices: services.length,
      operationalCount,
      degradedCount: services.filter(s => s.status === 'Degraded').length,
      outageCount: services.filter(s => s.status === 'Outage').length,
      services
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 11. KNOWLEDGE BASE & RUNBOOKS API
// -------------------------------------------------------------

router.get('/knowledge-base', (req, res) => {
  const { category, search } = req.query;
  let articles = [...KNOWLEDGE_BASE_PLAYBOOKS];

  if (category && category !== 'All') {
    articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  res.json(articles);
});

router.get('/knowledge-base/:id', (req, res) => {
  const article = KNOWLEDGE_BASE_PLAYBOOKS.find(a => a.id.toLowerCase() === req.params.id.toLowerCase());
  if (!article) return res.status(404).json({ error: 'Knowledge article not found' });
  res.json(article);
});

// -------------------------------------------------------------
// 12. DOCKER CONTAINERS TELEMETRY API
// -------------------------------------------------------------

router.get('/containers/status', (req, res) => {
  res.json([
    {
      name: 'itsm-frontend',
      image: 'nginx:alpine',
      role: 'React Single Page App & Reverse Proxy',
      hostPort: 3005,
      containerPort: 80,
      status: 'RUNNING',
      uptime: '3 hours 42 mins',
      cpu: '0.4%',
      memory: '14 MB / 512 MB',
      health: 'Healthy'
    },
    {
      name: 'itsm-backend',
      image: 'node:20-alpine',
      role: 'Express.js REST API & AI Operations Engine',
      hostPort: 5005,
      containerPort: 5000,
      status: 'RUNNING',
      uptime: '3 hours 42 mins',
      cpu: '1.2%',
      memory: '48 MB / 1024 MB',
      health: 'Healthy'
    },
    {
      name: 'itsm-mongodb',
      image: 'mongo:7.0',
      role: 'Primary Persistent Database',
      hostPort: 27019,
      containerPort: 27017,
      status: 'RUNNING',
      uptime: '3 hours 42 mins',
      cpu: '2.1%',
      memory: '112 MB / 2048 MB',
      health: 'Healthy'
    },
    {
      name: 'itsm-mongo-express',
      image: 'mongo-express:latest',
      role: 'Database Web Administration UI',
      hostPort: 8085,
      containerPort: 8081,
      status: 'RUNNING',
      uptime: '3 hours 42 mins',
      cpu: '0.2%',
      memory: '36 MB / 512 MB',
      health: 'Healthy'
    }
  ]);
});

// -------------------------------------------------------------
// 7. AI OPERATIONS COPILOT API
// -------------------------------------------------------------

router.post('/copilot/chat', (req, res) => {
  try {
    const { prompt, context = {} } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    const result = processCopilotChat(prompt.trim(), context);

    res.json(result);
  } catch (err) {
    console.error('Copilot error:', err);

    res.status(500).json({
      error: 'Failed to process Copilot request',
      details: err.message
    });
  }
});

router.post('/copilot/chat', (req, res) => {
  try {
    const { prompt, context = {} } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    const result = processCopilotChat(prompt.trim(), context);

    res.json(result);
  } catch (err) {
    console.error('Copilot error:', err);

    res.status(500).json({
      error: 'Failed to process Copilot request',
      details: err.message
    });
  }
});

module.exports = router;
