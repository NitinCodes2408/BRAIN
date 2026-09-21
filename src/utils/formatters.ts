/**
 * Unit and Telemetry Formatting Utilities
 */

export const formatVoltage = (voltage: number, precision: number = 2): string => {
  if (isNaN(voltage)) return '-- V';
  return `${voltage.toFixed(precision)} V`;
};

export const formatMillivolts = (volts: number): string => {
  if (isNaN(volts)) return '-- mV';
  return `${(volts * 1000).toFixed(0)} mV`;
};

export const formatCurrent = (current: number, precision: number = 1): string => {
  if (isNaN(current)) return '-- A';
  const sign = current > 0 ? '+' : '';
  return `${sign}${current.toFixed(precision)} A`;
};

export const formatPower = (powerKw: number, precision: number = 2): string => {
  if (isNaN(powerKw)) return '-- kW';
  const sign = powerKw > 0 ? '+' : '';
  return `${sign}${powerKw.toFixed(precision)} kW`;
};

export const formatPercent = (val: number, precision: number = 1): string => {
  if (isNaN(val)) return '--%';
  return `${val.toFixed(precision)}%`;
};

export const formatTemperature = (celsius: number, unit: 'C' | 'F' = 'C'): string => {
  if (isNaN(celsius)) return '--°';
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
};

export const formatResistance = (kOhm: number): string => {
  if (isNaN(kOhm)) return '-- kΩ';
  if (kOhm >= 1000) {
    return `${(kOhm / 1000).toFixed(2)} MΩ`;
  }
  return `${kOhm.toFixed(0)} kΩ`;
};

export const formatTimestamp = (ts: number): string => {
  if (!ts) return '--:--:--';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatRelativeTime = (ts: number): string => {
  if (!ts) return '--';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
};
