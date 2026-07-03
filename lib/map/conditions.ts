export type FogIntensity = "clear" | "lightFog" | "foggy" | "karlTerritory";

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
  const fogScore = resolveFogScore(location);
  if (fogScore !== null) {
    return getFogIntensityLabel(getFogIntensity(fogScore), isNighttime);
  }

  return location.status?.trim() || "Conditions unavailable";
}

export type FogOverlayStyle = {
  color: string;
  opacity: number;
  radiusMeters: number;
};

/** Mirrors iOS per-location fog circles; not a backend geographic fog raster. */
export function getFogOverlayStyle(fogScore: number | null): FogOverlayStyle | null {
  if (fogScore === null || fogScore < 25) {
    return null;
  }

  const radiusMeters = 1800 + fogScore * 58;
  const opacity = Math.min(0.48, 0.08 + (fogScore / 100) * 0.28);

  if (fogScore >= 78) {
    return {
      color: "rgb(184 214 237)",
      opacity,
      radiusMeters,
    };
  }

  if (fogScore >= 58) {
    return {
      color: "rgb(255 255 255)",
      opacity,
      radiusMeters,
    };
  }

  return {
    color: "rgb(255 255 255)",
    opacity: opacity * 0.72,
    radiusMeters,
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
