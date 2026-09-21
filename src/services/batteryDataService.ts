/**
 * BRAIN Standard Battery Data Service
 * 
 * Standard Telemetry Service Model & Ingestion Bus
 * Decouples the UI layer from underlying telemetry streams (JSON, BMS, IoT, BLE, REST API, ML Inference).
 */

import sampleData from '../assets/data/sample_bms_telemetry.json';
import highStressData from '../assets/data/high_stress_bms_telemetry.json';

export interface StandardBatteryTelemetry {
  voltage: number | null;
  current: number | null;
  temperature: number | null;
  soc: number | null;
  soh: number | null;
  cRate: number | null;
  ambientTemperature: number | null;
  timestamp: number | string | null;

  // Additional engineering fields for detailed diagnostics
  packPower?: number | null;
  minCellVoltage?: number | null;
  maxCellVoltage?: number | null;
  deltaCellVoltage?: number | null;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  temperatures?: number[];
  cells?: Array<{
    id: number;
    voltage: number;
    temperature: number;
    balanceActive: boolean;
  }>;
  cycleCount?: number;
  estimatedRangeKm?: number;
  batteryStatus?: string;
  mosfetState?: {
    chargeMosfetOpen: boolean;
    dischargeMosfetOpen: boolean;
    prechargeActive: boolean;
  };
  insulationResistance?: number;
  faults?: string[];
}

export type ConnectionState = 'disconnected' | 'waiting' | 'connected' | 'streaming';

export interface TelemetryServiceStatus {
  state: ConnectionState;
  sourceType: 'json' | 'ble' | 'api' | 'none';
  datasetName: string;
  frameIndex: number;
  totalFrames: number;
  samplingIntervalMs: number;
}

export type TelemetryListener = (data: StandardBatteryTelemetry | null) => void;
export type StatusListener = (status: TelemetryServiceStatus) => void;

class BatteryDataService {
  private static instance: BatteryDataService | null = null;

  private activeDataset: any[] = sampleData;
  private datasetName: string = 'Nominal 16S Pack (Sample)';
  private frameIndex: number = 0;
  private streamingInterval: any = null;
  private intervalMs: number = 1000;
  private connectionState: ConnectionState = 'streaming';

  private telemetryListeners: Set<TelemetryListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private currentTelemetry: StandardBatteryTelemetry | null = null;

  private constructor() {
    this.processFrame(0);
    this.startStreaming(this.intervalMs);
  }

  public static getInstance(): BatteryDataService {
    if (!BatteryDataService.instance) {
      BatteryDataService.instance = new BatteryDataService();
    }
    return BatteryDataService.instance;
  }

