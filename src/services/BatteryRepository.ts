/**
 * Central Battery Repository
 * 
 * Serves as the single source of truth for BMS telemetry, connection lifecycle,
 * safety alerts, and data source abstraction across the application.
 */

import { BMSTelemetry, BmsFault } from '../models/bms.types';
import {
  DataSourceStatus,
  DataSourceType,
  TelemetryListener,
  StatusListener,
} from '../models/datasource.types';
import { AlertThresholds } from '../models/settings.types';
import { IBatteryDataSource } from './datasources/IBatteryDataSource';
import { JsonBatteryDataSource } from './datasources/JsonBatteryDataSource';
import { BleBatteryDataSource } from './datasources/BleBatteryDataSource';
import { AlertService } from './AlertService';
import { appendTelemetryLog } from '../storage/logStorage';
import { defaultAlertThresholds } from '../storage/asyncStorage';

export class BatteryRepository {
  private static instance: BatteryRepository | null = null;

  private activeDataSource: IBatteryDataSource;
  private jsonSource: JsonBatteryDataSource;
  private bleSource: BleBatteryDataSource;

  private currentTelemetry: BMSTelemetry | null = null;
  private currentAlerts: BmsFault[] = [];
  private thresholds: AlertThresholds = defaultAlertThresholds;
  private autoLogEnabled: boolean = true;

  private telemetrySubscribers: Set<TelemetryListener> = new Set();
  private statusSubscribers: Set<StatusListener> = new Set();
  private alertSubscribers: Set<(alerts: BmsFault[]) => void> = new Set();

  private unsubscribeTelemetryFromSource: (() => void) | null = null;
  private unsubscribeStatusFromSource: (() => void) | null = null;

  private constructor() {
    this.jsonSource = new JsonBatteryDataSource('sample_bms_telemetry.json');
    this.bleSource = new BleBatteryDataSource();
    this.activeDataSource = this.jsonSource;

    this.bindActiveSource();
  }

  public static getInstance(): BatteryRepository {
    if (!BatteryRepository.instance) {
      BatteryRepository.instance = new BatteryRepository();
    }
    return BatteryRepository.instance;
  }

  /**
   * Switches active data source seamlessly between JSON and BLE
   */
  public async switchDataSource(type: DataSourceType, datasetName?: string): Promise<void> {
    await this.activeDataSource.disconnect();
    this.unbindCurrentSource();

    if (type === 'ble') {
      this.activeDataSource = this.bleSource;
    } else {
      if (datasetName) {
        this.jsonSource.loadDataset(datasetName);
      }
      this.activeDataSource = this.jsonSource;
    }

    this.bindActiveSource();
    await this.activeDataSource.connect();
  }

  public setThresholds(newThresholds: AlertThresholds): void {
    this.thresholds = newThresholds;
    if (this.currentTelemetry) {
      this.evaluateAndBroadcastAlerts(this.currentTelemetry);
    }
  }

  public setAutoLog(enabled: boolean): void {
    this.autoLogEnabled = enabled;
  }

  public async connect(): Promise<void> {
    await this.activeDataSource.connect();
  }

  public async disconnect(): Promise<void> {
    await this.activeDataSource.disconnect();
  }

  public startStreaming(intervalMs?: number): void {
    this.activeDataSource.startStreaming(intervalMs);
  }

  public pauseStreaming(): void {
    this.activeDataSource.pauseStreaming();
  }

  public stepNext(): BMSTelemetry | null {
    return this.activeDataSource.stepNext();
  }

  public stepPrevious(): BMSTelemetry | null {
    return this.activeDataSource.stepPrevious();
  }

  public getCurrentTelemetry(): BMSTelemetry | null {
    return this.currentTelemetry || this.activeDataSource.getCurrentTelemetry();
  }

  public getCurrentAlerts(): BmsFault[] {
    return [...this.currentAlerts];
  }

  public getStatus(): DataSourceStatus {
    return this.activeDataSource.getStatus();
  }

  public getActiveSourceType(): DataSourceType {
    return this.activeDataSource.type;
  }

  public getJsonSource(): JsonBatteryDataSource {
    return this.jsonSource;
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetrySubscribers.add(listener);
    if (this.currentTelemetry) {
      listener(this.currentTelemetry);
    }
    return () => {
      this.telemetrySubscribers.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusSubscribers.add(listener);
    listener(this.activeDataSource.getStatus());
    return () => {
      this.statusSubscribers.delete(listener);
    };
  }

  public subscribeAlerts(listener: (alerts: BmsFault[]) => void): () => void {
    this.alertSubscribers.add(listener);
    listener(this.currentAlerts);
    return () => {
      this.alertSubscribers.delete(listener);
    };
  }

  private bindActiveSource(): void {
    this.unsubscribeTelemetryFromSource = this.activeDataSource.subscribeTelemetry((telemetry) => {
      this.handleIncomingTelemetry(telemetry);
    });

    this.unsubscribeStatusFromSource = this.activeDataSource.subscribeStatus((status) => {
      this.statusSubscribers.forEach((l) => l(status));
    });
  }

  private unbindCurrentSource(): void {
    if (this.unsubscribeTelemetryFromSource) {
      this.unsubscribeTelemetryFromSource();
      this.unsubscribeTelemetryFromSource = null;
    }
    if (this.unsubscribeStatusFromSource) {
      this.unsubscribeStatusFromSource();
      this.unsubscribeStatusFromSource = null;
    }
  }

  private handleIncomingTelemetry(telemetry: BMSTelemetry): void {
    this.currentTelemetry = telemetry;

    // Evaluate Safety Alerts
    this.evaluateAndBroadcastAlerts(telemetry);

    // Auto log to local storage
    if (this.autoLogEnabled) {
      appendTelemetryLog(telemetry);
    }

    // Broadcast to UI subscribers
    this.telemetrySubscribers.forEach((listener) => {
      try {
        listener(telemetry);
      } catch (err) {
        console.error('Error dispatching telemetry in repository:', err);
      }
    });
  }

  private evaluateAndBroadcastAlerts(telemetry: BMSTelemetry): void {
    const evaluatedAlerts = AlertService.evaluateAlerts(telemetry, this.thresholds);
    const packFaults = telemetry.faults || [];
    this.currentAlerts = [...evaluatedAlerts, ...packFaults];

    this.alertSubscribers.forEach((listener) => {
      try {
        listener(this.currentAlerts);
      } catch (err) {
        console.error('Error dispatching alerts in repository:', err);
      }
    });
  }
}
