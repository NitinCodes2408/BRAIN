/**
 * Bluetooth Low Energy (BLE) Battery Data Source Skeleton
 * 
 * Prepares the application for future BLE hardware connectivity.
 * Implements the identical `IBatteryDataSource` interface as JsonBatteryDataSource,
 * ensuring that swapping to BLE requires zero alterations to screens, components,
 * or state management hooks.
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

export class BleBatteryDataSource implements IBatteryDataSource {
  readonly type: DataSourceType = 'ble';
  readonly name: string = 'BLE Hardware Link (Future Ready)';

  private currentStatus: DataSourceStatus = {
    type: 'ble',
    state: 'disconnected',
    sourceName: 'BMS-BLE-DEVICE-01',
    packetsReceived: 0,
    streamingIntervalMs: 1000,
  };

  private latestTelemetry: BMSTelemetry | null = null;
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  /**
   * Connect to BLE Hardware Peripheral (Stubbed for future integration)
   * Future implementation will:
   * 1. Request bluetooth permissions
   * 2. Scan for BMS UUIDs
   * 3. Establish GATT connection
   * 4. Discover Primary Battery Service & Characteristics
   */
  public async connect(): Promise<void> {
    this.updateStatus({ state: 'connecting' });

    // Note: Native Bluetooth library (e.g. react-native-ble-plx) will be hooked here
    // For now, transitions status to connected standby mode
    this.updateStatus({
      state: 'connected',
      errorMessage: 'BLE hardware driver not yet initialized. Interface is prepared for plug-in.',
    });
  }

  public async disconnect(): Promise<void> {
    // Teardown BLE GATT session
    this.updateStatus({ state: 'disconnected' });
  }

  public startStreaming(intervalMs?: number): void {
    if (intervalMs) {
      this.updateStatus({ streamingIntervalMs: intervalMs });
    }
    // Future BLE: Subscribe to characteristic notify/indicate descriptors
    this.updateStatus({ state: 'streaming' });
  }

  public pauseStreaming(): void {
    // Future BLE: Unsubscribe from notify descriptors
    this.updateStatus({ state: 'paused' });
  }

  public stepNext(): BMSTelemetry | null {
    // Step operations are not typically applicable to live BLE hardware,
    // but return latest received packet to preserve interface uniformity.
    return this.latestTelemetry;
  }

  public stepPrevious(): BMSTelemetry | null {
    return this.latestTelemetry;
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    if (this.latestTelemetry) {
      listener(this.latestTelemetry);
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
    return this.latestTelemetry;
  }

  public getAllFrames(): BMSTelemetry[] {
    return this.latestTelemetry ? [this.latestTelemetry] : [];
  }

  public getStatus(): DataSourceStatus {
    return { ...this.currentStatus };
  }

  /**
   * Internal parser: to be called when raw BLE GATT byte packets arrive.
   * Parses binary byte array into typed BMSTelemetry.
   */
  public handleRawBlePacket(rawBytes: Uint8Array): void {
    // Future byte decoder logic:
    // const voltage = (rawBytes[0] << 8 | rawBytes[1]) / 100.0;
    // ...
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
        console.error('Error in BLE status listener:', err);
      }
    });
  }
}
