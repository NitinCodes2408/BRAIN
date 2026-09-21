/**
 * Application and BMS Safety Threshold Settings
 */

import { DataSourceType } from './datasource.types';

export interface AlertThresholds {
  maxCellVoltage: number; // e.g. 4.25 V
  minCellVoltage: number; // e.g. 2.80 V
  maxDeltaVoltage: number; // e.g. 0.050 V (50mV)
  maxPackTemp: number; // e.g. 55 °C
  minPackTemp: number; // e.g. -10 °C
  maxChargeCurrent: number; // e.g. 150 A
  maxDischargeCurrent: number; // e.g. 250 A
  minSohWarning: number; // e.g. 75 %
  thermalRunawayWarningThreshold: number; // e.g. 0.65
}

export interface AppConfig {
  dataSourceType: DataSourceType;
  selectedDataset: string; // 'sample_bms_telemetry.json' | 'high_stress_bms_telemetry.json'
  streamingSpeedMs: number; // 1000ms default
  temperatureUnit: 'C' | 'F';
  speedUnit: 'km/h' | 'mph';
  autoLogHistory: boolean;
  maxHistoryLogs: number;
  
  // ML Model Configuration
  modelFileName: string; // 'battery_health_model.pkl'
  modelRuntimeEndpoint: string; // URL for external ML inference or local bridge
  enableAutomatedPredictions: boolean;
}
