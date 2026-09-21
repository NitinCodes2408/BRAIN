import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { TrendingUp, Activity, Flame, Cpu } from 'lucide-react-native';
import { TelemetryLogEntry } from '../../storage/logStorage';

interface TelemetryChartProps {
  logs: TelemetryLogEntry[];
}

type MetricType = 'voltage' | 'current' | 'temperature' | 'deltaV';

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ logs }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('voltage');

  const width = Math.min(360, Dimensions.get('window').width - 48);
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;

  // We show up to 20 recent data points
  const points = logs.slice(0, 20).reverse();

  const getMetricData = (m: MetricType) => {
    switch (m) {
      case 'voltage':
        return {
          title: 'PACK VOLTAGE (V)',
          color: colors.primary,
          values: points.map((p) => p.telemetry.packVoltage),
          unit: 'V',
        };
      case 'current':
        return {
          title: 'PACK CURRENT (A)',
          color: colors.accentBlue,
          values: points.map((p) => p.telemetry.packCurrent),
          unit: 'A',
        };
      case 'temperature':
        return {
          title: 'AVG TEMPERATURE (°C)',
          color: colors.accentAmber,
          values: points.map((p) => p.telemetry.avgTemperature),
          unit: '°C',
        };
      case 'deltaV':
        return {
          title: 'DELTA VOLTAGE (mV)',
          color: colors.secondaryLight,
          values: points.map((p) => p.telemetry.deltaCellVoltage * 1000),
          unit: 'mV',
        };
    }
  };

  const currentData = getMetricData(selectedMetric);
  const values = currentData.values;

  let minVal = values.length > 0 ? Math.min(...values) : 0;
  let maxVal = values.length > 0 ? Math.max(...values) : 100;

  // Add padding to range
  const range = maxVal - minVal || 1;
  const paddedMin = minVal - range * 0.1;
  const paddedMax = maxVal + range * 0.1;
  const effectiveRange = paddedMax - paddedMin || 1;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (index: number) => {
    if (values.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (values.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const normalized = (val - paddedMin) / effectiveRange;
    return height - paddingY - normalized * chartHeight;
  };

  let pathD = '';
  let areaD = '';

  if (values.length > 0) {
    values.forEach((v, idx) => {
      const x = getX(idx);
      const y = getY(v);
      if (idx === 0) {
        pathD = `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    const firstX = getX(0);
    const lastX = getX(values.length - 1);
    const baselineY = height - paddingY;
    areaD = `${pathD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }

  return (
    <GlassCard style={styles.container}>
      {/* Metric Selector Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedMetric === 'voltage' && styles.tabActive]}
          onPress={() => setSelectedMetric('voltage')}
        >
          <Text
            style={[styles.tabText, selectedMetric === 'voltage' && styles.tabTextActive]}
          >
            VOLTAGE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedMetric === 'current' && styles.tabActive]}
          onPress={() => setSelectedMetric('current')}
        >
          <Text
            style={[styles.tabText, selectedMetric === 'current' && styles.tabTextActive]}
          >
            CURRENT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedMetric === 'temperature' && styles.tabActive]}
          onPress={() => setSelectedMetric('temperature')}
        >
          <Text
            style={[
              styles.tabText,
              selectedMetric === 'temperature' && styles.tabTextActive,
            ]}
          >
            TEMP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedMetric === 'deltaV' && styles.tabActive]}
          onPress={() => setSelectedMetric('deltaV')}
        >
          <Text
            style={[styles.tabText, selectedMetric === 'deltaV' && styles.tabTextActive]}
          >
            DELTA V
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Title */}
      <View style={styles.header}>
        <Text style={styles.chartTitle}>{currentData.title}</Text>
        <Text style={[styles.latestVal, { color: currentData.color }]}>
          {values.length > 0
            ? `${values[values.length - 1].toFixed(1)} ${currentData.unit}`
            : '--'}
        </Text>
      </View>

      {/* SVG Chart Graphic */}
      <View style={styles.svgContainer}>
        {values.length === 0 ? (
          <View style={styles.noDataBox}>
            <Text style={styles.noDataText}>No telemetry history captured yet.</Text>
          </View>
        ) : (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={currentData.color} stopOpacity={0.35} />
                <Stop offset="100%" stopColor={currentData.color} stopOpacity={0.0} />
              </LinearGradient>
            </Defs>

            {/* Grid Horizontal Lines */}
            <Line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <Line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <Line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth={1}
            />

            {/* Y Axis Labels */}
            <SvgText
              x={paddingX - 6}
              y={paddingY + 4}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {maxVal.toFixed(0)}
            </SvgText>
            <SvgText
              x={paddingX - 6}
              y={height - paddingY}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {minVal.toFixed(0)}
            </SvgText>

            {/* Fill Area */}
            {areaD ? <Path d={areaD} fill="url(#chartGrad)" /> : null}

            {/* Main Trend Line */}
            {pathD ? (
              <Path
                d={pathD}
                stroke={currentData.color}
                strokeWidth={2.5}
                fill="none"
              />
            ) : null}

            {/* Data Point Dots */}
            {values.map((v, idx) => {
              const cx = getX(idx);
              const cy = getY(v);
              const isLast = idx === values.length - 1;
              return (
                <Circle
                  key={`dot-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={isLast ? 4 : 2.5}
                  fill={isLast ? '#FFFFFF' : currentData.color}
                  stroke={currentData.color}
                  strokeWidth={isLast ? 2 : 1}
                />
              );
            })}
          </Svg>
        )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  latestVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamilyMono,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  noDataBox: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
