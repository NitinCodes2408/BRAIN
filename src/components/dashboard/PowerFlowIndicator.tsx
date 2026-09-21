import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { ArrowDownLeft, ArrowUpRight, Zap } from 'lucide-react-native';
import { formatPower } from '../../utils/formatters';

interface PowerFlowIndicatorProps {
  packPower: number; // in kW
  packCurrent: number; // in A
  packVoltage: number; // in V
}

export const PowerFlowIndicator: React.FC<PowerFlowIndicatorProps> = ({
  packPower,
  packCurrent,
  packVoltage,
}) => {
  const isCharging = packCurrent > 0;
  const isIdle = Math.abs(packCurrent) < 0.2;
  const absPower = Math.abs(packPower);

  // Normalize power bar between 0 and 50kW max scale
  const maxScaleKw = 40;
  const fillPercent = Math.min(100, Math.max(5, (absPower / maxScaleKw) * 100));

  const flowColor = isIdle
    ? colors.textMuted
    : isCharging
    ? colors.statusCharging
    : colors.accentBlue;

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Zap size={14} color={flowColor} />
          <Text style={styles.title}>POWER FLOW DYNAMICS</Text>
        </View>
        <Text style={[styles.flowState, { color: flowColor }]}>
          {isIdle ? 'STANDBY / IDLE' : isCharging ? 'REGENERATION / CHARGE' : 'DRIVE DISCHARGE'}
        </Text>
      </View>

      <View style={styles.meterContainer}>
        {/* Dynamic Flow Bar */}
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${fillPercent}%`,
                backgroundColor: flowColor,
                shadowColor: flowColor,
              },
            ]}
          />
        </View>

        <View style={styles.flowMetrics}>
          <View style={styles.flowMetricItem}>
            {isCharging ? (
              <ArrowDownLeft size={16} color={colors.statusCharging} />
            ) : (
              <ArrowUpRight size={16} color={colors.accentBlue} />
            )}
            <Text style={styles.flowPowerText}>{formatPower(packPower, 2)}</Text>
          </View>
          <Text style={styles.scaleText}>PEAK RATED: 40 kW</Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  flowState: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  meterContainer: {
    marginTop: 4,
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  flowMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  flowMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flowPowerText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  scaleText: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
