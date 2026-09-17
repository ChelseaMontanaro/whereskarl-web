import { Platform } from 'react-native';

/**
 * Settings-local chrome. Do not import from Home / Map / Favorites.
 *
 * The two main Settings cards reproduce the approved Home MetricCard surface.
 * Header / section-label type over atmosphere stays dark. About modal tokens
 * are frozen.
 */
export const SettingsChrome = {
  textPrimary: 'rgb(24, 48, 72)',
  textSecondary: 'rgba(24, 48, 72, 0.64)',
  textMuted: 'rgba(24, 48, 72, 0.48)',
  eyebrow: 'rgba(24, 48, 72, 0.46)',
  glassFill: 'rgba(255, 255, 255, 0.52)',
  glassFillFallback: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  /** Light veil only — native GlassView supplies frost; a heavier fill reads opaque. */
  glassTint: 'rgba(255, 255, 255, 0.16)',
  /** Home-family translucent white overlay (`rgba(255, 255, 255, 0.12)`). */
  iconWellFill: 'rgba(255, 255, 255, 0.12)',
  /** Home MetricCard `cardDetail`. */
  iconColor: 'rgba(255,255,255,0.72)',
  comingSoonFill: 'rgba(255, 255, 255, 0.12)',
  /** Home MetricCard `cardLabel`. */
  comingSoonText: 'rgba(255,255,255,0.62)',
  segmentTrack: 'rgba(255, 255, 255, 0.12)',
  segmentActiveFill: 'rgba(255, 255, 255, 0.96)',
  segmentActiveText: 'rgb(24, 48, 72)',
  segmentInactiveText: 'rgba(255,255,255,0.62)',
  chevron: 'rgba(255,255,255,0.62)',
  divider: 'rgba(255, 255, 255, 0.1)',
  aboutScrim: 'rgba(3, 11, 20, 0.28)',
  /** Subtle neutral modal dim — not a navy full-screen wash. */
  aboutOverlay: 'rgba(0, 0, 0, 0.16)',
  /** Navy-backed About panel fill — same channels as `LiquidGlassTokens.fillStrong`. */
  aboutPanelFill: 'rgba(3, 11, 20, 0.74)',
  aboutPanelBorder: 'rgba(255, 255, 255, 0.14)',
  aboutPanelTint: 'rgba(3, 11, 20, 0.42)',
  fallbackAtmosphere: 'rgb(186, 206, 222)',
} as const;

export const settingsWebBlurStyle =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      } as const)
    : null;
