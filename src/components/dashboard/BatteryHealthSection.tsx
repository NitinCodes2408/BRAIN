import React from 'react';
import { ShieldCheck, Battery, Zap } from 'lucide-react';
import { StandardBatteryTelemetry } from '../../services/batteryDataService';

interface BatteryHealthSectionProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const BatteryHealthSection: React.FC<BatteryHealthSectionProps> = ({ telemetry }) => {
  const isAvailable = telemetry !== null && telemetry.soc !== null;
  const soc = telemetry?.soc ?? 0;
  const soh = telemetry?.soh ?? 0;

  // SVG Circular Gauge calculations
  const radius = 58;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const socOffset = circumference - (soc / 100) * circumference;
  const sohOffset = circumference - (soh / 100) * circumference;

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <ShieldCheck size={20} color="#00E676" />
          <div>
            <h3 className="panel-title">Battery Health</h3>
            <p className="panel-subtitle">Physics-calibrated state of charge & health capacity</p>
          </div>
        </div>

        {isAvailable && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 230, 118, 0.12)',
              color: '#00E676',
              border: '1px solid rgba(0, 230, 118, 0.3)',
            }}
          >
            {telemetry.batteryStatus ?? 'Normal Operating State'}
          </span>
        )}
      </div>

      <div className="gauges-container">
        {/* SOC Gauge */}
        <div className="gauge-item">
          <div className="gauge-circle-wrapper">
            <svg width="150" height="150" viewBox="0 0 150 150">
              {/* Background Track */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth={strokeWidth}
              />
              {/* Active Progress Arc */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="#00E676"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={isAvailable ? socOffset : circumference}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.4))',
                }}
              />
            </svg>
            <div className="gauge-center-content">
              <span className="gauge-number" style={{ color: '#00E676' }}>
                {isAvailable ? Math.round(soc) : '--'}
              </span>
              <span className="gauge-unit">PERCENT</span>
            </div>
          </div>
          <div className="gauge-title">State of Charge (SOC)</div>
          <div className="gauge-subtext">
            {isAvailable ? `${telemetry?.estimatedRangeKm ?? 0} km estimated range` : 'Waiting for telemetry'}
          </div>
        </div>

        {/* SOH Gauge */}
        <div className="gauge-item">
          <div className="gauge-circle-wrapper">
            <svg width="150" height="150" viewBox="0 0 150 150">
              {/* Background Track */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth={strokeWidth}
              />
              {/* Active Progress Arc */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="#00D9FF"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={isAvailable ? sohOffset : circumference}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.4))',
                }}
              />
            </svg>
            <div className="gauge-center-content">
              <span className="gauge-number" style={{ color: '#00D9FF' }}>
                {isAvailable ? soh.toFixed(1) : '--'}
              </span>
              <span className="gauge-unit">PERCENT</span>
            </div>
          </div>
          <div className="gauge-title">State of Health (SOH)</div>
          <div className="gauge-subtext">
            {isAvailable ? `${telemetry?.cycleCount ?? 0} total charge cycles` : 'Waiting for telemetry'}
          </div>
        </div>
      </div>
    </div>
  );
};
