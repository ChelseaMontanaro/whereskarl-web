import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { liquidGlassStyles, LiquidGlassTokens } from '@/constants/liquidGlass';

type LiquidGlassVariant = 'panel' | 'bar' | 'rail' | 'bottomBar';

type LiquidGlassSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: LiquidGlassVariant;
  accessibilityLabel?: string;
};

const variantStyles: Record<LiquidGlassVariant, ViewStyle> = {
  panel: liquidGlassStyles.panel,
  bar: liquidGlassStyles.bar,
  rail: liquidGlassStyles.rail,
  bottomBar: liquidGlassStyles.bottomBar,
};

export function LiquidGlassSurface({
  children,
  style,
  variant = 'panel',
  accessibilityLabel,
}: LiquidGlassSurfaceProps) {
  const baseStyle = [variantStyles[variant], style];

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={LiquidGlassTokens.tint}
        colorScheme="dark"
        accessibilityLabel={accessibilityLabel}
        style={baseStyle}>
        {children}
      </GlassView>
    );
  }

  return (
    <View accessibilityLabel={accessibilityLabel} style={baseStyle}>
      {children}
    </View>
  );
}
