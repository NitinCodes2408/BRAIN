/**
 * Machine Learning Prediction Pipeline Types for EV Battery Intelligence System
 * Designed to interface with .pkl / trained ML model inference runtimes.
 */

export interface ModelMetadata {
  modelId: string;
  modelName: string;
  version: string;
  format: '.pkl' | 'onnx' | 'tflite' | 'py_pickle';
  algorithm: string; // e.g. 'RandomForestRegressor + XGBoost'
  trainedDate: string;
  targetMetrics: string[];
  inputFeatureCount: number;
  inputFeatures: string[];
  modelSizeKb: number;
  accuracyScore?: number; // e.g. R2 / RMSE
}

export interface PredictionInputFeatures {
  timestamp: number;
  packVoltage: number;
  packCurrent: number;
  soc: number;
  soh: number;
  deltaCellVoltage: number;
  avgCellVoltage: number;
  maxTemperature: number;
  minTemperature: number;
  avgTemperature: number;
  cycleCount: number;
  insulationResistance: number;
  powerKw: number;
  temperatureVariance: number;
  rawFeatureVector: number[]; // Ordered tensor ready for model input
}

export type PredictionExecutionState =
  | 'idle'
  | 'ready'
  | 'extracting_features'
  | 'inferring'
  | 'completed'
  | 'error';

export interface DegradationPoint {
  cycle: number;
  projectedSoh: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface AnomalyIndicator {
  feature: string;
  severity: 'low' | 'medium' | 'high';
  observedValue: number;
  expectedRange: [number, number];
  contributionWeight: number; // Feature importance
}

export interface PredictionResult {
  predictionId: string;
  timestamp: number;
  modelId: string;
  modelVersion: string;
  
  // Predictive Targets (Calculated by trained ML model)
  remainingUsefulLifeCycles: number | null; // Predicted cycles remaining before 80% SOH
  remainingUsefulLifeDays: number | null;
  projectedSoh: number | null;
  thermalRunawayRiskScore: number | null; // 0.0 (Safe) to 1.0 (Imminent Critical Risk)
  anomalyScore: number | null; // 0.0 (Normal) to 1.0 (Anomalous)
  
  degradationTrajectory: DegradationPoint[];
  anomalyIndicators: AnomalyIndicator[];
  confidenceScore: number | null; // 0.0 - 1.0
  
  status: 'computed' | 'unprocessed' | 'pending_model_execution';
  inferenceLatencyMs?: number;
  notes?: string;
}
