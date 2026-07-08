/**
 * Map marker presentation — aligned with whereskarl-web marker intensity classes.
 */

import { Colors } from '@/constants/theme';
import {
  resolveLocationFogIntensity,
  type FogIntensity,
} from '@/lib/map/locationsDisplay';
import type { LocationWeather } from '@/types/weather';

export type KarlMapMarkerLocation = Pick<
  LocationWeather,
  'id' | 'name' | 'latitude' | 'longitude' | 'fogScore' | 'sunshineScore' | 'status'
>;

export type MarkerVisualState = {
  intensity: FogIntensity;
  fillColor: string;
  borderColor: string;
  labelColor: string;
  scale: number;
};

const INTENSITY_COLORS: Record<
  FogIntensity,
  { fill: string; border: string; label: string }
> = {
  clear: {
    fill: Colors.gold,
    border: 'rgba(242, 163, 38, 0.95)',
    label: Colors.gold,
  },
  lightFog: {
    fill: '#D8E8F4',
    border: 'rgba(216, 232, 244, 0.95)',
    label: '#EAF3FA',
  },
  foggy: {
    fill: '#C5DDF0',
    border: 'rgba(197, 221, 240, 0.95)',
    label: '#E8F3FA',
  },
  karlTerritory: {
    fill: '#8CB8D8',
    border: 'rgba(140, 184, 216, 0.95)',
    label: '#C5DDF0',
  },
};

export function getMarkerIntensity(location: KarlMapMarkerLocation): FogIntensity {
  return resolveLocationFogIntensity(location);
}

export function getMarkerVisualState(
  location: KarlMapMarkerLocation,
  isSelected: boolean,
): MarkerVisualState {
  const intensity = getMarkerIntensity(location);
  const palette = INTENSITY_COLORS[intensity];

  return {
    intensity,
    fillColor: palette.fill,
    borderColor: isSelected ? Colors.gold : palette.border,
    labelColor: palette.label,
    scale: isSelected ? 1.12 : intensity === 'clear' ? 1.04 : 1,
  };
}

export function getMarkerAccessibilityLabel(
  location: KarlMapMarkerLocation,
  isSelected: boolean,
): string {
  const intensity = getMarkerIntensity(location);
  const condition =
    intensity === 'clear'
      ? `${Math.round(location.sunshineScore)}% clear skies`
      : intensity.replace(/([A-Z])/g, ' $1').trim();

  return isSelected
    ? `${location.name}, selected, ${condition}`
    : `${location.name}, ${condition}`;
}
