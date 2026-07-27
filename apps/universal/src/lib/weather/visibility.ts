/**
 * Canonical visibility presentation (universal mirror of web helper).
 *
 * Value formatting + product-approved statute-mile display labels. Prefer a
 * backend-owned visibility category when one ships.
 */

export type VisibilityCategory = "excellent" | "good" | "fair" | "poor";

export type VisibilityPresentation = {
  available: boolean;
  value: number | null;
  formatted: string;
  category: VisibilityCategory | null;
  label: string;
};

/**
 * Product-approved statute-mile visibility bands for display labels.
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
