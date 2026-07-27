/**
 * Where's Karl visual identity — aligned with iOS HomeView.swift and shared design tokens.
 */

import { Platform } from 'react-native';

import { designTokens, rgbToken } from '@whereskarl/design';

export { designTokens };

export const Colors = {
  navy: rgbToken(designTokens.navy, 'css-comma'),
  navySoft: rgbToken(designTokens.navySoft, 'css-comma'),
  navyGlass: rgbToken(designTokens.navyGlass, 'css-comma'),
  gold: rgbToken(designTokens.gold, 'css-comma'),
  goldDeep: rgbToken(designTokens.goldDeep, 'css-comma'),
  textPrimary: 'rgba(255, 255, 255, 0.96)',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textMuted: 'rgba(255, 255, 255, 0.48)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassBackground: 'rgba(0, 0, 0, 0.3)',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    rounded: 'System',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const MaxContentWidth = 430;
