import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors, typography, spacing } from '../../utils/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  variant?: 'default' | 'glowCyan' | 'glowPurple' | 'glowRed';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subValue,
  icon,
  accentColor = colors.primary,
  variant = 'default',
}) => {
  return (
    <GlassCard variant={variant} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {icon && <View style={styles.iconBox}>{icon}</View>}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {subValue && <Text style={styles.subValue}>{subValue}</Text>}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  iconBox: {
    opacity: 0.85,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  unit: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  subValue: {
    marginTop: 4,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});
