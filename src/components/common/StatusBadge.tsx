import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../utils/theme';

interface StatusBadgeProps {
  label: string;
  status?: 'normal' | 'charging' | 'discharging' | 'warning' | 'critical' | 'standby';
  dotOnly?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  status = 'normal',
  dotOnly = false,
}) => {
  const getBadgeColor = () => {
    switch (status) {
      case 'charging':
        return colors.statusCharging;
      case 'discharging':
        return colors.statusDischarging;
      case 'warning':
        return colors.statusWarning;
      case 'critical':
        return colors.statusCritical;
      case 'standby':
        return colors.statusStandby;
      default:
        return colors.statusNormal;
    }
  };

  const color = getBadgeColor();

  if (dotOnly) {
    return <View style={[styles.dot, { backgroundColor: color, shadowColor: color }]} />;
  }

  return (
    <View style={[styles.badge, { borderColor: `${color}40`, backgroundColor: `${color}15` }]}>
      <View style={[styles.dot, { backgroundColor: color, shadowColor: color }]} />
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
});
