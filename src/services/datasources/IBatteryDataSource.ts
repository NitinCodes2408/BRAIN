/**
 * Battery Data Source Contract
 * 
 * Defines the unified interface for all BMS telemetry ingestion sources.
 * Implementations include:
 *  - JsonBatteryDataSource (JSON files, real-time stream simulation, mock packets)
 *  - BleBatteryDataSource (Future Bluetooth Low Energy GATT characteristic receiver)
 */

import { BMSTelemetry } from '../../models/bms.types';
import {
  DataSourceStatus,
  DataSourceType,
  TelemetryListener,
  StatusListener,
  ErrorListener,
} from '../../models/datasource.types';

export interface IBatteryDataSource {
  readonly type: DataSourceType;
  readonly name: string;

  /**
   * Initializes connection or loads data stream
   */
  connect(): Promise<void>;

  /**
   * Stops streaming and tears down active connections
   */
  disconnect(): Promise<void>;

  /**
   * Starts or resumes telemetry streaming at the given interval
   */
  startStreaming(intervalMs?: number): void;

  /**
   * Pauses the active telemetry stream
   */
  pauseStreaming(): void;

  /**
   * Steps to the next telemetry frame (useful for debugging and step-by-step playback)
   */
  stepNext(): BMSTelemetry | null;

  /**
   * Steps to the previous telemetry frame
   */
  stepPrevious(): BMSTelemetry | null;

  /**
   * Subscribes to real-time BMS telemetry frames
   * @returns Unsubscribe function
   */
  subscribeTelemetry(listener: TelemetryListener): () => void;

  /**
   * Subscribes to connection/status state transitions
   * @returns Unsubscribe function
   */
  subscribeStatus(listener: StatusListener): () => void;

  /**
   * Subscribes to error notifications
   * @returns Unsubscribe function
   */
  subscribeError(listener: ErrorListener): () => void;

  /**
   * Gets the latest received or active BMS telemetry frame
   */
  getCurrentTelemetry(): BMSTelemetry | null;

  /**
   * Gets all historical or preloaded frames from this source
   */
  getAllFrames(): BMSTelemetry[];

  /**
   * Current operational status
   */
  getStatus(): DataSourceStatus;
}
