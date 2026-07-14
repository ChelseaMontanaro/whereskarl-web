/**
 * Compact visual labels for dense Environmental Metrics tiles.
 *
 * Canonical backend labels (e.g. "Unhealthy for Sensitive Groups") remain the
 * source of truth for accessibility, tooltips, and expanded detail. Tile
 * chrome may show a deliberate shorter display string so 3-column phone tiles
 * stay equal height without uncontrolled wrapping.
 *
 * Prefer category-keyed maps over heuristic truncation. When a new long
 * environmental label lands, add an explicit compact entry here — do not
 * invent health thresholds or truncate mid-word in the UI.
 */

import type { AirQualityCategory } from "@/lib/schemas/weather";
import type { AirQualityPresentation } from "@/lib/weather/airQuality";

/** Deliberate AQI tile labels keyed by backend category. */
export const AQI_COMPACT_TILE_LABEL_BY_CATEGORY: Record<
  AirQualityCategory,
  string
> = {
  good: "Good",
  moderate: "Moderate",
  "unhealthy-sensitive": "Sensitive",
  unhealthy: "Unhealthy",
  "very-unhealthy": "Very Unhealthy",
  hazardous: "Hazardous",
};

/**
 * Visible supporting label for an AQI tile. Returns the empty string when
 * unavailable so the tile does not invent a fake category.
 */
export function compactAirQualityTileLabel(
  presentation: AirQualityPresentation,
): string {
  if (!presentation.available || !presentation.category) {
    return "";
  }

  return (
    AQI_COMPACT_TILE_LABEL_BY_CATEGORY[presentation.category] ??
    presentation.label
  );
}

/**
 * Accessible / expanded label — always the full canonical backend string.
 */
export function airQualityAccessibleLabel(
  presentation: AirQualityPresentation,
  title = "AQI",
): string {
  if (!presentation.available || !presentation.label) {
    return `${title}, Unavailable`;
  }

  return `${title}, ${presentation.aqi}, ${presentation.label}`;
}
