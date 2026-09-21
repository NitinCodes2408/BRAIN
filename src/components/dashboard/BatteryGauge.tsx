import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing, shadows } from '../../utils/theme';
import { Zap, BatteryCharging, ShieldCheck } from 'lucide-react-native';
import { formatPower, formatVoltage } from '../../utils/formatters';

interface BatteryGaugeProps {
  soc: number; // 0 - 100
  soh: number; // 0 - 100
  packVoltage: number;
  packPower: number;
  packCurrent: number;
  estimatedRangeKm: number;
  batteryStatus: 'charging' | 'discharging' | 'standby' | 'alert';
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  soc,
  soh,
  packVoltage,
  packPower,
  packCurrent,
  estimatedRangeKm,
  batteryStatus,
}) => {
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Gauge spans 240 degrees (from 150 deg to 390 deg)
  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, end);
    const endPoint = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y}`;
  };

  const clampedSoc = Math.min(100, Math.max(0, soc));
  const currentAngle = startAngle + (totalAngle * clampedSoc) / 100;

  const bgPath = describeArc(center, center, radius, startAngle, endAngle);
  const activePath = describeArc(center, center, radius, startAngle, currentAngle);

  const getSocColor = () => {
    if (batteryStatus === 'charging') return colors.statusCharging;
    if (clampedSoc <= 15) return colors.accentRed;
    if (clampedSoc <= 30) return colors.accentAmber;
    return colors.primary;
  };

  const socColor = getSocColor();

  return (
    <View style={styles.container}>
      <View style={styles.gaugeWrapper}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <LinearGradient id="socGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.secondary} />
              <Stop offset="60%" stopColor={colors.accentBlue} />
              <Stop offset="100%" stopColor={socColor} />
            </LinearGradient>
          </Defs>

          {/* Background Track */}
          <Path
            d={bgPath}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Inner Accent Ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius - 16}
            stroke="rgba(0, 245, 212, 0.06)"
            strokeWidth={1}
            strokeDasharray="4 6"
            fill="none"
          />

          {/* Active SoC Arc */}
          {clampedSoc > 0 && (
            <Path
              d={activePath}
              stroke="url(#socGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </Svg>

        {/* Center Gauge Telemetry Information */}
        <View style={styles.centerContent}>
          {batteryStatus === 'charging' ? (
            <View style={styles.statusRow}>
              <BatteryCharging size={16} color={colors.statusCharging} />
              <Text style={[styles.statusText, { color: colors.statusCharging }]}>CHARGING</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Zap size={14} color={socColor} />
              <Text style={[styles.statusText, { color: socColor }]}>
                {batteryStatus.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.socRow}>
            <Text style={[styles.socValue, { color: socColor }]}>{clampedSoc.toFixed(0)}</Text>
            <Text style={[styles.socUnit, { color: socColor }]}>%</Text>
          </View>

          <Text style={styles.rangeText}>{estimatedRangeKm} km EST. RANGE</Text>

          <View style={styles.subStatsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniLabel}>VOLTAGE</Text>
              <Text style={styles.miniValue}>{formatVoltage(packVoltage, 1)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniLabel}>POWER</Text>
              <Text style={styles.miniValue}>{formatPower(packPower, 1)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* SOH Secondary Pill */}
      <View style={styles.sohPill}>
        <ShieldCheck size={14} color={colors.primary} />
        <Text style={styles.sohLabel}>STATE OF HEALTH (SOH):</Text>
        <Text style={styles.sohValue}>{soh.toFixed(1)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  gaugeWrapper: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  socRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  socValue: {
    fontSize: 54,
    fontWeight: typography.fontWeight.black,
    letterSpacing: -1,
  },
  socUnit: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginLeft: 2,
  },
  rangeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
    marginTop: -2,
    marginBottom: 8,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  miniStat: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
  miniValue: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.bold,
  },
  sohPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
    marginTop: -10,
  },
  sohLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  sohValue: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});
