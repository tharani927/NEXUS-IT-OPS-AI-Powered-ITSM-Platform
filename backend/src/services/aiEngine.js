/**
 * NEXUS IT OPS - AI-Powered IT Operations & Incident Resolution Engine
 */

const KNOWLEDGE_BASE_PLAYBOOKS = [
  {
    id: 'KB-001',
    title: 'PostgreSQL Connection Pool & Lock Contention Troubleshooting',
    keywords: ['database', 'postgres', 'postgresql', 'mysql', 'sql', 'connection pool', 'deadlock', 'query timeout', 'max_connections', 'lock'],
    category: 'Database',
    team: 'Database Administrators',
    resolution: `1. Check active backend connections: Run 'SELECT * FROM pg_stat_activity WHERE state = "active";'\n2. Identify slow-running queries and cancel hanging process PIDs using 'pg_cancel_backend(pid)'.\n3. Increase max pool size or restart PgBouncer pooler service.\n4. Scale DB read-replica load balancing if query traffic persists high.`,
    rootCause: 'Database connection pool exhaustion caused by unindexed query lock escalation.',
    author: 'DBA Platform Team',
    updatedAt: '2026-08-20',
    tags: ['PostgreSQL', 'PgBouncer', 'Deadlocks', 'Performance']
  },
  {
    id: 'KB-002',
    title: 'Kubernetes Ingress Controller 504 Gateway Timeout Mitigation',
    keywords: ['latency', 'timeout', '504', '502', 'gateway', 'payment', 'api', 'ingress', 'http', 'traffic surge'],
    category: 'Infrastructure',
    team: 'DevOps & Site Reliability',
    resolution: `1. Scale Kubernetes pod deployment horizontally (kubectl scale deployment --replicas=15).\n2. Check upstream microservice health status & latency metrics in APM dashboard.\n3. Temporarily enable cloud edge cache rate limiting for non-essential traffic.\n4. Flush socket connections and clear cache node buffers.`,
    rootCause: 'Ingress traffic surge exceeding container memory boundaries and thread pool limit.',
    author: 'SRE Core Team',
    updatedAt: '2026-08-22',
    tags: ['Kubernetes', 'Ingress', '504 Gateway', 'Auto-scaling']
  },
  {
    id: 'KB-003',
    title: 'Active Directory / LDAP Synchronization & SSO Authentication Failure',
    keywords: ['auth', 'sso', 'active directory', 'ldap', 'vpn', 'login', 'permission', 'certificate', 'jwt', 'iam', 'kerberos'],
    category: 'Security & Identity',
    team: 'SecOps & IAM Team',
    resolution: `1. Verify LDAP/Active Directory domain controller synchronization status.\n2. Inspect Kerberos authentication ticket expiration timestamps.\n3. Refresh OAuth2 client secrets and API gateway authorization tokens.\n4. Check internal VPN security group ingress whitelist rules.`,
    rootCause: 'Domain controller SSL certificate handshake mismatch during automated credential validation.',
    author: 'SecOps Team',
    updatedAt: '2026-08-24',
    tags: ['Active Directory', 'LDAP', 'SSO', 'Certificates']
  },
  {
    id: 'KB-004',
    title: 'Linux Node High Memory Leak & Disk Exhaustion Remediation',
    keywords: ['cpu', 'memory', 'disk', 'out of memory', 'oom', 'storage', 'node', 'server', 'restart', 'disk space'],
    category: 'Infrastructure',
    team: 'Cloud Platform Ops',
    resolution: `1. Identify top memory consuming process using 'top' or 'htop'.\n2. Purge system log files in '/var/log' and container temp caches.\n3. Auto-expand cloud EBS volume storage capacity by +50GB.\n4. Gracefully restart node daemon services to release memory leaks.`,
    rootCause: 'Unrestricted log growth leading to local disk space exhaustion and kernel OOM kill.',
    author: 'Cloud Ops Team',
    updatedAt: '2026-08-25',
    tags: ['Linux', 'OOM', 'Disk Storage', 'Memory Leak']
  },
  {
    id: 'KB-005',
    title: 'BGP Routing Flap & VPC Network Packet Loss Recovery',
    keywords: ['network', 'dns', 'packet loss', 'firewall', 'traceroute', 'subnet', 'bgp', 'router', 'gateway', 'vpc'],
    category: 'Network Operations',
    team: 'Network Operations Center (NOC)',
    resolution: `1. Check DNS resolution status across internal and public nameservers (dig/nslookup).\n2. Inspect cloud VPC security group ingress/egress filtering rules.\n3. Failover BGP primary network interface to secondary backup ISP link.\n4. Verify core switch packet loss statistics and interface duplex modes.`,
    rootCause: 'BGP routing loop at primary cloud provider transit gateway.',
    author: 'NOC Network Team',
    updatedAt: '2026-08-26',
    tags: ['Network', 'BGP', 'DNS', 'Firewall']
  },
  {
    id: 'KB-006',
    title: 'Docker Daemon Container CrashLoopBackOff Resolution',
    keywords: ['docker', 'container', 'crashloop', 'crashloopbackoff', 'containerd', 'compose', 'image'],
    category: 'DevOps & Containers',
    team: 'DevOps & Site Reliability',
    resolution: `1. Inspect container exit codes via 'docker logs <container-id>' or 'kubectl logs'.\n2. Check for missing environment variables or volume mount permission issues.\n3. Prune dangling Docker images and build caches using 'docker system prune -f'.\n4. Rebuild container image with updated dependencies and restart service.`,
    rootCause: 'Fatal startup exception caused by missing database connection environment variable.',
    author: 'DevOps Team',
    updatedAt: '2026-08-28',
    tags: ['Docker', 'Containers', 'CrashLoop', 'Debugging']
  }
];

