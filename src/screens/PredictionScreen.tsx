import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrediction } from '../context/PredictionContext';
import { Header } from '../components/common/Header';
import { ModelStatusCard } from '../components/prediction/ModelStatusCard';
import { PredictionMetricsCard } from '../components/prediction/PredictionMetricsCard';
import { FeatureTensorView } from '../components/prediction/FeatureTensorView';
import { colors } from '../utils/theme';

export const PredictionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    modelMetadata,
    executionState,
    inputFeatures,
    lastResult,
    runModelInference,
  } = usePrediction();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="ML Battery Intelligence" subtitle="Trained .pkl Model Pipeline" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ML Model Descriptor (.pkl) */}
        <ModelStatusCard metadata={modelMetadata} />

        {/* Prediction Execution & Target Display */}
        <PredictionMetricsCard
          lastResult={lastResult}
          executionState={executionState}
          onRunInference={() => runModelInference()}
        />

        {/* 13-Dimension Feature Extraction Vector View */}
        <FeatureTensorView features={inputFeatures} />
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
});
