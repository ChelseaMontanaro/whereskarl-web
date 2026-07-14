/**
 * Canonical visibility value formatting (universal mirror of web helper).
 *
 * Formats backend statute-mile visibility only — no qualitative labels or
 * frontend thresholds.
 */

export type VisibilityPresentation = {
  available: boolean;
  value: number | null;
  formatted: string;
};

const UNAVAILABLE_VISIBILITY: VisibilityPresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
};

export function formatVisibilityMiles(visibility: number): string {
  const rounded = Math.round(visibility * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return `${text} mi`;
}

export function presentVisibility(
  visibility: number | null | undefined,
): VisibilityPresentation {
  if (typeof visibility !== "number" || !Number.isFinite(visibility)) {
    return UNAVAILABLE_VISIBILITY;
  }

  return {
    available: true,
    value: visibility,
    formatted: formatVisibilityMiles(visibility),
  };
}