function analyzeIncident(title, description = '', category = '', impactedService = '') {
  const combinedText = `${title} ${description} ${category} ${impactedService}`.toLowerCase();

  // 1. Determine Priority
  let priority = 'P3';
  let confidence = 85;

  const isCriticalKeywords = ['down', 'outage', 'crash', '504', '500', 'payment', 'production', 'core db', 'master', 'security breach'];
  const isHighKeywords = ['latency', 'slow', 'timeout', 'warning', 'degraded', 'failover', 'vpn', 'auth'];

  const criticalMatches = isCriticalKeywords.filter(kw => combinedText.includes(kw));
  const highMatches = isHighKeywords.filter(kw => combinedText.includes(kw));

  if (criticalMatches.length > 0 || (impactedService.toLowerCase().includes('payment') || impactedService.toLowerCase().includes('core'))) {
    priority = 'P1';
    confidence = 94 + Math.min(criticalMatches.length * 2, 5);
  } else if (highMatches.length > 0) {
    priority = 'P2';
    confidence = 88 + Math.min(highMatches.length * 2, 6);
  } else if (combinedText.includes('low') || combinedText.includes('minor') || combinedText.includes('request')) {
    priority = 'P4';
    confidence = 82;
  }

  // 2. Playbook Matching
  let matchedPlaybook = KNOWLEDGE_BASE_PLAYBOOKS.find(pb =>
    pb.keywords.some(kw => combinedText.includes(kw))
  );

  if (!matchedPlaybook) {
    matchedPlaybook = {
      category: category || 'IT Operations',
      team: 'Tier-1 IT Service Desk',
      resolution: `1. Gather full system diagnostic logs and trace IDs.\n2. Verify impact scope across user groups.\n3. Escalate ticket to Tier-2 engineering duty manager if unresolved within 30 minutes.`,
      rootCause: 'Underlying component failure requiring log inspection.'
    };
  }

  // 3. SLA Deadline calculation
  const now = new Date();
  let hoursToAdd = 12;
  if (priority === 'P1') hoursToAdd = 1;
  else if (priority === 'P2') hoursToAdd = 4;
  else if (priority === 'P3') hoursToAdd = 12;
  else if (priority === 'P4') hoursToAdd = 48;

  const slaDeadline = new Date(now.getTime() + hoursToAdd * 3600 * 1000).toISOString();

  return {
    priority,
    category: matchedPlaybook.category,
    assignedTeam: matchedPlaybook.team,
    aiSuggestedResolution: matchedPlaybook.resolution,
    rootCauseHypothesis: matchedPlaybook.rootCause,
    aiConfidence: Math.min(confidence, 99),
    slaDeadline
  };
}

