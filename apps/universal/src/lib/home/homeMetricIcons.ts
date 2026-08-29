/**
 * Home dashboard metric icons — reuse Phase 22 Map phone-portrait artwork
 * and KarlLogo rather than a parallel Home icon set.
 */

import { getFogIntensity, type FogIntensity } from '@whereskarl/domain';
import { getPhonePortraitFogRailConditionIconDataUri } from '@/lib/map/phonePortraitConditionIcons';

export type HomeMetricIconKind = 'condition' | 'karlLogo';

export type HomeMetricIconRef =
  | { kind: 'karlLogo' }
  | { kind: 'condition'; uri: string };

/** Fog Coverage % → same intensity bands as Map fogScore (`getFogIntensity`). */
export function resolveFogCoverageMetricIntensity(
  fogCoveragePercent: number,
): FogIntensity {
  return getFogIntensity(fogCoveragePercent);
}

/**
 * Fog Coverage card icon: Clear / Light Fog / Foggy from phone-portrait
 * condition artwork; Karl Territory uses the canonical KarlLogo (same as Map).
 */
export function resolveFogCoverageMetricIcon(
  fogCoveragePercent: number,
  options: { isNighttime?: boolean } = {},
): HomeMetricIconRef {
  const intensity = resolveFogCoverageMetricIntensity(fogCoveragePercent);

  if (intensity === 'karlTerritory') {
    return { kind: 'karlLogo' };
  }

  return {
    kind: 'condition',
    uri: getPhonePortraitFogRailConditionIconDataUri(intensity, {
      isNighttime: options.isNighttime ?? false,
    }),
  };
}

/** Clear Skies / Clearest Spot — Map Clear sun (day) or moon (night). */
export function resolveHomeClearConditionIconUri(
  options: { isNighttime?: boolean } = {},
): string {
  return getPhonePortraitFogRailConditionIconDataUri('clear', {
    isNighttime: options.isNighttime ?? false,
  });
}

/**
 * Air Quality — the mobile-web AQI glyph (three stacked air waves) from
 * `EnvAqiIcon`, in the same blue the web Map AQI tile uses. Paths and colour
 * are copied verbatim so Home and Map share one AQI icon.
 */
const AIR_QUALITY_ICON_COLOR = '#3DB4FF';

const AIR_QUALITY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="${AIR_QUALITY_ICON_COLOR}" stroke-width="2.85" stroke-linecap="round">
  <path d="M2.6 7.1c2.3 0 3.45-1.75 4.85-1.75S10.9 7.1 12 7.1s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
  <path d="M2.6 12c2.3 0 3.45-1.75 4.85-1.75S10.9 12 12 12s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
  <path d="M2.6 16.9c2.3 0 3.45-1.75 4.85-1.75S10.9 16.9 12 16.9s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
</svg>`;

export function resolveAirQualityMetricIconUri(): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    AIR_QUALITY_ICON,
  )}`;
}
