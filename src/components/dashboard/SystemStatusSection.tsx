import React from 'react';
import { Server, Wifi, Cpu, Layers } from 'lucide-react';
import { TelemetryServiceStatus } from '../../services/batteryDataService';

interface SystemStatusSectionProps {
  status: TelemetryServiceStatus;
}

export const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({ status }) => {
  const isStreaming = status.state === 'streaming';
  const isConnected = status.state === 'connected' || isStreaming;

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Server size={20} color="#00D9FF" />
          <div>
            <h3 className="panel-title">System Status</h3>
            <p className="panel-subtitle">Subsystem runtime & pipeline connectivity</p>
          </div>
        </div>
      </div>

      <div className="system-status-list">
        {/* Data Connection */}
        <div className="system-status-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={15} color={isConnected ? '#00E676' : '#64748B'} />
            <span className="system-status-label">Data Connection</span>
          </div>
          <span className={`system-status-pill ${isConnected ? 'online' : ''}`}>
            {isStreaming ? `Streaming (${status.samplingIntervalMs}ms)` : isConnected ? 'Standby' : 'Waiting'}
          </span>
        </div>

        {/* Model Status */}
        <div className="system-status-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={15} color="#00D9FF" />
            <span className="system-status-label">Model Status</span>
          </div>
          <span className="system-status-pill ready">
            Ready (.pkl Pipeline)
          </span>
        </div>

        {/* PINN Status */}
        <div className="system-status-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={15} color="#64748B" />
            <span className="system-status-label">PINN Status</span>
          </div>
          <span className="system-status-pill">
            Not Connected
          </span>
        </div>

        {/* System Status */}
        <div className="system-status-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="status-pulse-dot" style={{ width: 8, height: 8 }} />
            <span className="system-status-label">System Status</span>
          </div>
          <span className="system-status-pill online">
            Online
          </span>
        </div>
      </div>
    </div>
  );
};
