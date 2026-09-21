import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PredictionInputFeatures } from '../../models/prediction.types';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { Layers, ChevronDown, ChevronUp, Braces } from 'lucide-react-native';

interface FeatureTensorViewProps {
  features: PredictionInputFeatures | null;
}

const FEATURE_DEFINITIONS = [
  { key: 'pack_voltage_v', label: 'Pack Voltage (V)', unit: 'V' },
  { key: 'pack_current_a', label: 'Pack Current (A)', unit: 'A' },
  { key: 'soc_percent', label: 'State of Charge (%)', unit: '%' },
  { key: 'soh_percent', label: 'State of Health (%)', unit: '%' },
  { key: 'avg_cell_voltage_v', label: 'Average Cell Voltage (V)', unit: 'V' },
  { key: 'min_cell_voltage_v', label: 'Minimum Cell Voltage (V)', unit: 'V' },
  { key: 'max_cell_voltage_v', label: 'Maximum Cell Voltage (V)', unit: 'V' },
  { key: 'delta_cell_voltage_v', label: 'Cell Voltage Delta (V)', unit: 'V' },
  { key: 'avg_temp_c', label: 'Average Temperature (°C)', unit: '°C' },
  { key: 'max_temp_c', label: 'Maximum Temperature (°C)', unit: '°C' },
  { key: 'temp_variance', label: 'Thermal Variance (σ²)', unit: 'var' },
  { key: 'cycle_count', label: 'Total Cycle Count', unit: 'cycles' },
  { key: 'insulation_resistance_kohm', label: 'Insulation Resistance (kΩ)', unit: 'kΩ' },
];

export const FeatureTensorView: React.FC<FeatureTensorViewProps> = ({ features }) => {
  const [expanded, setExpanded] = useState(true);

  if (!features) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Layers size={16} color={colors.primary} />
            <Text style={styles.title}>ENGINEERED INPUT FEATURES TENSOR</Text>
          </View>
        </View>
        <Text style={styles.noFeatures}>Awaiting active BMS telemetry frame...</Text>
      </GlassCard>
    );
  }

  const tensorValues = features.rawFeatureVector;

  return (
    <GlassCard style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.titleRow}>
          <Layers size={16} color={colors.primary} />
          <Text style={styles.title}>ENGINEERED INPUT FEATURES (13 TENSOR DIMS)</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.dimBadge}>
            <Braces size={12} color={colors.primary} />
            <Text style={styles.dimText}>float32[1, 13]</Text>
          </View>
          {expanded ? (
            <ChevronUp size={16} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Feature Table */}
      {expanded && (
        <View style={styles.tensorTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.thIdx}>#</Text>
            <Text style={styles.thFeature}>FEATURE NAME</Text>
            <Text style={styles.thValue}>SCALED VALUE</Text>
          </View>

          {FEATURE_DEFINITIONS.map((def, idx) => {
            const rawVal = tensorValues[idx] !== undefined ? tensorValues[idx] : 0;
            return (
              <View
                key={def.key}
                style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
              >
                <Text style={styles.tdIdx}>[{idx}]</Text>
                <View style={styles.tdFeatureCol}>
                  <Text style={styles.tdKey}>{def.key}</Text>
                  <Text style={styles.tdDesc}>{def.label}</Text>
                </View>
                <View style={styles.tdValCol}>
                  <Text style={styles.tdValue}>{rawVal}</Text>
                  <Text style={styles.tdUnit}>{def.unit}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 212, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  dimText: {
    fontSize: 10,
    fontFamily: typography.fontFamilyMono,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  noFeatures: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  tensorTable: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
  },
  thIdx: {
    width: 28,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.bold,
  },
  thFeature: {
    flex: 1,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.bold,
  },
  thValue: {
    width: 90,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.backgroundSecondary,
  },
  tableRowAlt: {
    backgroundColor: 'rgba(14, 22, 38, 0.5)',
  },
  tdIdx: {
    width: 28,
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: typography.fontFamilyMono,
  },
  tdFeatureCol: {
    flex: 1,
  },
  tdKey: {
    fontSize: 11,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
    fontWeight: typography.fontWeight.medium,
  },
  tdDesc: {
    fontSize: 9,
    color: colors.textMuted,
  },
  tdValCol: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 4,
  },
  tdValue: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    fontFamily: typography.fontFamilyMono,
  },
  tdUnit: {
    fontSize: 9,
    color: colors.textMuted,
  },
});
