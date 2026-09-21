import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TelemetryLogEntry } from '../../storage/logStorage';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { formatMillivolts, formatTemperature, formatTimestamp, formatVoltage } from '../../utils/formatters';
import { Activity, Clock, ShieldCheck, AlertTriangle } from 'lucide-react-native';

interface HistoryLogItemProps {
  entry: TelemetryLogEntry;
}

export const HistoryLogItem: React.FC<HistoryLogItemProps> = ({ entry }) => {
  const { telemetry, timestamp } = entry;
  const hasAlerts = telemetry.faults && telemetry.faults.length > 0;
  const isCharging = telemetry.packCurrent > 0;

  return (
    <View style={[styles.container, hasAlerts && styles.containerAlert]}>
      {/* Time & SoC Header */}
      <View style={styles.topRow}>
        <View style={styles.timeBox}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={styles.timeText}>{formatTimestamp(timestamp)}</Text>
        </View>

        <View style={styles.statusBox}>
          {hasAlerts ? (
            <View style={styles.alertPill}>
              <AlertTriangle size={10} color={colors.accentRed} />
              <Text style={styles.alertText}>FAULT ACTIVE</Text>
            </View>
          ) : (
            <View style={styles.normalPill}>
              <ShieldCheck size={10} color={colors.statusCharging} />
              <Text style={styles.normalText}>
                {isCharging ? 'CHARGING' : 'NOMINAL'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Metric Breakdown */}
      <View style={styles.metricRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>SoC</Text>
          <Text style={styles.metricValue}>{telemetry.soc.toFixed(1)}%</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>VOLTAGE</Text>
          <Text style={styles.metricValue}>
            {formatVoltage(telemetry.packVoltage, 1)}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CURRENT</Text>
          <Text
            style={[
              styles.metricValue,
              { color: isCharging ? colors.statusCharging : colors.accentBlue },
            ]}
          >
            {telemetry.packCurrent ? `${telemetry.packCurrent.toFixed(1)}A` : '--'}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>DELTA V</Text>
          <Text style={styles.metricValue}>
            {formatMillivolts(telemetry.deltaCellVoltage)}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TEMP</Text>
          <Text style={styles.metricValue}>
            {formatTemperature(telemetry.avgTemperature)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  containerAlert: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  statusBox: {},
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  alertText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.accentRed,
  },
  normalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 239, 125, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  normalText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.statusCharging,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
  metricValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.bold,
    marginTop: 1,
  },
});
