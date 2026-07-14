/**
 * Canonical humidity presentation for selected-location and other surfaces.
 *
 * Humidity arrives on `LocationWeather.humidity` as a normalized percentage
 * from the backend. Value formatting stays percentage-only; qualitative labels
 * use product-approved outdoor RH bands centralized here (same pattern as AQI /
 * UV / Pollen presenters). When the backend ships an owned humidity category
 * object, prefer that over these fallback bands.
 */

export type HumidityCategory = "dry" | "comfortable" | "sticky";

export type HumidityPresentation = {
  available: boolean;
  /** Normalized relative humidity 0–100 when available. */
  value: number | null;
  /** Display string such as "72%" or "Unavailable". */
  formatted: string;
  category: HumidityCategory | null;
  /** Supporting label such as "Comfortable", or "Unavailable". */
  label: string;
};

/**
 * Product-approved outdoor relative-humidity bands for display labels.
 * Chosen so mockup reference (72% → Comfortable) holds, with Dry / Sticky
 * flanking the comfort range for Bay outdoor conditions.
 *
 *   Dry         0–34%
 *   Comfortable 35–79%
 *   Sticky      80–100%
 */
export const HUMIDITY_CATEGORY_BY_BAND: ReadonlyArray<{
  maxInclusive: number;
  category: HumidityCategory;
  label: string;
}> = [
  { maxInclusive: 34, category: "dry", label: "Dry" },
  { maxInclusive: 79, category: "comfortable", label: "Comfortable" },
  { maxInclusive: 100, category: "sticky", label: "Sticky" },
];

const UNAVAILABLE_HUMIDITY: HumidityPresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
  category: null,
  label: "Unavailable",
};

/**
 * Format a relative-humidity percentage for UI. Rounds to the nearest whole
 * percent.
 */
export function formatHumidityPercent(humidity: number): string {
  return `${Math.round(humidity)}%`;
}

export function humidityCategoryFromValue(
  humidity: number,
): { category: HumidityCategory; label: string } {
  const clamped = Math.min(100, Math.max(0, humidity));
  for (const band of HUMIDITY_CATEGORY_BY_BAND) {
    if (clamped <= band.maxInclusive) {
      return { category: band.category, label: band.label };
    }
  }
  return { category: "sticky", label: "Sticky" };
}

export function presentHumidity(
  humidity: number | null | undefined,
): HumidityPresentation {
  if (typeof humidity !== "number" || !Number.isFinite(humidity)) {
    return UNAVAILABLE_HUMIDITY;
  }

  const { category, label } = humidityCategoryFromValue(humidity);

  return {
    available: true,
    value: humidity,
    formatted: formatHumidityPercent(humidity),
    category,
    label,
  };
}
