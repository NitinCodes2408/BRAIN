/**
 * App Navigation Configuration
 * 5-Tab Bottom Navigator for EV Battery Intelligence System
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../models/navigation.types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { BatteryDetailsScreen } from '../screens/BatteryDetailsScreen';
import { PredictionScreen } from '../screens/PredictionScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors, typography } from '../utils/theme';
import {
  Gauge,
  Cpu,
  Brain,
  TrendingUp,
  Settings as SettingsIcon,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <Gauge size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="BatteryDetails"
        component={BatteryDetailsScreen}
        options={{
          tabBarLabel: 'Pack Details',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <Cpu size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{
          tabBarLabel: 'Prediction',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <Brain size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <TrendingUp size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <SettingsIcon size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.2,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  iconBoxFocused: {
    transform: [{ scale: 1.08 }],
  },
});
