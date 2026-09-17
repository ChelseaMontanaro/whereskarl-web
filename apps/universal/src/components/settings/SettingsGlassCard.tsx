import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type SettingsGlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Settings-local reproduction of the approved Home MetricCard surface
 * (`DashboardGrid` `styles.card`): `rgba(0,0,0,0.4)` fill + `Colors.glassBorder`.
 * Home files are not imported. Shared map/nav glass is not used.
 */
export function SettingsGlassCard({ children, style }: SettingsGlassCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
});
