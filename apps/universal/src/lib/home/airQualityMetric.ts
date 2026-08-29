/**
 * Home "Air Quality" metric — Bay-wide air quality overview.
 *
 * DATA SOURCE
 * `GET /current.regionalAirQuality`: the backend's Bay-wide aggregate, the
 * arithmetic mean of every location reporting AQI, classified through the
 * canonical bands. This mirrors the only other regional aggregate on this
 * dashboard — `fogCoverage` is `round(mean(fogScore))` over all locations, and
 * `sunshineScore` is `100 - fogCoverage`. Nothing is aggregated on the client.
 *
 * Deliberately NOT `current.airQuality`: that field is the single foggiest
 * pin's object (Karl's current position), so it both overstates a
 * location-specific reading as regional and goes unavailable whenever that one
 * pin degrades — the physical-iPhone "--" / "Air quality unavailable" failure.
 * Per-location AQI stays on Map, exactly as on mobile web.
 *
 * BANDS
 * Category, label and colour token are backend-owned (`airQualityResolver`
 * AQI_BANDS: 50/100/150/200/300/500). This module reuses the canonical
 * `AirQualityCategory` enum and `presentAirQuality` mapping and does not
 * re-derive U.S. AQI numeric breakpoints.
 */

import {
  compactAirQualityTileLabel,
  presentAirQuality,
  type AirQualityCategory,
  type AirQualityPresentation,
} from '@whereskarl/domain';
import type { CurrentResponse } from '@whereskarl/schemas';

/**
 * Canonical band order from `airQualityCategorySchema` (Good → Hazardous).
 * The meter position is derived from this ordering rather than from invented
 * numeric breakpoints.
 */
export const AIR_QUALITY_BAND_ORDER: readonly AirQualityCategory[] = [
  'good',
  'moderate',
  'unhealthy-sensitive',
  'unhealthy',
  'very-unhealthy',
  'hazardous',
] as const;

/** Bay-wide AQI presentation from the backend's regional aggregate. */
export function bayWideAirQuality(
  current: CurrentResponse | null,
): AirQualityPresentation {
  return presentAirQuality(current?.regionalAirQuality);
}

/** Card value: the numeric AQI, or the shared loading/unavailable dash. */
export function airQualityMetricValue(
  presentation: AirQualityPresentation,
): string {
  if (!presentation.available || presentation.aqi === null) {
    return '--';
  }
  return `${presentation.aqi}`;
}

/**
 * Card detail line: canonical compact classification + Bay-wide qualifier,
 * e.g. "Good across the Bay". Uses the same compact tile labels mobile web
 * uses for AQI rather than inventing shorter wording.
 */
export function airQualityMetricDetail(
  presentation: AirQualityPresentation,
): string {
  if (!presentation.available) {
    return 'Air quality unavailable';
  }
  return `${compactAirQualityTileLabel(presentation)} across the Bay`;
}

/**
 * Meter fill fraction (0–100) for an AQI presentation.
 *
 * AQI is not a percentage, so this is NOT `aqi / 100`. The indicator is placed
 * at the centre of its canonical band segment across the six bands, so the
 * meter reads Good → Hazardous and always agrees with the band the backend
 * reported. Unavailable data parks the indicator at the Good end.
 */
export function airQualityMeterFillPercent(
  presentation: AirQualityPresentation,
): number {
  if (!presentation.available || presentation.category === null) {
    return 0;
  }
  const index = AIR_QUALITY_BAND_ORDER.indexOf(presentation.category);
  if (index < 0) {
    return 0;
  }
  const bandWidth = 100 / AIR_QUALITY_BAND_ORDER.length;
  return Math.round(bandWidth * (index + 0.5) * 100) / 100;
}

/** Screen-reader label for the Bay-wide AQI meter. */
export function airQualityMeterAriaLabel(
  presentation: AirQualityPresentation,
): string {
  if (!presentation.available || presentation.aqi === null) {
    return 'Bay-wide air quality index unavailable';
  }
  return `Bay-wide air quality index ${presentation.aqi}, ${presentation.label}`;
}
