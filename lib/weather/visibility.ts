/**
 * Canonical visibility value formatting for selected-location and other surfaces.
 *
 * Visibility arrives on `LocationWeather.visibility` as statute miles from the
 * backend pipeline. This helper formats that raw number for display — it does
 * not invent qualitative labels (Excellent / Poor / etc.), color bands, or
 * frontend thresholds. When a backend-owned visibility category object ships,
 * present it the same way AQI / UV / Pollen do; until then, value-only is the
 * honest contract.
 *
 * Unit preferences are not yet a product surface on web; miles match the
 * existing location-weather contract and universal detail display.
 */

export type VisibilityPresentation = {
  available: boolean;
  /** Visibility in statute miles when available. */
  value: number | null;
  /** Display string such as "10 mi", "0.8 mi", or "Unavailable". */
  formatted: string;
};

const UNAVAILABLE_VISIBILITY: VisibilityPresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
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
