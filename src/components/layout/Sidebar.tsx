import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  BrainCircuit, 
  Activity, 
  Settings as SettingsIcon,
  Zap,
  Radio
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'details' | 'prediction' | 'history' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isStreaming: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, isStreaming }) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'details', label: 'Battery Details', icon: <Cpu size={19} /> },
    { id: 'prediction', label: 'Prediction', icon: <BrainCircuit size={19} /> },
    { id: 'history', label: 'History', icon: <Activity size={19} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={19} /> },
  ];

  return (
    <aside className="brain-sidebar">
      <div>
        {/* Brand Identity */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Zap size={22} />
          </div>
          <div className="brand-info">
            <h1>BRAIN</h1>
            <p>Battery Intelligence</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* System Online / Health Status Footer */}
      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <div className={`status-pulse-dot ${isStreaming ? '' : 'warning'}`} />
          <div className="system-status-text">
            <div className="status-title">
              System Online
            </div>
            <div className="status-sub">
              {isStreaming ? 'All systems operational' : 'Telemetry bus standby'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
