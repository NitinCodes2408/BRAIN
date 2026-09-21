import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius } from '../../utils/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glowCyan' | 'glowPurple' | 'glowRed' | 'flat';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'glowCyan':
        return styles.glowCyan;
      case 'glowPurple':
        return styles.glowPurple;
      case 'glowRed':
        return styles.glowRed;
      case 'flat':
        return styles.flat;
      default:
        return styles.default;
    }
  };

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  default: {
    borderColor: colors.cardBorder,
  },
  flat: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.cardBorderSubtle,
  },
  glowCyan: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  glowPurple: {
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  glowRed: {
    borderColor: colors.accentRed,
    shadowColor: colors.accentRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
});
