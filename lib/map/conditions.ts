export type FogIntensity = "clear" | "lightFog" | "foggy" | "karlTerritory";

/** Aligns with Best Right Now / sunshineResultTitle "BEST CLEAR SKIES" threshold. */
export const CLEAR_SKIES_SCORE_THRESHOLD = 50;

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

export function locationQualifiesAsClearIntensity(
  location: LocationConditionInput,
): boolean {
  const fogScore = resolveFogScore(location);
  if (fogScore === null) {
    return true;
  }

  if (getFogIntensity(fogScore) === "karlTerritory") {
    return false;
  }

  if (
    typeof location.sunshineScore === "number" &&
    location.sunshineScore >= CLEAR_SKIES_SCORE_THRESHOLD
  ) {
    return true;
  }

  return getFogIntensity(fogScore) === "clear";
}

/**
 * Map-facing intensity that treats high Clear Skies Score locations as clear
 * even when fogScore sits in a foggier band.
 */
export function resolveLocationFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  if (locationQualifiesAsClearIntensity(location)) {
    return "clear";
  }

  const fogScore = resolveFogScore(location);
  if (fogScore === null) {
    return "clear";
  }

  return getFogIntensity(fogScore);
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
