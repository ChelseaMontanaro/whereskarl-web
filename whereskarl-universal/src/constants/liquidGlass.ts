import { Platform, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';

/** Shared Liquid Glass tokens for mobile map chrome. */
export const LiquidGlassTokens = {
  fill: 'rgba(3, 11, 20, 0.62)',
  fillStrong: 'rgba(3, 11, 20, 0.74)',
  fillBar: 'rgba(3, 11, 20, 0.58)',
  border: 'rgba(255, 255, 255, 0.14)',
  borderHighlight: 'rgba(255, 255, 255, 0.2)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  tint: 'rgba(3, 11, 20, 0.42)',
} as const;

const webBlurStyle =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      } as const)
    : null;

export const liquidGlassStyles = StyleSheet.create({
  panel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fill,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    ...(webBlurStyle ?? {}),
  },
  bar: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.borderSubtle,
    backgroundColor: LiquidGlassTokens.fillBar,
    overflow: 'hidden',
    ...(webBlurStyle ?? {}),
  },
  rail: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fill,
    overflow: 'hidden',
    ...(webBlurStyle ?? {}),
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: LiquidGlassTokens.borderSubtle,
    backgroundColor: LiquidGlassTokens.fillBar,
    overflow: 'hidden',
    ...(webBlurStyle ?? {}),
  },
});
