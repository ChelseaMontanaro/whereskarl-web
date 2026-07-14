/**
 * Canonical humidity presentation (universal mirror of web helper).
 *
 * Value formatting + product-approved outdoor RH display labels. Prefer a
 * backend-owned humidity category when one ships.
 */

export type HumidityCategory = "dry" | "comfortable" | "sticky";

export type HumidityPresentation = {
  available: boolean;
  value: number | null;
  formatted: string;
  category: HumidityCategory | null;
  label: string;
};

/**
 * Product-approved outdoor relative-humidity bands for display labels.
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
