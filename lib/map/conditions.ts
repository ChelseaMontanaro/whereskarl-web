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

/**
 * Marker icons, labels, and fog overlays — raw fogScore bands only.
 * Sunshine score never overrides the Light Fog band (25–49).
 */
export function resolveLocationFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  return getFogIntensity(resolveFogScore(location));
}

/**
 * Marker-facing intensity when an active filter provides display context.
 * Clear filter shows matching clear-sky locations as Clear even in the Light Fog band.
 */
export function resolveMarkerDisplayIntensity(
  location: LocationConditionInput,
  intensityFilter?: FogIntensity | null,
): FogIntensity {
  if (
    intensityFilter === "clear" &&
    locationQualifiesAsClearIntensity(location)
  ) {
    return "clear";
  }

  return resolveLocationFogIntensity(location);
}

export function getMarkerDisplayConditionLabel(
  location: LocationConditionInput,
  options: {
    intensityFilter?: FogIntensity | null;
    isNighttime?: boolean;
  } = {},
): string {
  const intensity = resolveMarkerDisplayIntensity(
    location,
    options.intensityFilter,
  );
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
      resolveLocationFogIntensity(location) === "lightFog" &&
      !locationQualifiesAsClearIntensity(location)
    );
  }

  return resolveLocationFogIntensity(location) === intensity;
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

export type FogOverlayStyle = {
  color: string;
  opacity: number;
  radiusMeters: number;
};

function getFogOverlayIntensity(location: LocationConditionInput): FogIntensity | null {
  const fogScore = resolveFogScore(location);
  if (fogScore === null || resolveLocationFogIntensity(location) === "clear") {
    return null;
  }

  return getFogIntensity(fogScore);
}

/** Mirrors iOS per-location fog circles; not a backend geographic fog raster. */
export function getLocationFogOverlayStyle(
  location: LocationConditionInput,
): FogOverlayStyle | null {
  const intensity = getFogOverlayIntensity(location);
  const fogScore = resolveFogScore(location);

  if (!intensity || fogScore === null) {
    return null;
  }

  switch (intensity) {
    case "clear":
      return null;
    case "lightFog":
      return {
        color: "rgb(255 255 255)",
        opacity: Math.min(0.22, 0.06 + (fogScore / 100) * 0.12),
        radiusMeters: 1400 + fogScore * 18,
      };
    case "foggy":
      return {
        color: "rgb(255 255 255)",
        opacity: Math.min(0.36, 0.1 + (fogScore / 100) * 0.22),
        radiusMeters: 2200 + fogScore * 42,
      };
    case "karlTerritory":
      return {
        color: "rgb(184 214 237)",
        opacity: Math.min(0.48, 0.14 + (fogScore / 100) * 0.28),
        radiusMeters: 2800 + fogScore * 58,
      };
    default:
      return null;
  }
}

/** @deprecated Prefer getLocationFogOverlayStyle for location-aware overlay rules. */
export function getFogOverlayStyle(fogScore: number | null): FogOverlayStyle | null {
  if (fogScore === null) {
    return null;
  }

  return getLocationFogOverlayStyle({ fogScore });
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
