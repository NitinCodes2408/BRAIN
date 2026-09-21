/**
 * BMS Diagnostic Calculations and Statistical Helpers
 */

import { CellVoltage, ThermalProbe } from '../models/bms.types';
import { AlertThresholds } from '../models/settings.types';

export const calculateCellStats = (cells: CellVoltage[]) => {
  if (!cells || cells.length === 0) {
    return { min: 0, max: 0, avg: 0, delta: 0, minCellId: 0, maxCellId: 0 };
  }

  let min = cells[0].voltage;
  let max = cells[0].voltage;
  let sum = 0;
  let minCellId = cells[0].id;
  let maxCellId = cells[0].id;

  for (const cell of cells) {
    sum += cell.voltage;
    if (cell.voltage < min) {
      min = cell.voltage;
      minCellId = cell.id;
    }
    if (cell.voltage > max) {
      max = cell.voltage;
      maxCellId = cell.id;
    }
  }

  const avg = sum / cells.length;
  const delta = max - min;

  return { min, max, avg, delta, minCellId, maxCellId };
};

export const calculateThermalStats = (probes: ThermalProbe[]) => {
  if (!probes || probes.length === 0) {
    return { min: 0, max: 0, avg: 0, variance: 0 };
  }

  let min = probes[0].temperature;
  let max = probes[0].temperature;
  let sum = 0;

  for (const p of probes) {
    sum += p.temperature;
    if (p.temperature < min) min = p.temperature;
    if (p.temperature > max) max = p.temperature;
  }

  const avg = sum / probes.length;

  // Variance
  let sumSquaredDiff = 0;
  for (const p of probes) {
    sumSquaredDiff += Math.pow(p.temperature - avg, 2);
  }
  const variance = sumSquaredDiff / probes.length;

  return { min, max, avg, variance };
};

export const evaluateCellHealth = (
  voltage: number,
  thresholds: AlertThresholds
): 'normal' | 'low' | 'high' | 'critical' => {
  if (voltage > thresholds.maxCellVoltage + 0.05 || voltage < thresholds.minCellVoltage - 0.1) {
    return 'critical';
  }
  if (voltage > thresholds.maxCellVoltage) {
    return 'high';
  }
  if (voltage < thresholds.minCellVoltage) {
    return 'low';
  }
  return 'normal';
};

export const calculateHealthStatus = (
  soh: number,
  deltaV: number,
  maxTemp: number
): { status: 'OPTIMAL' | 'GOOD' | 'WARNING' | 'CRITICAL'; color: string } => {
  if (deltaV > 0.100 || maxTemp > 55 || soh < 70) {
    return { status: 'CRITICAL', color: '#FF3B30' };
  }
  if (deltaV > 0.040 || maxTemp > 45 || soh < 80) {
    return { status: 'WARNING', color: '#FFB800' };
  }
  if (soh >= 92 && deltaV <= 0.025 && maxTemp <= 38) {
    return { status: 'OPTIMAL', color: '#00F5D4' };
  }
  return { status: 'GOOD', color: '#10B981' };
};
