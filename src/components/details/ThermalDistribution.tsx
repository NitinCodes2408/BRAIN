import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThermalProbe } from '../../models/bms.types';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { Flame, Thermometer } from 'lucide-react-native';
import { formatTemperature } from '../../utils/formatters';

interface ThermalDistributionProps {
  probes: ThermalProbe[];
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
}

export const ThermalDistribution: React.FC<ThermalDistributionProps> = ({
  probes,
  avgTemp,
  maxTemp,
  minTemp,
}) => {
  const tempSpread = maxTemp - minTemp;

  const getTempColor = (temp: number) => {
    if (temp >= 50) return colors.accentRed;
    if (temp >= 40) return colors.accentAmber;
    if (temp <= 10) return colors.accentBlue;
    return colors.primary;
  };

  return (
    <GlassCard style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Flame size={16} color={colors.accentAmber} />
          <Text style={styles.title}>THERMAL SENSOR DISTRIBUTION</Text>
        </View>
        <Text style={styles.spreadText}>Spread: {tempSpread.toFixed(1)}°C</Text>
      </View>

      {/* Overview Stat Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MIN PROBE</Text>
          <Text style={[styles.statVal, { color: getTempColor(minTemp) }]}>
            {formatTemperature(minTemp)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PACK AVERAGE</Text>
          <Text style={[styles.statVal, { color: getTempColor(avgTemp) }]}>
            {formatTemperature(avgTemp)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MAX PROBE</Text>
          <Text style={[styles.statVal, { color: getTempColor(maxTemp) }]}>
            {formatTemperature(maxTemp)}
          </Text>
        </View>
      </View>

      {/* List of Probes */}
      <View style={styles.probesList}>
        {probes.map((probe) => {
          const probeColor = getTempColor(probe.temperature);
          // Scale percent between 15°C and 60°C
          const fillPercent = Math.min(
            100,
            Math.max(5, ((probe.temperature - 15) / 45) * 100)
          );

          return (
            <View key={`probe-${probe.id}`} style={styles.probeItem}>
              <View style={styles.probeHeader}>
                <View style={styles.probeLabelRow}>
                  <Thermometer size={14} color={probeColor} />
                  <Text style={styles.probeName}>{probe.location}</Text>
                </View>
                <Text style={[styles.probeTemp, { color: probeColor }]}>
                  {formatTemperature(probe.temperature)}
                </Text>
              </View>

              {/* Gradient Temperature Bar */}
              <View style={styles.probeBarBg}>
                <View
                  style={[
                    styles.probeBarFill,
                    {
                      width: `${fillPercent}%`,
                      backgroundColor: probeColor,
                      shadowColor: probeColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
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
  spreadText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
  statVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  probesList: {
    gap: spacing.sm,
  },
  probeItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  probeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  probeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  probeName: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  probeTemp: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  probeBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  probeBarFill: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 2,
  },
});
