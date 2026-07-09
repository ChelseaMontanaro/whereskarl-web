/**
 * Map marker icon markup — aligned with whereskarl-web/lib/map/markerIcons.ts.
 */

import { getConditionIconSvg } from '@/lib/map/conditionIcons';
import type { FogIntensity } from '@/lib/map/locationsDisplay';

export type MarkerIconOptions = {
  isNighttime?: boolean;
};

export function getMarkerIconMarkup(
  intensity: FogIntensity,
  options: MarkerIconOptions = {},
): string {
  const svg = getConditionIconSvg(intensity, options);
  return svg.replace(
    '<svg xmlns="http://www.w3.org/2000/svg"',
    '<svg class="karl-universal-map-marker__svg" xmlns="http://www.w3.org/2000/svg"',
  );
}

export function getMarkerConditionSymbol(
  intensity: FogIntensity,
  isNighttime = false,
): string {
  switch (intensity) {
    case 'clear':
      return isNighttime ? '☽' : '☀';
    case 'lightFog':
      return '◌';
    case 'foggy':
      return '☁';
    case 'karlTerritory':
      return '☁';
  }
}