function processCopilotChat(prompt, context = {}) {
  const query = prompt.toLowerCase();

  if (query.includes('p1') || query.includes('critical') || query.includes('outage')) {
    return {
      response: `🚨 **P1 Critical Incident Resolution Guidance**:
For active P1 Critical Outages:
1. **Declare Incident Command Bridge**: Notify Duty Incident Commander and SRE on-call.
2. **Isolate Impacted Services**: Verify Payment Gateway, Core DB, and API Ingress health.
3. **Review Release Logs**: Check recent deployments in the last 4 hours (e.g., CHG-2001).
4. **Automated Rollback**: If outage coincides with a recent Git push / Docker release, trigger rollback pipeline.`,
      suggestedActions: ['Trigger Incident Command Bridge', 'Inspect APM Telemetry', 'Draft P1 Post-Mortem', 'Check Recent CI/CD Builds']
    };
  }

  if (query.includes('post-mortem') || query.includes('postmortem') || query.includes('summary')) {
    return {
      response: `📋 **AI Incident Post-Mortem Template**:
- **Incident ID**: INC-1001
- **Severity**: P1 - Critical
- **Total Downtime**: 24 minutes
- **Impacted Service**: Payment Processing API (US-East)
- **Root Cause**: Ingress gateway thread pool exhaustion during unexpected peak traffic.
- **Resolution Applied**: Scaled Kubernetes replicas from 8 to 20; refreshed Redis connection pool.
- **Preventative Action**: Configured HPA (Horizontal Pod Autoscaler) target CPU threshold at 70%.`,
      suggestedActions: ['Export Post-Mortem Report', 'Create Linked Problem Ticket', 'Schedule CAB Review']
    };
  }

  if (query.includes('database') || query.includes('postgres') || query.includes('sql') || query.includes('lock')) {
    return {
      response: `🗄️ **Database Diagnostics & Resolution (KB-001)**:
1. Query active locks: \`SELECT pid, query, state, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE state != 'idle';\`
2. Terminate blocker: \`SELECT pg_terminate_backend(<pid>);\`
3. Check memory & connection pool allocation on primary database node **AST-DB-02**.
4. Scale DB read-replicas if connection count exceeds 80% threshold.`,
      suggestedActions: ['View DB Health Metrics', 'View Knowledge Article KB-001', 'Analyze Query Locks']
    };
  }

  if (query.includes('devops') || query.includes('pipeline') || query.includes('jenkins') || query.includes('build') || query.includes('cicd')) {
    return {
      response: `🚀 **DevOps & CI/CD Pipeline Automation**:
- **Pipeline Stages**: Git Push ➔ Jenkins Checkout ➔ Frontend Build ➔ Backend Validation ➔ Docker Build ➔ Deployment.
- **Active Stack**: Node.js + Express API + React SPA + MongoDB 7.0 + Nginx Reverse Proxy.
- **Jenkins Integration**: Declarative \`Jenkinsfile\` configured with automated linting, test validation, and container image generation.`,
      suggestedActions: ['View DevOps & Releases', 'Inspect Docker Containers', 'Trigger Validation Build']
    };
  }

  if (query.includes('jira') || query.includes('work item') || query.includes('sprint')) {
    return {
      response: `📌 **Jira Work Item & ITSM Integration**:
The platform connects Jira work items directly with the DevOps release pipeline:
- **Jira Issue** (e.g. \`NEXUS-104\`) ➔ **Git Branch** (\`feature/nexus-104\`) ➔ **GitHub Commit** ➔ **Jenkins Build** ➔ **Docker Deployment** ➔ **Incident Resolution**.
- Configure your Jira API token in \`.env\` (\`JIRA_BASE_URL\`, \`JIRA_API_TOKEN\`) to enable two-way sync.`,
      suggestedActions: ['Open Jira Work Items', 'Sync Jira Issues', 'View Deployment Traceability']
    };
  }

  if (query.includes('kb') || query.includes('runbook') || query.includes('knowledge')) {
    return {
      response: `📚 **ITSM Knowledge Base Index**:
Available verified runbooks:
- **KB-001**: PostgreSQL Connection Pool & Lock Contention
- **KB-002**: Kubernetes Ingress Controller 504 Gateway Timeout
- **KB-003**: Active Directory / LDAP Synchronization & SSO
- **KB-004**: Linux Node High Memory Leak & Disk Exhaustion
- **KB-005**: BGP Routing Flap & VPC Network Packet Loss
- **KB-006**: Docker Daemon Container CrashLoopBackOff Resolution`,
      suggestedActions: ['Search Knowledge Base', 'Open KB-001', 'Open KB-002']
    };
  }

  return {
    response: `🤖 **NEXUS AI Operations Assistant**:
I analyzed your inquiry: "${prompt}".
Based on current real-time ITSM & DevOps telemetry:
- **System Health**: 99.8% operational availability across monitored assets.
- **Incident Queue**: Active triage monitoring with automated SLA countdowns.
- **DevOps Status**: CI/CD pipeline and Docker container telemetry ready.
- **Recommendation**: Check open P1/P2 tickets and review scheduled RFC changes.`,
    suggestedActions: ['View Open Incidents', 'Check Infrastructure Health', 'Search Knowledge Base', 'View DevOps Releases']
  };
}

module.exports = {
  KNOWLEDGE_BASE_PLAYBOOKS,
  analyzeIncident,
  processCopilotChat
};
