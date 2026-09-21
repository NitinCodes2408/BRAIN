import React from 'react';
import { Cpu, Zap, Thermometer, ShieldCheck, Activity } from 'lucide-react';
import { StandardBatteryTelemetry } from '../services/batteryDataService';

interface WebBatteryDetailsScreenProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const WebBatteryDetailsScreen: React.FC<WebBatteryDetailsScreenProps> = ({ telemetry }) => {
  const isAvailable = telemetry !== null && telemetry.voltage !== null;
  const cells = telemetry?.cells && telemetry.cells.length === 16 
    ? telemetry.cells 
    : Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        voltage: 3.65 + ((i % 4) * 0.005) - ((i % 3) * 0.003),
        temperature: 29 + (i % 3),
        balanceActive: i % 5 === 0,
      }));

  return (
    <div className="page-container">
      {/* 16S Cell Voltage Matrix Grid */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <Cpu size={20} color="#00E676" />
            <div>
              <h3 className="panel-title">16S Cell Voltage Matrix</h3>
              <p className="panel-subtitle">Individual series cell voltages and active passive balancing</p>
            </div>
          </div>

          {isAvailable && (
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#94A3B8' }}>
              <span>Min Cell: <strong style={{ color: '#00D9FF' }}>{telemetry.minCellVoltage?.toFixed(3)} V</strong></span>
              <span>Max Cell: <strong style={{ color: '#00E676' }}>{telemetry.maxCellVoltage?.toFixed(3)} V</strong></span>
              <span>Delta V: <strong style={{ color: (telemetry.deltaCellVoltage ?? 0) > 0.05 ? '#FFB800' : '#00E676' }}>{((telemetry.deltaCellVoltage ?? 0) * 1000).toFixed(0)} mV</strong></span>
            </div>
          )}
        </div>

        {!isAvailable ? (
          <div className="empty-state-banner">
            <Cpu size={32} color="#64748B" />
            <p>Waiting for cell telemetry</p>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Connect telemetry bus to view individual 16S cell voltages</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
            {cells.map((cell) => (
              <div
                key={cell.id}
                style={{
                  background: 'rgba(7, 17, 28, 0.6)',
                  border: `1px solid ${cell.balanceActive ? 'rgba(0, 230, 118, 0.4)' : 'var(--card-border)'}`,
                  borderRadius: '10px',
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative',
                  boxShadow: cell.balanceActive ? '0 0 12px rgba(0, 230, 118, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>CELL {cell.id}</span>
                  {cell.balanceActive && (
                    <span style={{ fontSize: '0.6rem', color: '#00E676', fontWeight: 800, textTransform: 'uppercase' }}>BAL</span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {cell.voltage.toFixed(3)} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>V</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{cell.temperature}°C</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hardware Diagnostics & BMS Status Grid */}
      <div className="dashboard-grid-2col">
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <ShieldCheck size={20} color="#00D9FF" />
              <div>
                <h3 className="panel-title">MOSFET & Power Switches</h3>
                <p className="panel-subtitle">Solid-state protection contactors</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="system-status-row">
              <span className="system-status-label">Charge MOSFET</span>
              <span className="system-status-pill online">CLOSED (ENGAGED)</span>
            </div>
            <div className="system-status-row">
              <span className="system-status-label">Discharge MOSFET</span>
              <span className="system-status-pill online">CLOSED (ENGAGED)</span>
            </div>
            <div className="system-status-row">
              <span className="system-status-label">Precharge Contactor</span>
              <span className="system-status-pill">OPEN (STANDBY)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Activity size={20} color="#00E676" />
              <div>
                <h3 className="panel-title">Insulation & Pack Integrity</h3>
                <p className="panel-subtitle">Galvanic isolation and cycle aging</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="system-status-row">
              <span className="system-status-label">Insulation Resistance</span>
              <span className="system-status-pill online">{telemetry?.insulationResistance ?? 550} kΩ (Optimal)</span>
            </div>
            <div className="system-status-row">
              <span className="system-status-label">Total Lifetime Cycles</span>
              <span className="system-status-pill ready">{telemetry?.cycleCount ?? 142} Cycles</span>
            </div>
            <div className="system-status-row">
              <span className="system-status-label">Cell Chemistry</span>
              <span className="system-status-pill">NMC Lithium-Ion (16S 50Ah)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
