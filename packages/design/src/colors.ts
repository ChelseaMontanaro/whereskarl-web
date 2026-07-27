/**
 * Shared status / environmental hex palettes (visual token data only).
 * Presentation rules (thresholds, labels, band resolution) remain outside this package.
 */

/** Clear Skies Score display palette (Web reference). Band thresholds live in domain/presenters. */
export const CLEAR_SKIES_SCORE_COLORS = {
  clear: "#22E36B",
  moderate: "#F5A623",
  poor: "#FF5A5F",
} as const;

/** AQI backend `colorToken` → hex map. */
export const AIR_QUALITY_COLOR_BY_TOKEN = {
  "aqi.good": "#22E36B",
  "aqi.moderate": "#F5A623",
  "aqi.unhealthy-sensitive": "#F97316",
  "aqi.unhealthy": "#FF5A5F",
  "aqi.very-unhealthy": "#A855F7",
  "aqi.hazardous": "#7F1D1D",
  "aqi.unavailable": null,
} as const;

/** UV Index backend `colorToken` → hex map. */
export const UV_INDEX_COLOR_BY_TOKEN = {
  "uv.low": "#22E36B",
  "uv.moderate": "#F5A623",
  "uv.high": "#F97316",
  "uv.very-high": "#FF5A5F",
  "uv.extreme": "#A855F7",
  "uv.unavailable": null,
} as const;

/** Pollen backend `colorToken` → hex map. */
export const POLLEN_COLOR_BY_TOKEN = {
  "pollen.none": "#22E36B",
  "pollen.very-low": "#84CC16",
  "pollen.low": "#F5A623",
  "pollen.moderate": "#F97316",
  "pollen.high": "#FF5A5F",
  "pollen.very-high": "#A855F7",
  "pollen.unavailable": null,
} as const;
