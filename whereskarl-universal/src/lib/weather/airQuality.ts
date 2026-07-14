/**
 * Canonical Air Quality presentation for universal selected-location consumers.
 * Mirrors whereskarl-web/lib/weather/airQuality.ts — category / colorToken are
 * owned by the backend; this module only maps colorToken → platform color.
 */

import type { AirQuality, AirQualityCategory } from '@/types/weather';

export type { AirQuality, AirQualityCategory };

export type AirQualityColorToken =
  | 'aqi.good'
  | 'aqi.moderate'
  | 'aqi.unhealthy-sensitive'
  | 'aqi.unhealthy'
  | 'aqi.very-unhealthy'
  | 'aqi.hazardous'
  | 'aqi.unavailable';

export const AIR_QUALITY_COLOR_BY_TOKEN: Record<AirQualityColorToken, string | null> = {
  'aqi.good': '#22E36B',
  'aqi.moderate': '#F5A623',
  'aqi.unhealthy-sensitive': '#F97316',
  'aqi.unhealthy': '#FF5A5F',
  'aqi.very-unhealthy': '#A855F7',
  'aqi.hazardous': '#7F1D1D',
  'aqi.unavailable': null,
};

export type AirQualityPresentation = {
  available: boolean;
  aqi: number | null;
  category: AirQualityCategory | null;
  colorToken: AirQualityColorToken;
  color: string | null;
  label: string;
  description: string | null;
};

const UNAVAILABLE_AIR_QUALITY: AirQualityPresentation = {
  available: false,
  aqi: null,
  category: null,
  colorToken: 'aqi.unavailable',
  color: null,
  label: 'Unavailable',
  description: null,
};

const VALID_CATEGORIES = new Set<string>([
  'good',
  'moderate',
  'unhealthy-sensitive',
  'unhealthy',
  'very-unhealthy',
  'hazardous',
]);
const VALID_COLOR_TOKENS = new Set<string>(Object.keys(AIR_QUALITY_COLOR_BY_TOKEN));

function isAirQualityCategory(value: unknown): value is AirQualityCategory {
  return typeof value === 'string' && VALID_CATEGORIES.has(value);
}

function isAirQualityColorToken(value: unknown): value is AirQualityColorToken {
  return typeof value === 'string' && VALID_COLOR_TOKENS.has(value);
}

function colorTokenFromCategory(
  category: AirQualityCategory | null,
): AirQualityColorToken {
  if (!category) {
    return 'aqi.unavailable';
  }
  return `aqi.${category}` as AirQualityColorToken;
}

export function presentAirQuality(
  airQuality: AirQuality | null | undefined,
): AirQualityPresentation {
  if (!airQuality || airQuality.isAvailable !== true) {
    return { ...UNAVAILABLE_AIR_QUALITY };
  }

  const aqi = airQuality.aqi;
  if (typeof aqi !== 'number' || !Number.isFinite(aqi)) {
    return { ...UNAVAILABLE_AIR_QUALITY };
  }

  const category = isAirQualityCategory(airQuality.category)
    ? airQuality.category
    : null;

  if (!category) {
    return { ...UNAVAILABLE_AIR_QUALITY };
  }

  const label =
    typeof airQuality.label === 'string' && airQuality.label.trim()
      ? airQuality.label.trim()
      : 'Unavailable';

  if (label === 'Unavailable') {
    return { ...UNAVAILABLE_AIR_QUALITY };
  }

  const colorToken = isAirQualityColorToken(airQuality.colorToken)
    ? airQuality.colorToken
    : colorTokenFromCategory(category);

  return {
    available: true,
    aqi: Math.round(aqi),
    category,
    colorToken,
    color: AIR_QUALITY_COLOR_BY_TOKEN[colorToken],
    label,
    description:
      typeof airQuality.description === 'string' ? airQuality.description : null,
  };
}

export function formatAirQualityCompact(
  presentation: AirQualityPresentation,
): string {
  if (!presentation.available || presentation.aqi === null) {
    return 'Unavailable';
  }

  return `${presentation.aqi} · ${presentation.label}`;
}
