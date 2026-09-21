import React from 'react';
import { StandardBatteryTelemetry, TelemetryServiceStatus } from '../services/batteryDataService';
import { TelemetryControls } from '../components/dashboard/TelemetryControls';
import { BatteryOverviewCards } from '../components/dashboard/BatteryOverviewCards';
import { BatteryHealthSection } from '../components/dashboard/BatteryHealthSection';
import { ThermalMonitoringSection } from '../components/dashboard/ThermalMonitoringSection';
import { RiskAssessmentSection } from '../components/dashboard/RiskAssessmentSection';
import { EarlyWarningSection } from '../components/dashboard/EarlyWarningSection';
import { SystemStatusSection } from '../components/dashboard/SystemStatusSection';

interface WebDashboardScreenProps {
  telemetry: StandardBatteryTelemetry | null;
  status: TelemetryServiceStatus;
}

export const WebDashboardScreen: React.FC<WebDashboardScreenProps> = ({ telemetry, status }) => {
  return (
    <div className="page-container">
      {/* Telemetry Stream Ingestion Controls */}
      <TelemetryControls status={status} />

      {/* Battery Overview: 6 Key Telemetry Metric Cards */}
      <BatteryOverviewCards telemetry={telemetry} />

      {/* Main Diagnostic Tier: Battery Health & Thermal Monitoring */}
      <div className="dashboard-grid-2col">
        <BatteryHealthSection telemetry={telemetry} />
        <ThermalMonitoringSection telemetry={telemetry} />
      </div>

      {/* Lower Analytics Tier: Risk Assessment, Early Warning, and System Status */}
      <div className="dashboard-grid-3col">
        <RiskAssessmentSection telemetry={telemetry} />
        <EarlyWarningSection telemetry={telemetry} />
        <SystemStatusSection status={status} />
      </div>
    </div>
  );
};
