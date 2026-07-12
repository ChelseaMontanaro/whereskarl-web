/**
 * Canonical Air Quality (AQI) presentation.
 *
 * The backend does not yet return an AQI value. This helper defines the
 * canonical AQI categories and colors now so the Selected Location card (and
 * any future surface) can render an AQI slot the moment real data exists,
 * without inventing values in the meantime. When `aqi` is null/undefined the
 * presentation reports `available: false` and callers should render an
 * "awaiting data" slot rather than a fabricated number.
 *
 * Canonical categories (product spec, aligned to US EPA AQI bands):
 *   Good              →  0–50   → green
 *   Moderate          → 51–100  → orange
 *   Poor / Unhealthy  → 101+    → red
 */

export type AirQualityBand = "good" | "moderate" | "poor";

/** Highest AQI that still reads as Good. */
export const AQI_GOOD_MAX = 50;
/** Highest AQI that still reads as Moderate. */
export const AQI_MODERATE_MAX = 100;

/** Canonical AQI band colors — shares the Clear Skies green/orange/red ramp. */
export const AIR_QUALITY_COLORS: Record<AirQualityBand, string> = {
  good: "#22E36B",
  moderate: "#F5A623",
  poor: "#FF5A5F",
};

const AIR_QUALITY_LABELS: Record<AirQualityBand, string> = {
  good: "Good",
  moderate: "Moderate",
  poor: "Unhealthy",
};

export function resolveAirQualityBand(aqi: number): AirQualityBand {
  if (aqi <= AQI_GOOD_MAX) {
    return "good";
  }

  if (aqi <= AQI_MODERATE_MAX) {
    return "moderate";
  }

  return "poor";
}

export function airQualityCategoryLabel(aqi: number): string {
  return AIR_QUALITY_LABELS[resolveAirQualityBand(aqi)];
}

export type AirQualityPresentation = {
  available: boolean;
  aqi: number | null;
  band: AirQualityBand | null;
  color: string | null;
  label: string;
};

const UNAVAILABLE_AIR_QUALITY: AirQualityPresentation = {
  available: false,
  aqi: null,
  band: null,
  color: null,
  label: "Not available",
};

export function presentAirQuality(
  aqi: number | null | undefined,
): AirQualityPresentation {
  if (typeof aqi !== "number" || !Number.isFinite(aqi)) {
    return UNAVAILABLE_AIR_QUALITY;
  }

  const rounded = Math.max(0, Math.round(aqi));
  const band = resolveAirQualityBand(rounded);

  return {
    available: true,
    aqi: rounded,
    band,
    color: AIR_QUALITY_COLORS[band],
    label: AIR_QUALITY_LABELS[band],
  };
}
