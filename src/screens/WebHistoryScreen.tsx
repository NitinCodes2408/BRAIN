import React, { useState, useEffect } from 'react';
import { Activity, Trash2, Database, Clock } from 'lucide-react';
import { StandardBatteryTelemetry } from '../services/batteryDataService';

interface WebHistoryScreenProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const WebHistoryScreen: React.FC<WebHistoryScreenProps> = ({ telemetry }) => {
  const [logs, setLogs] = useState<StandardBatteryTelemetry[]>([]);

  useEffect(() => {
    if (telemetry && telemetry.voltage !== null) {
      setLogs((prev) => [telemetry, ...prev.slice(0, 49)]);
    }
  }, [telemetry?.timestamp, telemetry?.voltage]);

  return (
    <div className="page-container">
      {/* Telemetry Buffer Summary */}
      <div className="controls-bar">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>RECORDED FRAMES</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
              {logs.length} Packets
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--card-border)' }} />
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>RING BUFFER</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00D9FF', fontFamily: 'var(--font-mono)' }}>
              50 Frames Capacity
            </div>
          </div>
        </div>

        <button
          className="control-btn"
          onClick={() => setLogs([])}
          style={{ color: '#FF3B30', borderColor: 'rgba(255, 59, 48, 0.3)' }}
        >
          <Trash2 size={14} />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Chronological Logs List */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <Clock size={20} color="#00D9FF" />
            <div>
              <h3 className="panel-title">Chronological Telemetry Packet Log</h3>
              <p className="panel-subtitle">Time-series history of incoming BMS CAN/JSON frames</p>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="empty-state-banner">
            <Activity size={32} color="#64748B" />
            <p>No telemetry frames logged</p>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Start or step the telemetry stream to record packets</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 1fr 1fr 1fr 1fr',
                  padding: '10px 16px',
                  background: 'rgba(7, 17, 28, 0.5)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{ color: '#64748B' }}>
                  {typeof log.timestamp === 'string' && log.timestamp.includes('T')
                    ? log.timestamp.split('T')[1].slice(0, 8)
                    : `#${logs.length - index}`}
                </span>
                <span>V: <strong style={{ color: '#00D9FF' }}>{log.voltage?.toFixed(2)}V</strong></span>
                <span>I: <strong style={{ color: '#F8FAFC' }}>{log.current?.toFixed(2)}A</strong></span>
                <span>T: <strong style={{ color: '#FFB800' }}>{log.temperature?.toFixed(1)}°C</strong></span>
                <span>SOC: <strong style={{ color: '#00E676' }}>{Math.round(log.soc ?? 0)}%</strong></span>
                <span style={{ color: '#94A3B8' }}>{log.batteryStatus ?? 'Normal'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
