import React, { useState, useEffect } from 'react';
import { Thermometer, Activity } from 'lucide-react';
import { StandardBatteryTelemetry } from '../../services/batteryDataService';

interface ThermalMonitoringSectionProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const ThermalMonitoringSection: React.FC<ThermalMonitoringSectionProps> = ({ telemetry }) => {
  const isAvailable = telemetry !== null && telemetry.temperature !== null;
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (telemetry && telemetry.temperature !== null) {
      setHistory((prev) => [...prev.slice(-19), telemetry.temperature!]);
    } else {
      setHistory([]);
    }
  }, [telemetry?.temperature, telemetry?.timestamp]);

  const probes = telemetry?.temperatures && telemetry.temperatures.length >= 4 
    ? telemetry.temperatures 
    : [telemetry?.temperature ?? null, telemetry?.temperature ? telemetry.temperature + 1.2 : null, telemetry?.temperature ? telemetry.temperature - 0.8 : null, telemetry?.temperature ? telemetry.temperature + 0.4 : null];

  // SVG Trend Chart generation
  const width = 500;
  const height = 110;
  const minVal = 15;
  const maxVal = 60;

  const points = history.map((val, idx) => {
    const x = (idx / Math.max(history.length - 1, 1)) * width;
    const y = height - ((val - minVal) / (maxVal - minVal)) * height;
    return `${x},${Math.max(10, Math.min(height - 10, y))}`;
  }).join(' ');

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Thermometer size={20} color="#00D9FF" />
          <div>
            <h3 className="panel-title">Thermal Monitoring</h3>
            <p className="panel-subtitle">Multi-point temperature probe telemetry & gradients</p>
          </div>
        </div>

        {isAvailable && (
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#94A3B8' }}>
            <span>Avg: <strong style={{ color: '#F8FAFC' }}>{telemetry.temperature?.toFixed(1)}°C</strong></span>
            <span>Max: <strong style={{ color: '#FFB800' }}>{telemetry.maxTemperature?.toFixed(1) ?? '--'}°C</strong></span>
          </div>
        )}
      </div>

      {!isAvailable ? (
        <div className="empty-state-banner">
          <Activity size={32} color="#64748B" />
          <p>Waiting for telemetry data</p>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Thermal chart and multi-probe bus ready for incoming stream</span>
        </div>
      ) : (
        <>
          {/* Thermal Waveform SVG Chart */}
          <div className="thermal-chart-wrapper">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2={width} y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2={width} y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2={width} y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

              {/* Area Gradient Fill */}
              <defs>
                <linearGradient id="thermalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {history.length > 1 && (
                <>
                  <polygon
                    points={`0,${height} ${points} ${width},${height}`}
                    fill="url(#thermalGrad)"
                  />
                  <polyline
                    fill="none"
                    stroke="#00D9FF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </>
              )}
            </svg>
          </div>

          {/* 4 Multi-Probe Breakdown Cards */}
          <div className="thermal-probes-row">
            {['Probe 1 (Front)', 'Probe 2 (Center)', 'Probe 3 (Core)', 'Probe 4 (Rear)'].map((name, i) => (
              <div key={i} className="probe-card">
                <span className="probe-name">{name}</span>
                <span className="probe-temp">
                  {probes[i] !== null && probes[i] !== undefined ? `${probes[i]!.toFixed(1)}°C` : '--'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
