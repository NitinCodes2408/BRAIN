import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SettingsProvider } from './src/context/SettingsContext';
import { BatteryProvider } from './src/context/BatteryContext';
import { PredictionProvider } from './src/context/PredictionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/utils/theme';

const appNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.cardBackground,
    text: colors.textPrimary,
    border: colors.cardBorder,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <BatteryProvider>
          <PredictionProvider>
            <NavigationContainer theme={appNavigationTheme}>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </PredictionProvider>
        </BatteryProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
