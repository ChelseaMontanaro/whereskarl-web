/**
 * Canonical humidity value formatting for selected-location and other surfaces.
 *
 * Humidity arrives on `LocationWeather.humidity` as a normalized percentage
 * from the backend. This helper formats that raw number for display — it does
 * not invent qualitative labels (Comfortable / Dry / etc.), color bands, or
 * frontend thresholds. When a backend-owned humidity category object ships,
 * present it the same way AQI / UV / Pollen do; until then, value-only is
 * the honest contract.
 */

export type HumidityPresentation = {
  available: boolean;
  /** Normalized relative humidity 0–100 when available. */
  value: number | null;
  /** Display string such as "72%" or "Unavailable". */
  formatted: string;
};

const UNAVAILABLE_HUMIDITY: HumidityPresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
};

/**
 * Format a relative-humidity percentage for UI. Rounds to the nearest whole
 * percent; does not apply comfort categories.
 */
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
