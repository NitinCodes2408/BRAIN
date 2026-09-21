/**
 * Data Source Contracts for Telemetry Ingestion
 * Allows seamlessly switching between JSON file playback, streaming, and future BLE
 * without altering UI or state management layers.
 */

import { BMSTelemetry } from './bms.types';

export type DataSourceType = 'json_file' | 'json_stream' | 'ble' | 'simulation';

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'paused'
  | 'error';

export interface DataSourceStatus {
  type: DataSourceType;
  state: ConnectionState;
  sourceName: string;
  lastPacketTime?: number;
  packetsReceived: number;
  streamingIntervalMs: number;
  errorMessage?: string;
}

export type TelemetryListener = (telemetry: BMSTelemetry) => void;
export type StatusListener = (status: DataSourceStatus) => void;
export type ErrorListener = (error: Error) => void;

export interface HistoricalQueryOptions {
  limit?: number;
  startTime?: number;
  endTime?: number;
}
