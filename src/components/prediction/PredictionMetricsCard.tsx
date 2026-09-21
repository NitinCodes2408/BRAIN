import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PredictionResult, PredictionExecutionState } from '../../models/prediction.types';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { Activity, Play, Sparkles, ShieldAlert, TrendingDown, Clock } from 'lucide-react-native';

interface PredictionMetricsCardProps {
  lastResult: PredictionResult | null;
  executionState: PredictionExecutionState;
  onRunInference: () => void;
}

export const PredictionMetricsCard: React.FC<PredictionMetricsCardProps> = ({
  lastResult,
  executionState,
  onRunInference,
}) => {
  const isInferring = executionState === 'inferring';

  return (
    <GlassCard style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={styles.title}>MODEL PREDICTION TARGETS</Text>
        </View>

        <TouchableOpacity
          style={[styles.runBtn, isInferring && styles.runBtnDisabled]}
          onPress={onRunInference}
          disabled={isInferring}
          activeOpacity={0.8}
        >
          {isInferring ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <Play size={13} color="#000000" />
              <Text style={styles.runBtnText}>EXECUTE PIPELINE</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Target Grid */}
      <View style={styles.grid}>
        {/* Remaining Useful Life (RUL) */}
        <View style={styles.targetCard}>
          <View style={styles.cardHeader}>
            <Clock size={14} color={colors.primary} />
            <Text style={styles.cardTitle}>Remaining Useful Life (RUL)</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.placeholderValue}>
              {lastResult?.remainingUsefulLifeCycles !== null && lastResult?.remainingUsefulLifeCycles !== undefined
                ? `${lastResult.remainingUsefulLifeCycles} Cycles`
                : '-- Cycles'}
            </Text>
          </View>
          <Text style={styles.cardSub}>Until 80.0% SOH End-of-Life Threshold</Text>
        </View>

        {/* SOH Degradation Trajectory */}
        <View style={styles.targetCard}>
          <View style={styles.cardHeader}>
            <TrendingDown size={14} color={colors.secondaryLight} />
            <Text style={styles.cardTitle}>Projected Degradation</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.placeholderValue, { color: colors.secondaryLight }]}>
              {lastResult?.projectedSoh !== null && lastResult?.projectedSoh !== undefined
                ? `${lastResult.projectedSoh.toFixed(1)}%`
                : '-- %'}
            </Text>
          </View>
          <Text style={styles.cardSub}>Trajectory curve over next 1,000 cycles</Text>
        </View>

        {/* Thermal Runaway Risk Index */}
        <View style={styles.targetCard}>
          <View style={styles.cardHeader}>
            <ShieldAlert size={14} color={colors.accentAmber} />
            <Text style={styles.cardTitle}>Thermal Runaway Risk Index</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.placeholderValue, { color: colors.accentAmber }]}>
              {lastResult?.thermalRunawayRiskScore !== null && lastResult?.thermalRunawayRiskScore !== undefined
                ? `${(lastResult.thermalRunawayRiskScore * 100).toFixed(1)}%`
                : '-- %'}
            </Text>
          </View>
          <Text style={styles.cardSub}>Multi-probe temperature gradient matrix</Text>
        </View>

        {/* BMS Telemetry Anomaly Score */}
        <View style={styles.targetCard}>
          <View style={styles.cardHeader}>
            <Activity size={14} color={colors.accentBlue} />
            <Text style={styles.cardTitle}>Pack Anomaly Indicator</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.placeholderValue, { color: colors.accentBlue }]}>
              {lastResult?.anomalyScore !== null && lastResult?.anomalyScore !== undefined
                ? `${lastResult.anomalyScore.toFixed(2)}`
                : '--'}
            </Text>
          </View>
          <Text style={styles.cardSub}>Deviation from nominal battery manifold</Text>
        </View>
      </View>

      {/* Model State Info Footer */}
      <View style={styles.statusFooter}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          {lastResult?.status === 'pending_model_execution'
            ? 'Feature tensor extracted & validated. Ready for .pkl inference backend execution.'
            : 'Feature extraction pipeline initialized. Ready to evaluate live telemetry.'}
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
    gap: 6,
  },
  title: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  runBtnDisabled: {
    opacity: 0.6,
  },
  runBtnText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  targetCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  valueRow: {
    marginVertical: 4,
  },
  placeholderValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    fontFamily: typography.fontFamilyMono,
  },
  cardSub: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 12,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 10,
    color: colors.textSecondary,
    flex: 1,
  },
});
