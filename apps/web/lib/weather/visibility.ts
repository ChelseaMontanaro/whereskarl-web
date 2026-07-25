/**
 * Canonical visibility presentation for selected-location and other surfaces.
 *
 * Visibility arrives on `LocationWeather.visibility` as statute miles from the
 * backend pipeline. Value formatting stays miles-only; qualitative labels use
 * product-approved statute-mile bands centralized here (same pattern as AQI /
 * UV / Pollen presenters). When the backend ships an owned visibility category
 * object, prefer that over these fallback bands.
 *
 * Unit preferences are not yet a product surface on web; miles match the
 * existing location-weather contract and universal detail display.
 */

export type VisibilityCategory = "excellent" | "good" | "fair" | "poor";

export type VisibilityPresentation = {
  available: boolean;
  /** Visibility in statute miles when available. */
  value: number | null;
  /** Display string such as "10 mi", "0.8 mi", or "Unavailable". */
  formatted: string;
  category: VisibilityCategory | null;
  /** Supporting label such as "Excellent", or "Unavailable". */
  label: string;
};

/**
 * Product-approved statute-mile visibility bands for display labels.
 * Chosen so mockup reference (10 mi → Excellent) holds.
 *
 *   Excellent  ≥ 10 mi
 *   Good         5–9.9 mi
 *   Fair         2–4.9 mi
 *   Poor       < 2 mi
 */
export const VISIBILITY_CATEGORY_BY_BAND: ReadonlyArray<{
  minInclusive: number;
  category: VisibilityCategory;
  label: string;
}> = [
  { minInclusive: 10, category: "excellent", label: "Excellent" },
  { minInclusive: 5, category: "good", label: "Good" },
  { minInclusive: 2, category: "fair", label: "Fair" },
  { minInclusive: 0, category: "poor", label: "Poor" },
];

const UNAVAILABLE_VISIBILITY: VisibilityPresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
  category: null,
  label: "Unavailable",
};

/**
 * Format statute-mile visibility for UI. Whole miles render without a trailing
 * `.0`; fractional miles keep one decimal place.
 */
export function formatVisibilityMiles(visibility: number): string {
  const rounded = Math.round(visibility * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return `${text} mi`;
}

export function visibilityCategoryFromValue(
  visibility: number,
): { category: VisibilityCategory; label: string } {
  const miles = Math.max(0, visibility);
  for (const band of VISIBILITY_CATEGORY_BY_BAND) {
    if (miles >= band.minInclusive) {
      return { category: band.category, label: band.label };
    }
  }
  return { category: "poor", label: "Poor" };
}

export function presentVisibility(
  visibility: number | null | undefined,
): VisibilityPresentation {
  if (typeof visibility !== "number" || !Number.isFinite(visibility)) {
    return UNAVAILABLE_VISIBILITY;
  }

  const { category, label } = visibilityCategoryFromValue(visibility);

  return {
    available: true,
    value: visibility,
    formatted: formatVisibilityMiles(visibility),
    category,
    label,
  };
}
