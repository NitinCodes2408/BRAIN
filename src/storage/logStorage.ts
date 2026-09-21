/**
 * Telemetry Log Storage & Session History Persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BMSTelemetry } from '../models/bms.types';
import { PredictionResult } from '../models/prediction.types';

export interface TelemetryLogEntry {
  id: string;
  timestamp: number;
  telemetry: BMSTelemetry;
  prediction?: PredictionResult;
}

const STORAGE_KEY_LOGS = '@battery_intel:telemetry_logs';
const MAX_LOG_COUNT = 150;

export const appendTelemetryLog = async (
  telemetry: BMSTelemetry,
  prediction?: PredictionResult
): Promise<TelemetryLogEntry> => {
  const newEntry: TelemetryLogEntry = {
    id: `log-${telemetry.timestamp}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: telemetry.timestamp,
    telemetry,
    prediction,
  };

  try {
    const existing = await getTelemetryLogs();
    const updated = [newEntry, ...existing].slice(0, MAX_LOG_COUNT);
    await AsyncStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to append telemetry log:', err);
  }

  return newEntry;
};

export const getTelemetryLogs = async (): Promise<TelemetryLogEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read telemetry logs:', err);
  }
  return [];
};

export const clearTelemetryLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_LOGS);
  } catch (err) {
    console.error('Failed to clear telemetry logs:', err);
  }
};
