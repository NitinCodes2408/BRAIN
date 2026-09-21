import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CellVoltage } from '../../models/bms.types';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { Cpu, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react-native';
import { formatMillivolts, formatVoltage } from '../../utils/formatters';

interface CellMatrixGridProps {
  cells: CellVoltage[];
  minCell: { cellId: number; voltage: number };
  maxCell: { cellId: number; voltage: number };
  deltaV: number;
}

export const CellMatrixGrid: React.FC<CellMatrixGridProps> = ({
  cells,
  minCell,
  maxCell,
  deltaV,
}) => {
  const deltaMv = deltaV * 1000;

  // Voltage scaling range for cell fill bar: 3.0V (empty) to 4.2V (full)
  const getCellFillPercent = (v: number) => {
    return Math.min(100, Math.max(0, ((v - 3.0) / 1.2) * 100));
  };

  const getCellColor = (cell: CellVoltage) => {
    if (cell.id === minCell.cellId && deltaMv > 40) return colors.accentAmber;
    if (cell.id === maxCell.cellId && deltaMv > 40) return colors.accentRed;
    if (cell.status === 'low') return colors.accentAmber;
    if (cell.status === 'high' || cell.status === 'critical') return colors.accentRed;
    return colors.primary;
  };

  return (
    <GlassCard style={styles.container}>
      {/* Header Summary */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Cpu size={16} color={colors.primary} />
          <Text style={styles.title}>16S CELL VOLTAGE MATRIX</Text>
        </View>
        <View style={styles.deltaBadge}>
          <Text style={styles.deltaText}>Δ {formatMillivolts(deltaV)}</Text>
        </View>
      </View>

      {/* Min / Max Outlier Callouts */}
      <View style={styles.outlierRow}>
        <View style={styles.outlierItem}>
          <ArrowDown size={14} color={colors.accentAmber} />
          <Text style={styles.outlierLabel}>MIN CELL #{minCell.cellId}:</Text>
          <Text style={[styles.outlierValue, { color: colors.accentAmber }]}>
            {formatVoltage(minCell.voltage, 3)}
          </Text>
        </View>

        <View style={styles.outlierDivider} />

        <View style={styles.outlierItem}>
          <ArrowUp size={14} color={colors.accentRed} />
          <Text style={styles.outlierLabel}>MAX CELL #{maxCell.cellId}:</Text>
          <Text style={[styles.outlierValue, { color: colors.accentRed }]}>
            {formatVoltage(maxCell.voltage, 3)}
          </Text>
        </View>
      </View>

      {/* 4x4 Grid of 16 Cells */}
      <View style={styles.grid}>
        {cells.map((cell) => {
          const isMin = cell.id === minCell.cellId;
          const isMax = cell.id === maxCell.cellId;
          const cellColor = getCellColor(cell);
          const fillPercent = getCellFillPercent(cell.voltage);

          return (
            <View
              key={`cell-${cell.id}`}
              style={[
                styles.cellCard,
                isMin && styles.cellMinBorder,
                isMax && styles.cellMaxBorder,
              ]}
            >
              {/* Top Cell Tag */}
              <View style={styles.cellTop}>
                <Text style={styles.cellIndex}>#{cell.id}</Text>
                {cell.balanceActive && (
                  <View style={styles.balanceIndicator}>
                    <RefreshCw size={9} color={colors.primary} />
                  </View>
                )}
              </View>

              {/* Cell Voltage */}
              <Text style={[styles.cellVoltage, { color: cellColor }]}>
                {cell.voltage ? cell.voltage.toFixed(3) : '--'}
              </Text>
              <Text style={styles.cellUnit}>V</Text>

              {/* Miniature Fill Level Bar */}
              <View style={styles.miniBarBg}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: `${fillPercent}%`,
                      backgroundColor: cellColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Balancing Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
        <View style={styles.legendItem}>
          <RefreshCw size={10} color={colors.primary} />
          <Text style={styles.legendText}>Balancing Active</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accentAmber }]} />
          <Text style={styles.legendText}>Min Delta</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accentRed }]} />
          <Text style={styles.legendText}>Max Delta</Text>
        </View>
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
    marginBottom: spacing.sm,
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
  deltaBadge: {
    backgroundColor: 'rgba(0, 245, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  deltaText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  outlierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  outlierItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outlierLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  outlierValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  outlierDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cellCard: {
    width: '23%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  cellMinBorder: {
    borderColor: colors.accentAmber,
  },
  cellMaxBorder: {
    borderColor: colors.accentRed,
  },
  cellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
  },
  cellIndex: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.bold,
  },
  balanceIndicator: {
    padding: 1,
  },
  cellVoltage: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  cellUnit: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: -2,
  },
  miniBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 9,
    color: colors.textMuted,
  },
});
