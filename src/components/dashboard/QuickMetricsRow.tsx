import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '../common/StatCard';
import { colors, spacing } from '../../utils/theme';
import { Activity, Gauge, Flame, Cpu } from 'lucide-react-native';
import { formatCurrent, formatMillivolts, formatTemperature, formatVoltage } from '../../utils/formatters';

interface QuickMetricsRowProps {
  packVoltage: number;
  packCurrent: number;
  deltaCellVoltage: number;
  avgTemperature: number;
  maxTemperature: number;
  cycleCount: number;
}

export const QuickMetricsRow: React.FC<QuickMetricsRowProps> = ({
  packVoltage,
  packCurrent,
  deltaCellVoltage,
  avgTemperature,
  maxTemperature,
  cycleCount,
}) => {
  const isCharging = packCurrent > 0;
  const deltaMv = deltaCellVoltage * 1000;
  const isHighDelta = deltaMv > 50;
  const isHighTemp = maxTemperature > 45;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard
          label="Pack Voltage"
          value={packVoltage ? packVoltage.toFixed(2) : '--'}
          unit="V"
          subValue="Total String Output"
          icon={<Gauge size={16} color={colors.primary} />}
          accentColor={colors.primary}
        />
        <StatCard
          label="Pack Current"
          value={packCurrent ? (isCharging ? `+${packCurrent.toFixed(1)}` : packCurrent.toFixed(1)) : '--'}
          unit="A"
          subValue={isCharging ? 'Charge Flow' : 'Discharge Flow'}
          icon={<Activity size={16} color={isCharging ? colors.statusCharging : colors.accentBlue} />}
          accentColor={isCharging ? colors.statusCharging : colors.accentBlue}
        />
      </View>

      <View style={styles.row}>
        <StatCard
          label="Delta V (Imbalance)"
          value={deltaMv ? deltaMv.toFixed(0) : '--'}
          unit="mV"
          subValue={isHighDelta ? 'High Variance' : 'Well Balanced'}
          icon={<Cpu size={16} color={isHighDelta ? colors.accentAmber : colors.primary} />}
          accentColor={isHighDelta ? colors.accentAmber : colors.primary}
        />
        <StatCard
          label="Pack Temp"
          value={avgTemperature ? avgTemperature.toFixed(1) : '--'}
          unit="°C"
          subValue={`Max: ${formatTemperature(maxTemperature)}`}
          icon={<Flame size={16} color={isHighTemp ? colors.accentRed : colors.accentAmber} />}
          accentColor={isHighTemp ? colors.accentRed : colors.accentAmber}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
