import React from 'react';
import { Sidebar, ActiveTab } from './Sidebar';
import { AppHeader } from './AppHeader';
import { ConnectionState } from '../../services/batteryDataService';

interface AppLayoutProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  connectionState: ConnectionState;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  connectionState,
  children,
}) => {
  const getHeaderInfo = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Battery intelligence and thermal monitoring' };
      case 'details':
        return { title: 'Battery Details', subtitle: '16S cell voltages & thermal probe distributions' };
      case 'prediction':
        return { title: 'Prediction', subtitle: 'Trained ML model pipeline & feature tensor telemetry' };
      case 'history':
        return { title: 'History', subtitle: 'Historical trends & chronological frame logging' };
      case 'settings':
        return { title: 'Settings', subtitle: 'BMS safety envelopes & stream configuration' };
    }
  };

  const { title, subtitle } = getHeaderInfo(activeTab);

  return (
    <div className="brain-app">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isStreaming={connectionState === 'streaming'}
      />

      {/* Main App Canvas */}
      <div className="brain-main-content">
        {/* Compact Top Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          connectionState={connectionState}
        />

        {/* Dynamic Screen View */}
        <main>{children}</main>
      </div>
    </div>
  );
};
