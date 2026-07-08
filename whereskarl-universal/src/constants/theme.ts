/**
 * Where's Karl visual identity — aligned with iOS HomeView.swift and whereskarl-web tokens.
 */

import { Platform } from 'react-native';

export const designTokens = {
  navy: { r: 3, g: 11, b: 20 },
  navySoft: { r: 7, g: 22, b: 35 },
  navyGlass: { r: 9, g: 27, b: 42 },
  gold: { r: 242, g: 163, b: 38 },
  goldDeep: { r: 148, g: 92, b: 20 },
} as const;

function rgb({ r, g, b }: { r: number; g: number; b: number }): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export const Colors = {
  navy: rgb(designTokens.navy),
  navySoft: rgb(designTokens.navySoft),
  navyGlass: rgb(designTokens.navyGlass),
  gold: rgb(designTokens.gold),
  goldDeep: rgb(designTokens.goldDeep),
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
