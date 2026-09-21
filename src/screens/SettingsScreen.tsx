import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/common/Header';
import { GlassCard } from '../components/common/GlassCard';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { useSettings } from '../context/SettingsContext';
import { useBattery } from '../context/BatteryContext';
import {
  Settings,
  Database,
  Radio,
  Sliders,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  FileCode,
  Globe,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { config, thresholds, updateConfig, updateThresholds, resetDefaults } = useSettings();
  const { status, switchDataSource } = useBattery();

  const [maxCellV, setMaxCellV] = useState(thresholds.maxCellVoltage.toString());
  const [minCellV, setMinCellV] = useState(thresholds.minCellVoltage.toString());
  const [maxDeltaMv, setMaxDeltaMv] = useState((thresholds.maxDeltaVoltage * 1000).toString());
  const [maxTemp, setMaxTemp] = useState(thresholds.maxPackTemp.toString());
  const [minSoh, setMinSoh] = useState(thresholds.minSohWarning.toString());
  const [modelEndpoint, setModelEndpoint] = useState(config.modelRuntimeEndpoint);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleSaveSettings = async () => {
    await updateThresholds({
      maxCellVoltage: parseFloat(maxCellV) || thresholds.maxCellVoltage,
      minCellVoltage: parseFloat(minCellV) || thresholds.minCellVoltage,
      maxDeltaVoltage: (parseFloat(maxDeltaMv) || 50) / 1000,
      maxPackTemp: parseFloat(maxTemp) || thresholds.maxPackTemp,
      minSohWarning: parseFloat(minSoh) || thresholds.minSohWarning,
    });

    await updateConfig({
      modelRuntimeEndpoint: modelEndpoint,
    });

    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleReset = async () => {
    await resetDefaults();
    setMaxCellV('4.25');
    setMinCellV('2.90');
    setMaxDeltaMv('50');
    setMaxTemp('50.0');
    setMinSoh('80.0');
    setModelEndpoint('https://api.battery-intel.local/v1/predict');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="System Settings" subtitle="Data Source & Safety Limits" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Data Ingestion Source Selection */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Database size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>DATA SOURCE ABSTRACTION</Text>
          </View>

          <GlassCard style={styles.card}>
            {/* JSON Data Source Option */}
            <TouchableOpacity
              style={[
                styles.sourceOption,
                status.type === 'json_stream' && styles.sourceOptionActive,
              ]}
              onPress={() => switchDataSource('json_stream', 'sample_bms_telemetry.json')}
              activeOpacity={0.8}
            >
              <View style={styles.sourceHeader}>
                <View style={styles.sourceTitleRow}>
                  <Database size={16} color={colors.primary} />
                  <Text style={styles.sourceName}>BMS JSON Data Stream</Text>
                </View>
                {status.type === 'json_stream' && (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>ACTIVE SOURCE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sourceDesc}>
                Ingests real-time JSON packets. Supports multi-cycle driving, charging, and stress telemetry sets.
              </Text>
            </TouchableOpacity>

            {/* BLE Data Source Placeholder */}
            <TouchableOpacity
              style={[
                styles.sourceOption,
                status.type === 'ble' && styles.sourceOptionActive,
              ]}
              onPress={() => switchDataSource('ble')}
              activeOpacity={0.8}
            >
              <View style={styles.sourceHeader}>
                <View style={styles.sourceTitleRow}>
                  <Radio size={16} color={colors.secondaryLight} />
                  <Text style={styles.sourceName}>BLE Hardware Link (Future Ready)</Text>
                </View>
                {status.type === 'ble' ? (
                  <View style={[styles.activeTag, { backgroundColor: `${colors.secondary}30` }]}>
                    <Text style={[styles.activeTagText, { color: colors.secondaryLight }]}>
                      ACTIVE
                    </Text>
                  </View>
                ) : (
                  <View style={styles.readyTag}>
                    <Text style={styles.readyTagText}>PREPARED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sourceDesc}>
                Conforms to unified IBatteryDataSource. Will interface directly with BMS BLE hardware with zero UI code modifications.
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Section 2: BMS Safety Thresholds */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Shield size={16} color={colors.accentAmber} />
            <Text style={styles.sectionTitle}>BMS SAFETY ALARM THRESHOLDS</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.inputLabelCol}>
                <Text style={styles.inputLabel}>Max Cell Voltage</Text>
                <Text style={styles.inputHint}>Over-voltage critical alarm</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={maxCellV}
                  onChangeText={setMaxCellV}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputUnit}>V</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
              <View style={styles.inputLabelCol}>
                <Text style={styles.inputLabel}>Min Cell Cutoff Voltage</Text>
                <Text style={styles.inputHint}>Under-voltage cutoff alarm</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={minCellV}
                  onChangeText={setMinCellV}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputUnit}>V</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
              <View style={styles.inputLabelCol}>
                <Text style={styles.inputLabel}>Max Cell Delta Voltage</Text>
                <Text style={styles.inputHint}>Imbalance warning threshold</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={maxDeltaMv}
                  onChangeText={setMaxDeltaMv}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputUnit}>mV</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
              <View style={styles.inputLabelCol}>
                <Text style={styles.inputLabel}>Max Pack Temperature</Text>
                <Text style={styles.inputHint}>Thermal throttling threshold</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={maxTemp}
                  onChangeText={setMaxTemp}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputUnit}>°C</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
              <View style={styles.inputLabelCol}>
                <Text style={styles.inputLabel}>Min SOH Warning</Text>
                <Text style={styles.inputHint}>Battery degradation alert</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={minSoh}
                  onChangeText={setMinSoh}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Section 3: Machine Learning Model Settings */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <FileCode size={16} color={colors.secondaryLight} />
            <Text style={styles.sectionTitle}>ML MODEL RUNTIME CONFIG</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Target ML Artifact</Text>
              <Text style={styles.configValue}>{config.modelFileName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Inference Server / Sidecar Endpoint</Text>
              <TextInput
                style={[styles.textInputFull, { marginTop: 6 }]}
                value={modelEndpoint}
                onChangeText={setModelEndpoint}
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </GlassCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={15} color={colors.textSecondary} />
            <Text style={styles.resetBtnText}>RESTORE DEFAULTS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, saveFeedback && styles.saveBtnSuccess]}
            onPress={handleSaveSettings}
            activeOpacity={0.8}
          >
            {saveFeedback ? (
              <>
                <CheckCircle2 size={16} color="#000000" />
                <Text style={styles.saveBtnText}>SAVED!</Text>
              </>
            ) : (
              <>
                <Save size={16} color="#000000" />
                <Text style={styles.saveBtnText}>APPLY SETTINGS</Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingBottom: 50,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  card: {
    padding: spacing.md,
  },
  sourceOption: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  sourceOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 245, 212, 0.05)',
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  sourceDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  activeTag: {
    backgroundColor: 'rgba(0, 245, 212, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  readyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  readyTagText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  inputLabelCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  inputHint: {
    fontSize: 10,
    color: colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    width: 85,
  },
  textInput: {
    flex: 1,
    height: 34,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamilyMono,
    textAlign: 'right',
  },
  textInputFull: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    height: 38,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamilyMono,
  },
  inputUnit: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  configItem: {
    paddingVertical: 4,
  },
  configLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  configValue: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamilyMono,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  resetBtnText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  saveBtnSuccess: {
    backgroundColor: colors.statusCharging,
  },
  saveBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    letterSpacing: 0.5,
  },
});
