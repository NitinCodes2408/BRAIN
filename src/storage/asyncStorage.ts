/**
 * Type-Safe Async Storage Layer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig, AlertThresholds } from '../models/settings.types';

const STORAGE_KEYS = {
  APP_CONFIG: '@battery_intel:app_config',
  ALERT_THRESHOLDS: '@battery_intel:alert_thresholds',
  SAVED_SESSIONS: '@battery_intel:saved_sessions',
} as const;

export const defaultAlertThresholds: AlertThresholds = {
  maxCellVoltage: 4.25,
  minCellVoltage: 2.90,
  maxDeltaVoltage: 0.050, // 50 mV
  maxPackTemp: 50.0, // 50 °C
  minPackTemp: -5.0, // -5 °C
  maxChargeCurrent: 120.0,
  maxDischargeCurrent: 200.0,
  minSohWarning: 80.0,
  thermalRunawayWarningThreshold: 0.70,
};

export const defaultAppConfig: AppConfig = {
  dataSourceType: 'json_stream',
  selectedDataset: 'sample_bms_telemetry.json',
  streamingSpeedMs: 1500,
  temperatureUnit: 'C',
  speedUnit: 'km/h',
  autoLogHistory: true,
  maxHistoryLogs: 100,
  modelFileName: 'battery_intelligence_model.pkl',
  modelRuntimeEndpoint: 'https://api.battery-intel.local/v1/predict',
  enableAutomatedPredictions: true,
};

export const loadAppConfig = async (): Promise<AppConfig> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_CONFIG);
    if (raw) {
      return { ...defaultAppConfig, ...JSON.parse(raw) };
    }
  } catch (error) {
    console.warn('Error loading app config from storage:', error);
  }
  return defaultAppConfig;
};

export const saveAppConfig = async (config: AppConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving app config:', error);
  }
};

export const loadAlertThresholds = async (): Promise<AlertThresholds> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALERT_THRESHOLDS);
    if (raw) {
      return { ...defaultAlertThresholds, ...JSON.parse(raw) };
    }
  } catch (error) {
    console.warn('Error loading alert thresholds from storage:', error);
  }
  return defaultAlertThresholds;
};

export const saveAlertThresholds = async (thresholds: AlertThresholds): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ALERT_THRESHOLDS, JSON.stringify(thresholds));
  } catch (error) {
    console.error('Error saving alert thresholds:', error);
  }
};
