import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBattery } from '../context/BatteryContext';
import { Header } from '../components/common/Header';
import { AlertBanner } from '../components/common/AlertBanner';
import { CellMatrixGrid } from '../components/details/CellMatrixGrid';
import { ThermalDistribution } from '../components/details/ThermalDistribution';
import { DiagnosticList } from '../components/details/DiagnosticList';
import { colors } from '../utils/theme';

export const BatteryDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { telemetry, alerts } = useBattery();

  if (!telemetry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Pack & Cell Diagnostics" />
      </View>
    );
  }

  const activeBalancingCount = telemetry.cells.filter((c) => c.balanceActive).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Pack & Cell Diagnostics" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Safety Alerts */}
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}

        {/* 16S Cell Voltage Matrix */}
        <CellMatrixGrid
          cells={telemetry.cells}
          minCell={telemetry.minCellVoltage}
          maxCell={telemetry.maxCellVoltage}
          deltaV={telemetry.deltaCellVoltage}
        />

        {/* Thermal Probes Distribution */}
        <ThermalDistribution
          probes={telemetry.temperatures}
          avgTemp={telemetry.avgTemperature}
          maxTemp={telemetry.maxTemperature}
          minTemp={telemetry.minTemperature}
        />

        {/* BMS Hardware Diagnostics */}
        <DiagnosticList
          mosfetState={telemetry.mosfetState}
          insulationResistance={telemetry.insulationResistance}
          cycleCount={telemetry.cycleCount}
          activeBalancingCount={activeBalancingCount}
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
