import { StyleSheet } from 'react-native';

import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { Radius } from '@/constants/theme';

/**
 * Floating Map panel surface. The border already matched the shared Liquid Glass
 * token, but the fill had drifted to a near-opaque 0.94, which read as a flat
 * black rectangle next to the translucent surfaces used elsewhere in the app
 * (Home cards, the bottom nav). It now takes both values from the shared tokens
 * so Map panels use the one approved glass language.
 */
export const mapGlassPanel = StyleSheet.create({
  panel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fill,
    pointerEvents: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.9)',
  },
});
