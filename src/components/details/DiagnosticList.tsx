import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MosfetState } from '../../models/bms.types';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { Shield, CheckCircle, XCircle, Zap, Activity, Repeat } from 'lucide-react-native';
import { formatResistance } from '../../utils/formatters';

interface DiagnosticListProps {
  mosfetState: MosfetState;
  insulationResistance: number;
  cycleCount: number;
  activeBalancingCount: number;
}

export const DiagnosticList: React.FC<DiagnosticListProps> = ({
  mosfetState,
  insulationResistance,
  cycleCount,
  activeBalancingCount,
}) => {
  const isInsulationGood = insulationResistance >= 1000;

  return (
    <GlassCard style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Shield size={16} color={colors.primary} />
          <Text style={styles.title}>BMS HARDWARE DIAGNOSTICS</Text>
        </View>
        <Text style={styles.hardwareVer}>FW: v4.8.2-PROD</Text>
      </View>

      {/* Grid of Diagnostic Metrics */}
      <View style={styles.grid}>
        {/* Charge MOSFET */}
        <View style={styles.item}>
          <View style={styles.itemLabelRow}>
            {mosfetState.chargeEnabled ? (
              <CheckCircle size={14} color={colors.statusCharging} />
            ) : (
              <XCircle size={14} color={colors.accentRed} />
            )}
            <Text style={styles.itemLabel}>Charge FET</Text>
          </View>
          <Text
            style={[
              styles.itemStatus,
              { color: mosfetState.chargeEnabled ? colors.statusCharging : colors.accentRed },
            ]}
          >
            {mosfetState.chargeEnabled ? 'CLOSED (ON)' : 'OPEN (OFF)'}
          </Text>
        </View>

        {/* Discharge MOSFET */}
        <View style={styles.item}>
          <View style={styles.itemLabelRow}>
            {mosfetState.dischargeEnabled ? (
              <CheckCircle size={14} color={colors.statusCharging} />
            ) : (
              <XCircle size={14} color={colors.accentRed} />
            )}
            <Text style={styles.itemLabel}>Discharge FET</Text>
          </View>
          <Text
            style={[
              styles.itemStatus,
              { color: mosfetState.dischargeEnabled ? colors.statusCharging : colors.accentRed },
            ]}
          >
            {mosfetState.dischargeEnabled ? 'CLOSED (ON)' : 'OPEN (OFF)'}
          </Text>
        </View>

        {/* Precharge Status */}
        <View style={styles.item}>
          <View style={styles.itemLabelRow}>
            <Zap size={14} color={colors.primary} />
            <Text style={styles.itemLabel}>Pre-Charge</Text>
          </View>
          <Text style={[styles.itemStatus, { color: colors.textPrimary }]}>
            {mosfetState.prechargeActive ? 'ACTIVE' : 'IDLE / BYPASS'}
          </Text>
        </View>

        {/* Insulation Resistance */}
        <View style={styles.item}>
          <View style={styles.itemLabelRow}>
            <Activity
              size={14}
              color={isInsulationGood ? colors.accentGreen : colors.accentRed}
            />
            <Text style={styles.itemLabel}>HV Insulation</Text>
          </View>
          <Text
            style={[
              styles.itemStatus,
              { color: isInsulationGood ? colors.accentGreen : colors.accentRed },
            ]}
          >
            {formatResistance(insulationResistance)}
          </Text>
        </View>

        {/* Active Balancing */}
        <View style={styles.item}>
          <View style={styles.itemLabelRow}>
            <Repeat size={14} color={colors.primary} />
            <Text style={styles.itemLabel}>Balancing State</Text>
          </View>
          <Text style={[styles.itemStatus, { color: colors.primary }]}>
            {activeBalancingCount > 0 ? `${activeBalancingCount} Cells Active` : 'Equalized'}
          </Text>
        </View>

        {/* Cycle Count */}
        <View style={styles.item}>
          <View style={styles.itemLabelRow}>
            <Repeat size={14} color={colors.textSecondary} />
            <Text style={styles.itemLabel}>Cycle Count</Text>
          </View>
          <Text style={[styles.itemStatus, { color: colors.textPrimary }]}>
            {cycleCount} Full Eq.
          </Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  hardwareVer: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: typography.fontFamilyMono,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  itemStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
