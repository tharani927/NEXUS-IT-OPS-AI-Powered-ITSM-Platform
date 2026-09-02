import React from 'react';
import { ShieldCheck, User, AlertTriangle, Bell } from 'lucide-react';

export default function Navbar({ activeIncidentsCount = 0 }) {
  return (
    <header className="nexus-navbar">
      {/* Brand Title */}
      <div className="navbar-brand">
        <div className="navbar-title">
          <h1>NEXUS IT OPS Command Center</h1>
          <p>AI-Powered IT Service Management & DevOps Platform</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-controls">
        {activeIncidentsCount > 0 ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px'
          }}>
            <AlertTriangle size={14} />
            <span>{activeIncidentsCount} Active Incident{activeIncidentsCount > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="status-indicator">
            <span className="status-dot-pulse"></span>
            <ShieldCheck size={14} />
            <span>All Systems Normal</span>
          </div>
        )}

        {/* User Profile */}
        <div className="user-profile-badge">
          <div className="user-avatar-circle">
            <User size={14} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F8FAFC' }}>
            IT Ops Lead
          </span>
        </div>
      </div>
    </header>
  );
}
