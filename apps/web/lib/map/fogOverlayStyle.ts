import {
  getFogIntensity,
  locationQualifiesAsClearIntensity,
  resolveFogScore,
  type LocationConditionInput,
} from "@whereskarl/domain";

export type FogOverlayStyle = {
  color: string;
  opacity: number;
  radiusMeters: number;
};

function getFogOverlayIntensity(location: LocationConditionInput): ReturnType<
  typeof getFogIntensity
> | null {
  const fogScore = resolveFogScore(location);
  if (fogScore === null || locationQualifiesAsClearIntensity(location)) {
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
        color: "rgb(228 236 244)",
        opacity: Math.min(0.22, 0.06 + (fogScore / 100) * 0.12),
        radiusMeters: 1400 + fogScore * 18,
      };
    case "foggy":
      return {
        color: "rgb(210 224 238)",
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
