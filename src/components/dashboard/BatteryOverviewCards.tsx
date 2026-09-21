import React from 'react';
import { Zap, Gauge, Thermometer, BatteryCharging, HeartPulse, Cpu } from 'lucide-react';
import { StandardBatteryTelemetry } from '../../services/batteryDataService';

interface BatteryOverviewCardsProps {
  telemetry: StandardBatteryTelemetry | null;
}

export const BatteryOverviewCards: React.FC<BatteryOverviewCardsProps> = ({ telemetry }) => {
  const isAvailable = telemetry !== null && telemetry.voltage !== null;

  const getVoltageStatus = () => {
    if (!isAvailable) return 'Waiting for telemetry';
    const v = telemetry.voltage!;
    if (v > 67.2) return 'Overvoltage';
    if (v < 44.0) return 'Undervoltage';
    return 'Optimal Range';
  };

  const getCurrentStatus = () => {
    if (!isAvailable) return 'Waiting for telemetry';
    const i = telemetry.current!;
    if (i > 0) return 'Charging Active';
    if (i < 0) return 'Discharging Active';
    return 'Standby';
  };

  const getTempStatus = () => {
    if (!isAvailable) return 'Waiting for telemetry';
    const t = telemetry.temperature!;
    if (t > 45) return 'Elevated Temp';
    if (t < 5) return 'Cold Ambient';
    return 'Thermal Nominal';
  };

  const getSocStatus = () => {
    if (!isAvailable) return 'Waiting for telemetry';
    return `${telemetry.estimatedRangeKm ?? '--'} km Est. Range`;
  };

  const getSohStatus = () => {
    if (!isAvailable) return 'Waiting for telemetry';
    return (telemetry.soh ?? 100) > 90 ? 'Grade A Pack' : 'Degraded Capacity';
  };

  const getCrateStatus = () => {
    if (!isAvailable) return 'Waiting for telemetry';
    return (telemetry.cRate ?? 0) > 1.0 ? 'High C-Rate' : 'Continuous Duty';
  };

  const metrics = [
    {
      label: 'Voltage',
      value: isAvailable ? telemetry.voltage?.toFixed(2) : '--',
      unit: 'V',
      status: getVoltageStatus(),
      icon: <Zap size={16} />,
      isGood: isAvailable && (telemetry.voltage! >= 44 && telemetry.voltage! <= 67.2),
      highlight: 'cyan',
    },
    {
      label: 'Current',
      value: isAvailable ? telemetry.current?.toFixed(2) : '--',
      unit: 'A',
      status: getCurrentStatus(),
      icon: <Gauge size={16} />,
      isGood: isAvailable,
      highlight: 'default',
    },
    {
      label: 'Temperature',
      value: isAvailable ? telemetry.temperature?.toFixed(1) : '--',
      unit: '°C',
      status: getTempStatus(),
      icon: <Thermometer size={16} />,
      isGood: isAvailable && telemetry.temperature! < 45,
      highlight: isAvailable && telemetry.temperature! > 45 ? 'warning' : 'default',
    },
    {
      label: 'SOC',
      value: isAvailable ? Math.round(telemetry.soc ?? 0) : '--',
      unit: '%',
      status: getSocStatus(),
      icon: <BatteryCharging size={16} />,
      isGood: isAvailable && (telemetry.soc ?? 0) > 20,
      highlight: 'green',
    },
    {
      label: 'SOH',
      value: isAvailable ? (telemetry.soh ?? 0).toFixed(1) : '--',
      unit: '%',
      status: getSohStatus(),
      icon: <HeartPulse size={16} />,
      isGood: isAvailable && (telemetry.soh ?? 0) > 80,
      highlight: 'green',
    },
    {
      label: 'C-rate',
      value: isAvailable ? (telemetry.cRate ?? 0).toFixed(2) : '--',
      unit: 'C',
      status: getCrateStatus(),
      icon: <Cpu size={16} />,
      isGood: isAvailable && (telemetry.cRate ?? 0) <= 1.5,
      highlight: 'cyan',
    },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((m, idx) => (
        <div key={idx} className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">{m.label}</span>
            <div className="metric-icon-box">{m.icon}</div>
          </div>

          <div className="metric-value-row">
            <span
              className={`metric-value ${
                m.highlight === 'green'
                  ? 'highlight-green'
                  : m.highlight === 'cyan'
                  ? 'highlight-cyan'
                  : ''
              }`}
            >
              {m.value}
            </span>
            {isAvailable && <span className="metric-unit">{m.unit}</span>}
          </div>

          <div className={`metric-status ${isAvailable ? (m.isGood ? 'good' : 'warning') : ''}`}>
            <span>{m.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
