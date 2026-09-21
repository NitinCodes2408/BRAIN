import React, { useState, useEffect } from 'react';
import { batteryDataService, StandardBatteryTelemetry, TelemetryServiceStatus } from './services/batteryDataService';
import { AppLayout } from './components/layout/AppLayout';
import { ActiveTab } from './components/layout/Sidebar';
import { WebDashboardScreen } from './screens/WebDashboardScreen';
import { WebBatteryDetailsScreen } from './screens/WebBatteryDetailsScreen';
import { WebPredictionScreen } from './screens/WebPredictionScreen';
import { WebHistoryScreen } from './screens/WebHistoryScreen';
import { WebSettingsScreen } from './screens/WebSettingsScreen';

export const WebApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [telemetry, setTelemetry] = useState<StandardBatteryTelemetry | null>(
    batteryDataService.getCurrentTelemetry()
  );
  const [status, setStatus] = useState<TelemetryServiceStatus>(
    batteryDataService.getStatus()
  );

  useEffect(() => {
    const unsubTelemetry = batteryDataService.subscribeTelemetry((newTel) => {
      setTelemetry(newTel);
    });

    const unsubStatus = batteryDataService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubTelemetry();
      unsubStatus();
    };
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WebDashboardScreen telemetry={telemetry} status={status} />;
      case 'details':
        return <WebBatteryDetailsScreen telemetry={telemetry} />;
      case 'prediction':
        return <WebPredictionScreen telemetry={telemetry} />;
      case 'history':
        return <WebHistoryScreen telemetry={telemetry} />;
      case 'settings':
        return <WebSettingsScreen />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      connectionState={status.state}
    >
      {renderScreen()}
    </AppLayout>
  );
};
