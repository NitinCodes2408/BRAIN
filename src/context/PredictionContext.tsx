/**
 * Machine Learning Prediction Context
 * Orchestrates feature extraction from live BMS telemetry and manages model lifecycle.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ModelMetadata,
  PredictionExecutionState,
  PredictionInputFeatures,
  PredictionResult,
} from '../models/prediction.types';
import { BMSTelemetry } from '../models/bms.types';
import { PredictionService } from '../services/PredictionService';
import { useBattery } from './BatteryContext';

interface PredictionContextValue {
  modelMetadata: ModelMetadata;
  executionState: PredictionExecutionState;
  inputFeatures: PredictionInputFeatures | null;
  lastResult: PredictionResult | null;
  extractFeaturesForCurrentTelemetry: () => PredictionInputFeatures | null;
  runModelInference: (telemetry?: BMSTelemetry) => Promise<PredictionResult | null>;
}

const PredictionContext = createContext<PredictionContextValue | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { telemetry } = useBattery();
  const service = PredictionService.getInstance();

  const [modelMetadata] = useState<ModelMetadata>(service.getModelMetadata());
  const [executionState, setExecutionState] = useState<PredictionExecutionState>('ready');
  const [inputFeatures, setInputFeatures] = useState<PredictionInputFeatures | null>(null);
  const [lastResult, setLastResult] = useState<PredictionResult | null>(null);

  // Automatically update extracted feature vector whenever new telemetry arrives
  useEffect(() => {
    if (telemetry) {
      const features = service.prepareFeatures(telemetry);
      setInputFeatures(features);
    }
  }, [telemetry]);

  const extractFeaturesForCurrentTelemetry = (): PredictionInputFeatures | null => {
    if (!telemetry) return null;
    const features = service.prepareFeatures(telemetry);
    setInputFeatures(features);
    return features;
  };

  const runModelInference = async (targetTelemetry?: BMSTelemetry): Promise<PredictionResult | null> => {
    const frame = targetTelemetry || telemetry;
    if (!frame) return null;

    setExecutionState('inferring');
    try {
      const features = service.prepareFeatures(frame);
      setInputFeatures(features);
      const result = await service.runInference(features);
      setLastResult(result);
      setExecutionState('completed');
      return result;
    } catch (err) {
      console.error('Inference error:', err);
      setExecutionState('error');
      return null;
    }
  };

  return (
    <PredictionContext.Provider
      value={{
        modelMetadata,
        executionState,
        inputFeatures,
        lastResult,
        extractFeaturesForCurrentTelemetry,
        runModelInference,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = (): PredictionContextValue => {
  const ctx = useContext(PredictionContext);
  if (!ctx) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return ctx;
};
