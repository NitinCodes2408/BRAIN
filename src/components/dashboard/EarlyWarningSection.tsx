import React from 'react';
import { BellRing, CheckCircle, AlertOctagon } from 'lucide-react';
import { StandardBatteryTelemetry } from '../../services/batteryDataService';

interface EarlyWarningSectionProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const EarlyWarningSection: React.FC<EarlyWarningSectionProps> = ({ telemetry }) => {
  const isAvailable = telemetry !== null && telemetry.voltage !== null;

  // Real warning inspection
  const activeWarnings: Array<{ title: string; desc: string; type: 'danger' | 'caution' }> = [];

  if (isAvailable) {
    if ((telemetry.temperature ?? 0) > 45) {
      activeWarnings.push({
        title: 'Temperature Rise Alert',
        desc: `Average pack temperature reached ${telemetry.temperature?.toFixed(1)}°C exceeding 45°C limit.`,
        type: 'danger',
      });
    }
    if (Math.abs(telemetry.current ?? 0) > 40) {
      activeWarnings.push({
        title: 'High Current Warning',
        desc: `Pack current of ${telemetry.current?.toFixed(1)}A approaching continuous rating.`,
        type: 'caution',
      });
    }
    if ((telemetry.deltaCellVoltage ?? 0) > 0.05) {
      activeWarnings.push({
        title: 'Abnormal Voltage Imbalance',
        desc: `Cell delta voltage of ${((telemetry.deltaCellVoltage ?? 0) * 1000).toFixed(0)}mV exceeds 50mV threshold.`,
        type: 'caution',
      });
    }
    if (telemetry.faults && telemetry.faults.length > 0) {
      telemetry.faults.forEach((fault) => {
        activeWarnings.push({
          title: 'BMS Hardware Alarm',
          desc: fault,
          type: 'danger',
        });
      });
    }
  }

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <BellRing size={20} color="#00E676" />
          <div>
            <h3 className="panel-title">Early Warning</h3>
            <p className="panel-subtitle">Proactive fault prevention & alert bus</p>
          </div>
        </div>

        {isAvailable && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: activeWarnings.length > 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 230, 118, 0.12)',
              color: activeWarnings.length > 0 ? '#FF3B30' : '#00E676',
              border: `1px solid ${activeWarnings.length > 0 ? 'rgba(255, 59, 48, 0.3)' : 'rgba(0, 230, 118, 0.3)'}`,
            }}
          >
            {activeWarnings.length > 0 ? `${activeWarnings.length} Active` : '0 Warnings'}
          </span>
        )}
      </div>

      {!isAvailable ? (
        <div className="empty-state-banner">
          <CheckCircle size={28} color="#64748B" />
          <p>No active telemetry warnings</p>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Early warning bus awaiting stream ingestion</span>
        </div>
      ) : activeWarnings.length === 0 ? (
        <div className="empty-state-banner" style={{ padding: '24px 16px' }}>
          <CheckCircle size={28} color="#00E676" />
          <p style={{ color: '#F8FAFC', fontWeight: 600 }}>No active warnings</p>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>All 16 cells and thermal probes operating within normal tolerances</span>
        </div>
      ) : (
        <div>
          {activeWarnings.map((w, idx) => (
            <div key={idx} className={`warning-item ${w.type === 'caution' ? 'caution' : ''}`}>
              <AlertOctagon size={18} color={w.type === 'caution' ? '#FFB800' : '#FF3B30'} />
              <div>
                <div className="warning-title">{w.title}</div>
                <div className="warning-desc">{w.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
