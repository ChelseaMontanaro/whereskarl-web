export type FogIntensity = "clear" | "lightFog" | "foggy" | "karlTerritory";

/** Aligns with Best Right Now / sunshineResultTitle "BEST CLEAR SKIES" threshold. */
export const CLEAR_SKIES_SCORE_THRESHOLD = 50;

/** Strong clear-sky locations qualify for the Clear intensity filter. */
export const CLEAR_INTENSITY_SUNSHINE_THRESHOLD = 70;

export type LocationConditionInput = {
  fogScore?: number | null;
  sunshineScore?: number | null;
  status?: string | null;
};

export function resolveFogScore(location: LocationConditionInput): number | null {
  if (typeof location.fogScore === "number" && Number.isFinite(location.fogScore)) {
    return clampScore(location.fogScore);
  }

  if (typeof location.sunshineScore === "number" && Number.isFinite(location.sunshineScore)) {
    return clampScore(100 - location.sunshineScore);
  }

  return null;
}

export function getFogIntensity(fogScore: number | null): FogIntensity {
  if (fogScore === null) {
    return "clear";
  }

  if (fogScore < 25) {
    return "clear";
  }

  if (fogScore < 50) {
    return "lightFog";
  }

  if (fogScore < 75) {
    return "foggy";
  }

  return "karlTerritory";
}

/**
 * True when a location belongs in the Clear intensity filter.
 * Strong clear-sky scores or the raw fogScore clear band (< 25).
 */
export function locationQualifiesAsClearIntensity(
  location: LocationConditionInput,
): boolean {
  const fogScore = resolveFogScore(location);

  if (fogScore !== null && fogScore < 25) {
    return true;
  }

  if (
    typeof location.sunshineScore === "number" &&
    Number.isFinite(location.sunshineScore) &&
    location.sunshineScore >= CLEAR_INTENSITY_SUNSHINE_THRESHOLD
  ) {
    return true;
  }

  return false;
}

/** Raw fogScore bands only — use for filter matching and internal scoring. */
export function resolveRawLocationFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  return getFogIntensity(resolveFogScore(location));
}

/**
 * User-facing intensity for markers, labels, overlays, and trays.
 * Clear-qualified locations render as Clear before raw fogScore bands apply.
 */
export function resolveLocationFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  if (locationQualifiesAsClearIntensity(location)) {
    return "clear";
  }

  return resolveRawLocationFogIntensity(location);
}

/** Marker display intensity — aligned with the user-facing contract. */
export function resolveMarkerDisplayIntensity(
  location: LocationConditionInput,
): FogIntensity {
  return resolveLocationFogIntensity(location);
}

export function getMarkerDisplayConditionLabel(
  location: LocationConditionInput,
  options: {
    isNighttime?: boolean;
  } = {},
): string {
  const intensity = resolveMarkerDisplayIntensity(location);
  const fogScore = resolveFogScore(location);

  if (fogScore !== null) {
    return getFogIntensityLabel(intensity, options.isNighttime ?? false);
  }

  return location.status?.trim() || "Conditions unavailable";
}

/**
 * Canonical intensity filter matching for map markers, trays, and overlays.
 * Clear uses clear-sky qualification; Light Fog excludes strong clear-sky locations.
 */
export function locationMatchesFogIntensityFilter(
  location: LocationConditionInput,
  intensity: FogIntensity,
): boolean {
  if (intensity === "clear") {
    return locationQualifiesAsClearIntensity(location);
  }

  if (intensity === "lightFog") {
    return (
      resolveRawLocationFogIntensity(location) === "lightFog" &&
      !locationQualifiesAsClearIntensity(location)
    );
  }

  return resolveRawLocationFogIntensity(location) === intensity;
}

/**
 * Score suffix for Best Right Now / map tray cards aligned with fog intensity.
 */
export function getBestRightNowScoreLabel(
  location: LocationConditionInput,
): string {
  const score = location.sunshineScore;

  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "";
  }

  if (locationQualifiesAsClearIntensity(location)) {
    return `${score} clear`;
  }

  switch (resolveLocationFogIntensity(location)) {
    case "clear":
      return `${score} clear`;
    case "lightFog":
      return `${score} sunshine`;
    case "foggy":
      return `${score} foggy`;
    case "karlTerritory":
      return `${score} fog`;
    default:
      return `${score}`;
  }
}

export function getFogIntensityLabel(
  intensity: FogIntensity,
  isNighttime = false,
): string {
  switch (intensity) {
    case "clear":
      return isNighttime ? "Clear Night" : "Clear";
    case "lightFog":
      return "Light Fog";
    case "foggy":
      return "Foggy";
    case "karlTerritory":
      return "Karl Territory";
  }
}

export function getLocationConditionLabel(
  location: LocationConditionInput,
  isNighttime = false,
): string {
  const intensity = resolveLocationFogIntensity(location);
  const fogScore = resolveFogScore(location);

  if (fogScore !== null) {
    return getFogIntensityLabel(intensity, isNighttime);
  }

  return location.status?.trim() || "Conditions unavailable";
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
