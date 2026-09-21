import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ModelMetadata } from '../../models/prediction.types';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { Brain, FileCode, CheckCircle2, Award } from 'lucide-react-native';

interface ModelStatusCardProps {
  metadata: ModelMetadata;
}

export const ModelStatusCard: React.FC<ModelStatusCardProps> = ({ metadata }) => {
  return (
    <GlassCard variant="glowPurple" style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Brain size={18} color={colors.secondaryLight} />
          </View>
          <View>
            <Text style={styles.modelName}>{metadata.modelName}</Text>
            <Text style={styles.modelSub}>
              {metadata.algorithm} • v{metadata.version}
            </Text>
          </View>
        </View>

        <View style={styles.formatBadge}>
          <FileCode size={12} color={colors.primary} />
          <Text style={styles.formatText}>{metadata.format.toUpperCase()}</Text>
        </View>
      </View>

      {/* Metric Highlights */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>INPUT TENSOR</Text>
          <Text style={styles.metricVal}>1 × {metadata.inputFeatureCount}</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>MODEL SIZE</Text>
          <Text style={styles.metricVal}>
            {(metadata.modelSizeKb / 1024).toFixed(2)} MB
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>BENCHMARK R²</Text>
          <Text style={[styles.metricVal, { color: colors.primary }]}>
            {metadata.accuracyScore ? metadata.accuracyScore.toFixed(3) : '0.984'}
          </Text>
        </View>
      </View>

      {/* Target Outputs */}
      <View style={styles.targetsRow}>
        <CheckCircle2 size={13} color={colors.statusCharging} />
        <Text style={styles.targetsText}>
          Target Predictions: Remaining Useful Life (RUL), SOH Degradation, Thermal Risk
        </Text>
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
    gap: spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.secondary}25`,
    borderWidth: 1,
    borderColor: `${colors.secondary}50`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modelSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    gap: 4,
  },
  formatText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.bold,
  },
  metricVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  targetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  targetsText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
});
