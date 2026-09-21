/**
 * Settings Context
 * Manages user preferences, alert safety thresholds, and unit systems.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfig, AlertThresholds } from '../models/settings.types';
import {
  loadAppConfig,
  saveAppConfig,
  loadAlertThresholds,
  saveAlertThresholds,
  defaultAppConfig,
  defaultAlertThresholds,
} from '../storage/asyncStorage';
import { BatteryRepository } from '../services/BatteryRepository';

interface SettingsContextValue {
  config: AppConfig;
  thresholds: AlertThresholds;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  updateThresholds: (partial: Partial<AlertThresholds>) => Promise<void>;
  resetDefaults: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultAppConfig);
  const [thresholds, setThresholds] = useState<AlertThresholds>(defaultAlertThresholds);

  useEffect(() => {
    (async () => {
      const storedConfig = await loadAppConfig();
      const storedThresholds = await loadAlertThresholds();
      setConfig(storedConfig);
      setThresholds(storedThresholds);

      const repo = BatteryRepository.getInstance();
      repo.setThresholds(storedThresholds);
      repo.setAutoLog(storedConfig.autoLogHistory);
    })();
  }, []);

  const updateConfig = async (partial: Partial<AppConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    await saveAppConfig(updated);

    const repo = BatteryRepository.getInstance();
    if (partial.autoLogHistory !== undefined) {
      repo.setAutoLog(partial.autoLogHistory);
    }
  };

  const updateThresholds = async (partial: Partial<AlertThresholds>) => {
    const updated = { ...thresholds, ...partial };
    setThresholds(updated);
    await saveAlertThresholds(updated);

    const repo = BatteryRepository.getInstance();
    repo.setThresholds(updated);
  };

  const resetDefaults = async () => {
    setConfig(defaultAppConfig);
    setThresholds(defaultAlertThresholds);
    await saveAppConfig(defaultAppConfig);
    await saveAlertThresholds(defaultAlertThresholds);

    const repo = BatteryRepository.getInstance();
    repo.setThresholds(defaultAlertThresholds);
    repo.setAutoLog(defaultAppConfig.autoLogHistory);
  };

  return (
    <SettingsContext.Provider
      value={{
        config,
        thresholds,
        updateConfig,
        updateThresholds,
        resetDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};
