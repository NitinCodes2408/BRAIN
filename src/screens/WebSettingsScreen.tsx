import React, { useState } from 'react';
import { Settings, Shield, Sliders, HardDrive, Download } from 'lucide-react';
import { batteryDataService } from '../services/batteryDataService';

export const WebSettingsScreen: React.FC = () => {
  const [intervalMs, setIntervalMs] = useState(1000);
  const [autoLog, setAutoLog] = useState(true);
  const [overvoltageLimit, setOvervoltageLimit] = useState(67.2);
  const [undervoltageLimit, setUndervoltageLimit] = useState(44.0);
  const [tempMaxLimit, setTempMaxLimit] = useState(50.0);
  const [maxDeltaV, setMaxDeltaV] = useState(50);

  const handleIntervalChange = (val: number) => {
    setIntervalMs(val);
    batteryDataService.startStreaming(val);
  };

  const handleExportJson = () => {
    const data = batteryDataService.getCurrentTelemetry();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain_telemetry_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="page-container">
      {/* Safety Thresholds */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <Shield size={20} color="#00E676" />
            <div>
              <h3 className="panel-title">BMS Safety Threshold Envelopes</h3>
              <p className="panel-subtitle">Hardware protection trigger levels</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="system-status-row">
            <span className="system-status-label">Overvoltage Cutoff (V_max)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00D9FF' }}>{overvoltageLimit} V</span>
          </div>

          <div className="system-status-row">
            <span className="system-status-label">Undervoltage Cutoff (V_min)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FFB800' }}>{undervoltageLimit} V</span>
          </div>

          <div className="system-status-row">
            <span className="system-status-label">High Thermal Alarm (T_max)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FF3B30' }}>{tempMaxLimit} °C</span>
          </div>

          <div className="system-status-row">
            <span className="system-status-label">Cell Imbalance Limit (Delta V)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00E676' }}>{maxDeltaV} mV</span>
          </div>
        </div>
      </div>

      {/* Telemetry Stream Settings */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <Sliders size={20} color="#00D9FF" />
            <div>
              <h3 className="panel-title">Telemetry Ingestion Frequency</h3>
              <p className="panel-subtitle">Adjust stream polling rate</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#F8FAFC' }}>Stream Refresh Rate: {intervalMs}ms</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[250, 500, 1000, 2000].map((rate) => (
                <button
                  key={rate}
                  className={`control-btn ${intervalMs === rate ? 'primary' : ''}`}
                  onClick={() => handleIntervalChange(rate)}
                >
                  {rate}ms
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>Export Telemetry Snapshot</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Download active frame in standardized JSON format</div>
            </div>
            <button className="control-btn primary" onClick={handleExportJson}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
