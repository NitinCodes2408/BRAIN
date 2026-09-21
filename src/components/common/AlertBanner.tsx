import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BmsFault } from '../../models/bms.types';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react-native';

interface AlertBannerProps {
  alerts: BmsFault[];
  onPressAlert?: (alert: BmsFault) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onPressAlert }) => {
  if (!alerts || alerts.length === 0) return null;

  const highestSeverity = alerts.some((a) => a.severity === 'critical')
    ? 'critical'
    : alerts.some((a) => a.severity === 'warning')
    ? 'warning'
    : 'info';

  const bannerBg =
    highestSeverity === 'critical'
      ? `${colors.accentRed}1A`
      : highestSeverity === 'warning'
      ? `${colors.accentAmber}1A`
      : `${colors.accentBlue}1A`;

  const bannerBorder =
    highestSeverity === 'critical'
      ? colors.accentRed
      : highestSeverity === 'warning'
      ? colors.accentAmber
      : colors.accentBlue;

  const iconColor =
    highestSeverity === 'critical'
      ? colors.accentRed
      : highestSeverity === 'warning'
      ? colors.accentAmber
      : colors.accentBlue;

  const topAlert = alerts[0];

  return (
    <View style={[styles.container, { backgroundColor: bannerBg, borderColor: bannerBorder }]}>
      <View style={styles.iconContainer}>
        {highestSeverity === 'critical' ? (
          <AlertCircle size={20} color={iconColor} />
        ) : (
          <AlertTriangle size={20} color={iconColor} />
        )}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: iconColor }]}>
            {topAlert.title.toUpperCase()}
          </Text>
          {alerts.length > 1 && (
            <View style={[styles.badge, { backgroundColor: iconColor }]}>
              <Text style={styles.badgeText}>+{alerts.length - 1} MORE</Text>
            </View>
          )}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {topAlert.message}
        </Text>
      </View>

      {onPressAlert && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onPressAlert(topAlert)}
        >
          <ChevronRight size={18} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  message: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  actionBtn: {
    paddingLeft: spacing.sm,
  },
});
