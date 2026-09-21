import React from 'react';
import { Bell, ChevronDown, Radio, Activity } from 'lucide-react';
import { ConnectionState } from '../../services/batteryDataService';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  connectionState: ConnectionState;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, connectionState }) => {
  return (
    <header className="brain-header">
      <div className="header-title-group">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Live Telemetry Status Pill */}
        <div className={`header-status-pill ${connectionState === 'streaming' ? 'streaming' : ''}`}>
          <div className={`status-pulse-dot ${connectionState === 'streaming' ? '' : 'warning'}`} style={{ width: 7, height: 7 }} />
          <span>{connectionState.toUpperCase()}</span>
        </div>

        {/* Notifications */}
        <button className="header-icon-btn" title="System Notifications">
          <Bell size={18} />
          <span className="notification-badge" />
        </button>

        {/* Operator User Profile */}
        <div className="user-profile-menu">
          <div className="user-avatar">EV</div>
          <span className="user-name">BMS Specialist</span>
          <ChevronDown size={14} color="#94A3B8" />
        </div>
      </div>
    </header>
  );
};
