import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { useBattery } from '../../context/BatteryContext';
import { Play, Pause, SkipForward, SkipBack, Database, Radio } from 'lucide-react-native';

export const DataSourceControls: React.FC = () => {
  const {
    status,
    isStreaming,
    startStreaming,
    pauseStreaming,
    stepNext,
    stepPrevious,
    loadDataset,
  } = useBattery();

  const isBle = status.type === 'ble';
  const isStressDataset = status.sourceName.includes('high_stress');

  const toggleDataset = () => {
    if (isStressDataset) {
      loadDataset('sample_bms_telemetry.json');
    } else {
      loadDataset('high_stress_bms_telemetry.json');
    }
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.streamInfo}>
          <View style={styles.titleRow}>
            {isBle ? (
              <Radio size={14} color={colors.primary} />
            ) : (
              <Database size={14} color={colors.primary} />
            )}
            <Text style={styles.title}>TELEMETRY STREAM CONTROLS</Text>
          </View>
          <Text style={styles.packetText}>
            Packets Ingested: {status.packetsReceived}
          </Text>
        </View>

        {!isBle && (
          <TouchableOpacity
            style={[
              styles.datasetBadge,
              isStressDataset ? styles.datasetBadgeStress : styles.datasetBadgeNormal,
            ]}
            onPress={toggleDataset}
            activeOpacity={0.7}
          >
            <Text style={styles.datasetText}>
              {isStressDataset ? 'STRESS DATASET' : 'NORMAL DATASET'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Control Buttons Bar */}
      <View style={styles.controlsRow}>
        {/* Step Prev */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={stepPrevious}
          activeOpacity={0.7}
          disabled={isBle}
        >
          <SkipBack size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Play / Pause Primary Button */}
        <TouchableOpacity
          style={[
            styles.playBtn,
            isStreaming ? styles.playBtnStreaming : styles.playBtnPaused,
          ]}
          onPress={() => (isStreaming ? pauseStreaming() : startStreaming(1500))}
          activeOpacity={0.8}
        >
          {isStreaming ? (
            <>
              <Pause size={18} color="#000000" />
              <Text style={styles.playBtnText}>PAUSE STREAM</Text>
            </>
          ) : (
            <>
              <Play size={18} color="#000000" />
              <Text style={styles.playBtnText}>START STREAM</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Step Next */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={stepNext}
          activeOpacity={0.7}
          disabled={isBle}
        >
          <SkipForward size={18} color={colors.textSecondary} />
        </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streamInfo: {},
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
  packetText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  datasetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  datasetBadgeNormal: {
    backgroundColor: `${colors.primary}15`,
    borderColor: `${colors.primary}40`,
  },
  datasetBadgeStress: {
    backgroundColor: `${colors.accentAmber}15`,
    borderColor: `${colors.accentAmber}40`,
  },
  datasetText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playBtnStreaming: {
    backgroundColor: colors.accentAmber,
  },
  playBtnPaused: {
    backgroundColor: colors.primary,
  },
  playBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    letterSpacing: 0.5,
  },
});
