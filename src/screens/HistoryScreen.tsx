import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/common/Header';
import { TelemetryChart } from '../components/history/TelemetryChart';
import { HistoryLogItem } from '../components/history/HistoryLogItem';
import { GlassCard } from '../components/common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { getTelemetryLogs, clearTelemetryLogs, TelemetryLogEntry } from '../storage/logStorage';
import { useBattery } from '../context/BatteryContext';
import { History, Trash2, RefreshCw, Layers } from 'lucide-react-native';

export const HistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { telemetry } = useBattery();
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    const fetched = await getTelemetryLogs();
    setLogs(fetched);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [telemetry, fetchLogs]);

  const handleClearLogs = async () => {
    await clearTelemetryLogs();
    setLogs([]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Telemetry History & Trends" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SVG Multi-Metric Telemetry Trend Chart */}
        <TelemetryChart logs={logs} />

        {/* History Summary Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>RECORDED SAMPLES</Text>
            <Text style={styles.summaryValue}>{logs.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>BUFFER CAPACITY</Text>
            <Text style={styles.summaryValue}>150 Frames</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearLogs}
            activeOpacity={0.7}
          >
            <Trash2 size={13} color={colors.accentRed} />
            <Text style={styles.clearBtnText}>CLEAR</Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry Log List */}
        <View style={styles.logsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Layers size={14} color={colors.primary} />
              <Text style={styles.sectionTitle}>CHRONOLOGICAL LOGS</Text>
            </View>
            <Text style={styles.sectionSub}>Latest 50 Telemetry Packets</Text>
          </View>

          {logs.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No telemetry logs recorded. Start telemetry streaming to capture frames.
              </Text>
            </GlassCard>
          ) : (
            logs.slice(0, 50).map((entry) => (
              <HistoryLogItem key={entry.id} entry={entry} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    gap: 4,
  },
  clearBtnText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.accentRed,
  },
  logsSection: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
