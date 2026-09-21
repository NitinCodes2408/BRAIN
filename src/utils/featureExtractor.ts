/**
 * Feature Engineering Pipeline for Machine Learning Inference
 * Converts raw BMS Telemetry frames into normalized numerical feature vectors
 * matching the input tensor layout specified by the trained .pkl model manifest.
 */

import { BMSTelemetry } from '../models/bms.types';
import { PredictionInputFeatures } from '../models/prediction.types';
import { calculateThermalStats } from './bmsCalculations';

export const extractModelFeatures = (telemetry: BMSTelemetry): PredictionInputFeatures => {
  const thermalStats = calculateThermalStats(telemetry.temperatures);
  const powerKw = (telemetry.packVoltage * telemetry.packCurrent) / 1000;

  // Ordered vector matching model_manifest.json input layout:
  // [
  //   pack_voltage_v,
  //   pack_current_a,
  //   soc_percent,
  //   soh_percent,
  //   avg_cell_voltage_v,
  //   min_cell_voltage_v,
  //   max_cell_voltage_v,
  //   delta_cell_voltage_v,
  //   avg_temp_c,
  //   max_temp_c,
  //   temp_variance,
  //   cycle_count,
  //   insulation_resistance_kohm
  // ]
  const rawFeatureVector: number[] = [
    Number(telemetry.packVoltage.toFixed(3)),
    Number(telemetry.packCurrent.toFixed(2)),
    Number(telemetry.soc.toFixed(2)),
    Number(telemetry.soh.toFixed(2)),
    Number(telemetry.avgCellVoltage.toFixed(4)),
    Number(telemetry.minCellVoltage.voltage.toFixed(4)),
    Number(telemetry.maxCellVoltage.voltage.toFixed(4)),
    Number(telemetry.deltaCellVoltage.toFixed(4)),
    Number(telemetry.avgTemperature.toFixed(2)),
    Number(telemetry.maxTemperature.toFixed(2)),
    Number(thermalStats.variance.toFixed(4)),
    Number(telemetry.cycleCount),
    Number(telemetry.insulationResistance),
  ];

  return {
    timestamp: telemetry.timestamp,
    packVoltage: telemetry.packVoltage,
    packCurrent: telemetry.packCurrent,
    soc: telemetry.soc,
    soh: telemetry.soh,
    deltaCellVoltage: telemetry.deltaCellVoltage,
    avgCellVoltage: telemetry.avgCellVoltage,
    maxTemperature: telemetry.maxTemperature,
    minTemperature: telemetry.minTemperature,
    avgTemperature: telemetry.avgTemperature,
    cycleCount: telemetry.cycleCount,
    insulationResistance: telemetry.insulationResistance,
    powerKw,
    temperatureVariance: thermalStats.variance,
    rawFeatureVector,
  };
};
