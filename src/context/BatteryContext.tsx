/**
 * Battery State Management Context
 * Connects React UI components to the BatteryRepository and data source abstractions.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BMSTelemetry, BmsFault } from '../models/bms.types';
import { DataSourceStatus, DataSourceType } from '../models/datasource.types';
import { BatteryRepository } from '../services/BatteryRepository';

interface BatteryContextValue {
  telemetry: BMSTelemetry | null;
  alerts: BmsFault[];
  status: DataSourceStatus;
  isStreaming: boolean;
  startStreaming: (intervalMs?: number) => void;
  pauseStreaming: () => void;
  stepNext: () => void;
  stepPrevious: () => void;
  switchDataSource: (type: DataSourceType, datasetName?: string) => Promise<void>;
  loadDataset: (datasetName: string) => void;
  injectCustomJson: (frames: BMSTelemetry[], name?: string) => void;
}

const BatteryContext = createContext<BatteryContextValue | undefined>(undefined);

export const BatteryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repo = BatteryRepository.getInstance();
  const [telemetry, setTelemetry] = useState<BMSTelemetry | null>(repo.getCurrentTelemetry());
  const [alerts, setAlerts] = useState<BmsFault[]>(repo.getCurrentAlerts());
  const [status, setStatus] = useState<DataSourceStatus>(repo.getStatus());

  useEffect(() => {
    // Connect initial data source
    repo.connect();

    const unsubTelemetry = repo.subscribeTelemetry((newTelemetry) => {
      setTelemetry(newTelemetry);
    });

    const unsubStatus = repo.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    const unsubAlerts = repo.subscribeAlerts((newAlerts) => {
      setAlerts(newAlerts);
    });

    return () => {
      unsubTelemetry();
      unsubStatus();
      unsubAlerts();
    };
  }, [repo]);

  const isStreaming = status.state === 'streaming';

  const startStreaming = useCallback((intervalMs?: number) => {
    repo.startStreaming(intervalMs);
  }, [repo]);

  const pauseStreaming = useCallback(() => {
    repo.pauseStreaming();
  }, [repo]);

  const stepNext = useCallback(() => {
    repo.stepNext();
  }, [repo]);

  const stepPrevious = useCallback(() => {
    repo.stepPrevious();
  }, [repo]);

  const switchDataSource = useCallback(async (type: DataSourceType, datasetName?: string) => {
    await repo.switchDataSource(type, datasetName);
  }, [repo]);

  const loadDataset = useCallback((datasetName: string) => {
    repo.getJsonSource().loadDataset(datasetName);
    repo.stepNext(); // Broadcast first frame
  }, [repo]);

  const injectCustomJson = useCallback((frames: BMSTelemetry[], name?: string) => {
    repo.getJsonSource().setCustomFrames(frames, name);
  }, [repo]);

  return (
    <BatteryContext.Provider
      value={{
        telemetry,
        alerts,
        status,
        isStreaming,
        startStreaming,
        pauseStreaming,
        stepNext,
        stepPrevious,
        switchDataSource,
        loadDataset,
        injectCustomJson,
      }}
    >
      {children}
    </BatteryContext.Provider>
  );
};

export const useBattery = (): BatteryContextValue => {
  const ctx = useContext(BatteryContext);
  if (!ctx) {
    throw new Error('useBattery must be used within a BatteryProvider');
  }
  return ctx;
};
