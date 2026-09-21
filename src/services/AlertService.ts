/**
 * Safety & Alert Evaluation Service
 * Evaluates BMS telemetry against safety thresholds to identify critical faults and warnings.
 */

import { BMSTelemetry, BmsFault } from '../models/bms.types';
import { AlertThresholds } from '../models/settings.types';

export class AlertService {
  public static evaluateAlerts(
    telemetry: BMSTelemetry,
    thresholds: AlertThresholds
  ): BmsFault[] {
    const alerts: BmsFault[] = [];
    const now = telemetry.timestamp || Date.now();

    // 1. Check Delta Cell Voltage
    if (telemetry.deltaCellVoltage > thresholds.maxDeltaVoltage) {
      const deltaMv = (telemetry.deltaCellVoltage * 1000).toFixed(0);
      const maxMv = (thresholds.maxDeltaVoltage * 1000).toFixed(0);
      alerts.push({
        id: `alert-delta-v-${now}`,
        code: 'WARN_CELL_IMBALANCE',
        severity: telemetry.deltaCellVoltage > thresholds.maxDeltaVoltage * 1.8 ? 'critical' : 'warning',
        title: 'Cell Voltage Imbalance',
        message: `Cell voltage delta is ${deltaMv} mV (exceeds threshold of ${maxMv} mV). Check cell ${telemetry.minCellVoltage.cellId} & ${telemetry.maxCellVoltage.cellId}.`,
        timestamp: now,
      });
    }

    // 2. Check Over-temperature
    if (telemetry.maxTemperature > thresholds.maxPackTemp) {
      alerts.push({
        id: `alert-temp-high-${now}`,
        code: 'CRIT_OVER_TEMPERATURE',
        severity: 'critical',
        title: 'High Pack Temperature',
        message: `Peak temperature is ${telemetry.maxTemperature.toFixed(1)}°C (limit: ${thresholds.maxPackTemp}°C). Thermal throttling recommended.`,
        timestamp: now,
      });
    } else if (telemetry.maxTemperature > thresholds.maxPackTemp - 5) {
      alerts.push({
        id: `alert-temp-warn-${now}`,
        code: 'WARN_ELEVATED_TEMP',
        severity: 'warning',
        title: 'Elevated Temperature',
        message: `Pack temperature approaching maximum threshold (${telemetry.maxTemperature.toFixed(1)}°C).`,
        timestamp: now,
      });
    }

    // 3. Check Cell Over-voltage / Under-voltage
    if (telemetry.maxCellVoltage.voltage > thresholds.maxCellVoltage) {
      alerts.push({
        id: `alert-cell-ov-${now}`,
        code: 'CRIT_CELL_OVERVOLTAGE',
        severity: 'critical',
        title: 'Cell Over-voltage',
        message: `Cell #${telemetry.maxCellVoltage.cellId} at ${telemetry.maxCellVoltage.voltage.toFixed(3)}V exceeds limit of ${thresholds.maxCellVoltage.toFixed(3)}V.`,
        timestamp: now,
      });
    }

    if (telemetry.minCellVoltage.voltage < thresholds.minCellVoltage) {
      alerts.push({
        id: `alert-cell-uv-${now}`,
        code: 'CRIT_CELL_UNDERVOLTAGE',
        severity: 'critical',
        title: 'Cell Under-voltage',
        message: `Cell #${telemetry.minCellVoltage.cellId} at ${telemetry.minCellVoltage.voltage.toFixed(3)}V is below cutoff of ${thresholds.minCellVoltage.toFixed(3)}V.`,
        timestamp: now,
      });
    }

    // 4. Check State of Health Warning
    if (telemetry.soh < thresholds.minSohWarning) {
      alerts.push({
        id: `alert-soh-${now}`,
        code: 'WARN_DEGRADED_SOH',
        severity: 'warning',
        title: 'Battery Degradation Warning',
        message: `Pack State of Health has degraded to ${telemetry.soh.toFixed(1)}% (warning threshold: ${thresholds.minSohWarning}%).`,
        timestamp: now,
      });
    }

    // 5. Check Insulation Resistance
    if (telemetry.insulationResistance > 0 && telemetry.insulationResistance < 500) {
      alerts.push({
        id: `alert-insulation-${now}`,
        code: 'CRIT_INSULATION_LOW',
        severity: 'critical',
        title: 'Low Insulation Resistance',
        message: `Insulation resistance dropped to ${telemetry.insulationResistance} kΩ. Check high voltage isolation.`,
        timestamp: now,
      });
    }

    return alerts;
  }
}
