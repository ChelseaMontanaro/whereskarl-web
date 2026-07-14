/**
 * Canonical humidity value formatting (universal mirror of web helper).
 *
 * Formats the backend relative-humidity percentage only — no qualitative
 * labels or frontend thresholds.
 */

export type HumidityPresentation = {
  available: boolean;
  value: number | null;
  formatted: string;
};

const UNAVAILABLE_HUMIDITY: HumidityPresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
};

export function formatHumidityPercent(humidity: number): string {
  return `${Math.round(humidity)}%`;
}

export function presentHumidity(
  humidity: number | null | undefined,
): HumidityPresentation {
  if (typeof humidity !== "number" || !Number.isFinite(humidity)) {
    return UNAVAILABLE_HUMIDITY;
  }

  return {
    available: true,
    value: humidity,
    formatted: formatHumidityPercent(humidity),
  };
}
