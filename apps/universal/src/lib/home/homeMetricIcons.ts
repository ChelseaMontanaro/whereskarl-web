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
