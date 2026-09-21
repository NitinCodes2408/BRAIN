import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBattery } from '../context/BatteryContext';
import { Header } from '../components/common/Header';
import { AlertBanner } from '../components/common/AlertBanner';
import { BatteryGauge } from '../components/dashboard/BatteryGauge';
import { PowerFlowIndicator } from '../components/dashboard/PowerFlowIndicator';
import { QuickMetricsRow } from '../components/dashboard/QuickMetricsRow';
import { DataSourceControls } from '../components/dashboard/DataSourceControls';
import { colors } from '../utils/theme';

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { telemetry, alerts } = useBattery();

  if (!telemetry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="EV Battery Intelligence" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="EV Battery Intelligence" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Safety Alerts Ribbon */}
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}

        {/* Circular SoC & SoH Gauge */}
        <BatteryGauge
          soc={telemetry.soc}
          soh={telemetry.soh}
          packVoltage={telemetry.packVoltage}
          packPower={telemetry.packPower}
          packCurrent={telemetry.packCurrent}
          estimatedRangeKm={telemetry.estimatedRangeKm}
          batteryStatus={telemetry.batteryStatus}
        />

        {/* Dynamic Power Flow Meter */}
        <PowerFlowIndicator
          packPower={telemetry.packPower}
          packCurrent={telemetry.packCurrent}
          packVoltage={telemetry.packVoltage}
        />

        {/* Telemetry Ingestion Controls */}
        <DataSourceControls />

        {/* Key Pack Telemetry Stat Cards */}
        <QuickMetricsRow
          packVoltage={telemetry.packVoltage}
          packCurrent={telemetry.packCurrent}
          deltaCellVoltage={telemetry.deltaCellVoltage}
          avgTemperature={telemetry.avgTemperature}
          maxTemperature={telemetry.maxTemperature}
          cycleCount={telemetry.cycleCount}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
