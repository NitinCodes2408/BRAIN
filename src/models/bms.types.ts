/**
 * BMS Telemetry and Diagnostic Types for EV Battery Intelligence System
 */

export interface CellVoltage {
  id: number;
  voltage: number; // in Volts (e.g. 3.852)
  balanceActive: boolean;
  status: 'normal' | 'low' | 'high' | 'critical';
}

export interface ThermalProbe {
  id: number;
  location: string;
  temperature: number; // in Celsius
  status: 'normal' | 'warm' | 'overtemp';
}

export interface MosfetState {
  chargeEnabled: boolean;
  dischargeEnabled: boolean;
  prechargeActive: boolean;
}

export interface BmsFault {
  id: string;
  code: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
}

export interface BMSTelemetry {
  timestamp: number;
  packVoltage: number; // in Volts (e.g. 64.2V)
  packCurrent: number; // in Amperes (positive: charging, negative: discharging)
  packPower: number; // in kW
  soc: number; // State of Charge (0 - 100%)
  soh: number; // State of Health (0 - 100%)
  cycleCount: number;
  
  // Cell Voltage Metrics
  avgCellVoltage: number;
  minCellVoltage: { cellId: number; voltage: number };
  maxCellVoltage: { cellId: number; voltage: number };
  deltaCellVoltage: number; // in Volts (e.g. 0.015V = 15mV)
  cells: CellVoltage[];

  // Thermal Metrics
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  temperatures: ThermalProbe[];

  // Safety & Hardware Diagnostics
  insulationResistance: number; // in kOhm
  mosfetState: MosfetState;
  faults: BmsFault[];
  estimatedRangeKm: number;
  batteryStatus: 'charging' | 'discharging' | 'standby' | 'alert';
}
