import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { useBattery } from '../../context/BatteryContext';
import { Activity, Zap, Radio, RefreshCw } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Battery Intelligence',
  subtitle,
}) => {
  const { status, isStreaming, stepNext } = useBattery();

  const isBle = status.type === 'ble';
  const stateColor =
    status.state === 'streaming'
      ? colors.primary
      : status.state === 'connected'
      ? colors.accentGreen
      : status.state === 'error'
      ? colors.accentRed
      : colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Zap size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : (
              <Text style={styles.sourceTag}>
                {isBle ? 'BLE HARDWARE' : `JSON: ${status.sourceName}`}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          {/* Status Indicator Pill */}
          <View style={[styles.statusPill, { borderColor: `${stateColor}40` }]}>
            <View
              style={[
                styles.pulseDot,
                { backgroundColor: stateColor, shadowColor: stateColor },
              ]}
            />
            <Text style={[styles.statusText, { color: stateColor }]}>
              {status.state.toUpperCase()}
            </Text>
          </View>

          {/* Quick Step Frame Button */}
          {!isStreaming && status.type !== 'ble' && (
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={stepNext}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <RefreshCw size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  sourceTag: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
