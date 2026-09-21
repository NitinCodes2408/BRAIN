/**
 * JSON Battery Data Source
 * 
 * Ingests BMS JSON telemetry records, supports real-time streaming simulation,
 * single-frame stepping, and JSON payload injection.
 */

import { BMSTelemetry } from '../../models/bms.types';
import {
  DataSourceStatus,
  DataSourceType,
  TelemetryListener,
  StatusListener,
  ErrorListener,
} from '../../models/datasource.types';
import { IBatteryDataSource } from './IBatteryDataSource';

// Default bundled telemetry datasets
const SAMPLE_DATA: BMSTelemetry[] = require('../../assets/data/sample_bms_telemetry.json');
const HIGH_STRESS_DATA: BMSTelemetry[] = require('../../assets/data/high_stress_bms_telemetry.json');

export class JsonBatteryDataSource implements IBatteryDataSource {
  readonly type: DataSourceType = 'json_stream';
  readonly name: string = 'JSON Telemetry Ingestor';

  private frames: BMSTelemetry[] = [];
  private currentFrameIndex: number = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private streamingIntervalMs: number = 1500;
  private currentStatus: DataSourceStatus;

  private telemetryListeners: Set<TelemetryListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  constructor(initialDatasetKey: string = 'sample_bms_telemetry.json') {
    this.currentStatus = {
      type: 'json_stream',
      state: 'disconnected',
      sourceName: initialDatasetKey,
      packetsReceived: 0,
      streamingIntervalMs: this.streamingIntervalMs,
    };
    this.loadDataset(initialDatasetKey);
  }

  public loadDataset(datasetKey: string): void {
    if (datasetKey === 'high_stress_bms_telemetry.json') {
      this.frames = [...HIGH_STRESS_DATA];
    } else {
      this.frames = [...SAMPLE_DATA];
    }
    this.currentFrameIndex = 0;
    this.updateStatus({
      sourceName: datasetKey,
      packetsReceived: 0,
    });
  }

  public setCustomFrames(customFrames: BMSTelemetry[], name: string = 'Custom JSON Stream'): void {
    if (!Array.isArray(customFrames) || customFrames.length === 0) {
      this.notifyError(new Error('Invalid JSON frames provided. Expected non-empty array.'));
      return;
    }
    this.frames = customFrames;
    this.currentFrameIndex = 0;
    this.updateStatus({
      sourceName: name,
      packetsReceived: 0,
    });
    this.emitCurrentFrame();
  }

  public async connect(): Promise<void> {
    if (this.frames.length === 0) {
      this.loadDataset('sample_bms_telemetry.json');
    }

    this.updateStatus({
      state: 'connected',
      errorMessage: undefined,
    });

    // Broadcast initial frame
    this.emitCurrentFrame();
  }

  public async disconnect(): Promise<void> {
    this.pauseStreaming();
    this.updateStatus({
      state: 'disconnected',
    });
  }

  public startStreaming(intervalMs: number = this.streamingIntervalMs): void {
    this.streamingIntervalMs = intervalMs;
    this.pauseStreaming(); // Clear existing if any

    this.updateStatus({
      state: 'streaming',
      streamingIntervalMs: intervalMs,
    });

    this.timer = setInterval(() => {
      this.stepNext();
    }, this.streamingIntervalMs);
  }

  public pauseStreaming(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.currentStatus.state === 'streaming') {
      this.updateStatus({ state: 'paused' });
    }
  }

  public stepNext(): BMSTelemetry | null {
    if (this.frames.length === 0) return null;

    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    return this.emitCurrentFrame();
  }

  public stepPrevious(): BMSTelemetry | null {
    if (this.frames.length === 0) return null;

    this.currentFrameIndex =
      (this.currentFrameIndex - 1 + this.frames.length) % this.frames.length;
    return this.emitCurrentFrame();
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    // Immediately provide current frame if available
    const current = this.getCurrentTelemetry();
    if (current) {
      listener(current);
    }
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribeError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  public getCurrentTelemetry(): BMSTelemetry | null {
    if (this.frames.length === 0) return null;
    return this.frames[this.currentFrameIndex] || null;
  }

  public getAllFrames(): BMSTelemetry[] {
    return [...this.frames];
  }

  public getStatus(): DataSourceStatus {
    return { ...this.currentStatus };
  }

  private emitCurrentFrame(): BMSTelemetry | null {
    const frame = this.getCurrentTelemetry();
    if (!frame) return null;

    // Stamp current wall-clock time for real-time appearance
    const liveFrame: BMSTelemetry = {
      ...frame,
      timestamp: Date.now(),
    };

    const newPacketCount = this.currentStatus.packetsReceived + 1;
    this.updateStatus({
      lastPacketTime: liveFrame.timestamp,
      packetsReceived: newPacketCount,
    });

    this.telemetryListeners.forEach((listener) => {
      try {
        listener(liveFrame);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });

    return liveFrame;
  }

  private updateStatus(partial: Partial<DataSourceStatus>): void {
    this.currentStatus = {
      ...this.currentStatus,
      ...partial,
    };
    this.statusListeners.forEach((listener) => {
      try {
        listener(this.currentStatus);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  private notifyError(error: Error): void {
    this.updateStatus({
      state: 'error',
      errorMessage: error.message,
    });
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }
}
