/**
 * Design Tokens & Theme for EV Battery Intelligence System
 * Sleek Automotive Dark UI with Electric Neon Accents
 */

export const colors = {
  // Backgrounds
  background: '#070B14', // Deep cyber abyss
  backgroundSecondary: '#0E1626', // Elevation card 1
  cardBackground: '#131F37', // Elevation card 2
  cardBackgroundGlass: 'rgba(19, 31, 55, 0.75)',
  cardBorder: 'rgba(0, 245, 212, 0.15)',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.08)',

  // Brand / Electric Accents
  primary: '#00F5D4', // Electric Cyan / Mint
  primaryGlow: 'rgba(0, 245, 212, 0.25)',
  primaryDark: '#00BFA5',
  
  secondary: '#7928CA', // Cyber Purple
  secondaryLight: '#9D4EDD',
  secondaryGlow: 'rgba(121, 40, 202, 0.25)',

  accentBlue: '#0070F3', // Cobalt Blue
  accentAmber: '#FFB800', // Warning Amber
  accentRed: '#FF3B30', // Alert Crimson
  accentGreen: '#10B981', // Healthy Emerald

  // Telemetry status colors
  statusNormal: '#00F5D4',
  statusCharging: '#38EF7D',
  statusDischarging: '#0070F3',
  statusWarning: '#FFB800',
  statusCritical: '#FF3B30',
  statusStandby: '#8899A6',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textHighlight: '#00F5D4',

  // UI accents
  divider: 'rgba(255, 255, 255, 0.06)',
  gridLine: 'rgba(0, 245, 212, 0.05)',
  tabBarBg: '#0A0F1D',
  tabBarBorder: 'rgba(0, 245, 212, 0.12)',
};

export const typography = {
  fontFamilyMono: 'monospace',
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  full: 9999,
};

export const shadows = {
  glowCyan: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowPurple: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowRed: {
    shadowColor: colors.accentRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};
