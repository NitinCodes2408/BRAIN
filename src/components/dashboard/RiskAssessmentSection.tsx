import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { StandardBatteryTelemetry } from '../../services/batteryDataService';

interface RiskAssessmentSectionProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ telemetry }) => {
  const isAvailable = telemetry !== null && telemetry.voltage !== null;

  // Real physical safety threshold risk classification
  let riskLevel: 'normal' | 'watch' | 'warning' | 'critical' = 'normal';
  let riskDetail = 'All physical battery telemetry metrics within nominal envelope.';

  if (isAvailable) {
    const temp = telemetry.temperature ?? 25;
    const maxTemp = telemetry.maxTemperature ?? temp;
    const deltaV = telemetry.deltaCellVoltage ?? 0.01;

    if (maxTemp > 55 || deltaV > 0.15) {
      riskLevel = 'critical';
      riskDetail = 'Thermal/Voltage limit exceeded. Pack requires immediate safety cutoff.';
    } else if (maxTemp > 45 || deltaV > 0.08) {
      riskLevel = 'warning';
      riskDetail = 'Elevated cell imbalance or temperature observed. Active balancing recommended.';
    } else if (maxTemp > 38 || deltaV > 0.04) {
      riskLevel = 'watch';
      riskDetail = 'Slight thermal gradient detected during continuous load.';
    } else {
      riskLevel = 'normal';
      riskDetail = 'Nominal electrochemical and thermal operating profile.';
    }
  }

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <ShieldAlert size={20} color="#FFB800" />
          <div>
            <h3 className="panel-title">Risk Assessment</h3>
            <p className="panel-subtitle">Deterministic safety envelope & limits</p>
          </div>
        </div>
      </div>

      {!isAvailable ? (
        <div className="empty-state-banner">
          <AlertTriangle size={28} color="#64748B" />
          <p>Risk assessment unavailable</p>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Waiting for battery telemetry / model</span>
        </div>
      ) : (
        <div>
          {/* 4 Risk Badges */}
          <div className="risk-matrix">
            <div className={`risk-level-badge ${riskLevel === 'normal' ? 'active normal' : ''}`}>
              NORMAL
            </div>
            <div className={`risk-level-badge ${riskLevel === 'watch' ? 'active watch' : ''}`}>
              WATCH
            </div>
            <div className={`risk-level-badge ${riskLevel === 'warning' ? 'active warning' : ''}`}>
              WARNING
            </div>
            <div className={`risk-level-badge ${riskLevel === 'critical' ? 'active critical' : ''}`}>
              CRITICAL
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '12px', lineHeight: 1.4 }}>
            {riskDetail}
          </p>

          <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(7, 17, 28, 0.5)', borderRadius: '8px', border: '1px solid var(--card-border)', fontSize: '0.7rem', color: '#64748B' }}>
            <span>Architecture Note: Real-time risk derived from hardware BMS bounds. ML / PINN inference pipeline decoupled.</span>
          </div>
        </div>
      )}
    </div>
  );
};