  private extractNumber(val: any, fallback: number = 0): number {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'object' && val !== null) {
      if (typeof val.voltage === 'number') return val.voltage;
      if (typeof val.temperature === 'number') return val.temperature;
      if (typeof val.value === 'number') return val.value;
    }
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
    return fallback;
  }

  private mapRawTelemetry(raw: any): StandardBatteryTelemetry {
    if (!raw) {
      return {
        voltage: null,
        current: null,
        temperature: null,
        soc: null,
        soh: null,
        cRate: null,
        ambientTemperature: null,
        timestamp: null,
      };
    }

    const packVoltage = typeof raw.packVoltage === 'number' ? raw.packVoltage : 58.4;
    const packCurrent = typeof raw.packCurrent === 'number' ? raw.packCurrent : -14.2;
    const avgTemp = typeof raw.avgTemperature === 'number' ? raw.avgTemperature : 28.5;
    const soc = typeof raw.soc === 'number' ? raw.soc : 80;
    const soh = typeof raw.soh === 'number' ? raw.soh : 98.5;

    const capacityAh = 50.0;
    const cRate = Math.abs(packCurrent) / capacityAh;

    const minCell = this.extractNumber(raw.minCellVoltage, 3.65);
    const maxCell = this.extractNumber(raw.maxCellVoltage, 3.67);
    const deltaV = typeof raw.deltaCellVoltage === 'number' ? raw.deltaCellVoltage : Math.abs(maxCell - minCell);
    const minTemp = this.extractNumber(raw.minTemperature, 27);
    const maxTemp = this.extractNumber(raw.maxTemperature, 31);

    const rawTemps = Array.isArray(raw.temperatures) ? raw.temperatures : [];
    const temperatures: number[] = rawTemps.length > 0
      ? rawTemps.map((t: any) => this.extractNumber(t, avgTemp))
      : [minTemp, avgTemp, maxTemp, avgTemp];

    const rawCells = Array.isArray(raw.cells) ? raw.cells : [];
    const cells = rawCells.length > 0
      ? rawCells.map((c: any, idx: number) => ({
          id: c.id ?? idx + 1,
          voltage: typeof c.voltage === 'number' ? c.voltage : 3.65,
          temperature: typeof c.temperature === 'number' ? c.temperature : Math.round(avgTemp),
          balanceActive: Boolean(c.balanceActive),
        }))
      : Array.from({ length: 16 }, (_, i) => ({
          id: i + 1,
          voltage: minCell + (i % 4) * (deltaV / 4),
          temperature: Math.round(avgTemp + (i % 2)),
          balanceActive: i % 5 === 0,
        }));

    return {
      voltage: packVoltage,
      current: packCurrent,
      temperature: avgTemp,
      soc: soc,
      soh: soh,
      cRate: Number(cRate.toFixed(2)),
      ambientTemperature: typeof raw.ambientTemperature === 'number' ? raw.ambientTemperature : Math.round(minTemp - 2),
      timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),

      packPower: typeof raw.packPower === 'number' ? raw.packPower : Math.round(packVoltage * packCurrent),
      minCellVoltage: minCell,
      maxCellVoltage: maxCell,
      deltaCellVoltage: deltaV,
      minTemperature: minTemp,
      maxTemperature: maxTemp,
      temperatures: temperatures,
      cells: cells,
      cycleCount: typeof raw.cycleCount === 'number' ? raw.cycleCount : 142,
      estimatedRangeKm: typeof raw.estimatedRangeKm === 'number' ? raw.estimatedRangeKm : Math.round((soc / 100) * 85),
      batteryStatus: typeof raw.batteryStatus === 'string' ? raw.batteryStatus : 'Normal',
      mosfetState: raw.mosfetState ?? { chargeMosfetOpen: true, dischargeMosfetOpen: true, prechargeActive: false },
      insulationResistance: typeof raw.insulationResistance === 'number' ? raw.insulationResistance : 550,
      faults: raw.faults ? raw.faults.map((f: any) => typeof f === 'string' ? f : f.message || f.type || 'Fault') : [],
    };
  }

  private processFrame(index: number) {
    if (!this.activeDataset || this.activeDataset.length === 0) {
      this.currentTelemetry = null;
    } else {
      this.frameIndex = (index + this.activeDataset.length) % this.activeDataset.length;
      const raw = this.activeDataset[this.frameIndex];
      this.currentTelemetry = this.mapRawTelemetry(raw);
    }
    this.broadcast();
  }

  private broadcast() {
    const status = this.getStatus();
    this.telemetryListeners.forEach((fn) => {
      try {
        fn(this.currentTelemetry);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  public getStatus(): TelemetryServiceStatus {
    return {
      state: this.connectionState,
      sourceType: this.connectionState === 'disconnected' ? 'none' : 'json',
      datasetName: this.datasetName,
      frameIndex: this.frameIndex,
      totalFrames: this.activeDataset.length,
      samplingIntervalMs: this.intervalMs,
    };
  }

  public getCurrentTelemetry(): StandardBatteryTelemetry | null {
    return this.currentTelemetry;
  }

  public isStreaming(): boolean {
    return this.connectionState === 'streaming';
  }

  public startStreaming(intervalMs?: number) {
    if (intervalMs) this.intervalMs = intervalMs;
    this.pauseStreaming();
    this.connectionState = 'streaming';

    this.streamingInterval = setInterval(() => {
      this.processFrame(this.frameIndex + 1);
    }, this.intervalMs);

    this.broadcast();
  }

  public pauseStreaming() {
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
    if (this.connectionState === 'streaming') {
      this.connectionState = 'connected';
    }
    this.broadcast();
  }

  public disconnect() {
    this.pauseStreaming();
    this.connectionState = 'disconnected';
    this.currentTelemetry = null;
    this.broadcast();
  }

  public reconnect() {
    this.processFrame(this.frameIndex);
    this.startStreaming(this.intervalMs);
  }

  public stepNext() {
    this.pauseStreaming();
    this.processFrame(this.frameIndex + 1);
  }

  public stepPrevious() {
    this.pauseStreaming();
    this.processFrame(this.frameIndex - 1);
  }

  public loadDataset(type: 'sample' | 'high_stress') {
    if (type === 'high_stress') {
      this.activeDataset = highStressData;
      this.datasetName = 'High Stress Thermal Run (Sample)';
    } else {
      this.activeDataset = sampleData;
      this.datasetName = 'Nominal 16S Pack (Sample)';
    }
    this.frameIndex = 0;
    this.processFrame(0);
  }

  public subscribeTelemetry(fn: TelemetryListener): () => void {
    this.telemetryListeners.add(fn);
    fn(this.currentTelemetry);
    return () => this.telemetryListeners.delete(fn);
  }

  public subscribeStatus(fn: StatusListener): () => void {
    this.statusListeners.add(fn);
    fn(this.getStatus());
    return () => this.statusListeners.delete(fn);
  }
}

export const batteryDataService = BatteryDataService.getInstance();
