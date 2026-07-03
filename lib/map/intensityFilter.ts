import type { MapBounds } from "@/lib/map/config";
import {
  getFogIntensity,
  getFogIntensityLabel,
  resolveFogScore,
  type FogIntensity,
} from "@/lib/map/conditions";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { getMarkerFogIntensity } from "@/lib/map/markers";
import type { LocationWeather } from "@/lib/schemas/weather";

export function locationMatchesIntensity(
  location: LocationWeather,
  intensity: FogIntensity,
): boolean {
  return getFogIntensity(resolveFogScore(location)) === intensity;
}

export function intensityFilterTrayItems(
  locations: LocationWeather[],
  intensity: FogIntensity,
  excludeLocationId: string | null | undefined,
  limit = 4,
): BestRightNowItem[] {
  const excludedId = excludeLocationId?.trim().toLowerCase() ?? null;

  return locations
    .filter((location) => locationMatchesIntensity(location, intensity))
    .filter(
      (location) =>
        !excludedId || location.id.trim().toLowerCase() !== excludedId,
    )
    .sort((left, right) => right.sunshineScore - left.sunshineScore)
    .slice(0, limit)
    .map((location, index) => ({
      locationId: location.id,
      locationName: location.name,
      detail:
        location.status?.trim() ||
        location.karlReason?.trim() ||
        getFogIntensityLabel(intensity),
      score: location.sunshineScore,
      rank: index + 1,
    }));
}

export function intensityFilterTrayTitle(intensity: FogIntensity): string {
  return `${getFogIntensityLabel(intensity)} Locations`;
}

export function toggleIntensityFilter(
  current: FogIntensity | null,
  next: FogIntensity,
): FogIntensity | null {
  return current === next ? null : next;
}

export function boundsForIntensityLocations(
  locations: MapMarkerLocation[],
  intensity: FogIntensity,
): MapBounds | null {
  const matching = locations.filter(
    (location) => getMarkerFogIntensity(location) === intensity,
  );

  if (matching.length === 0) {
    return null;
  }

  let minLongitude = matching[0].longitude;
  let minLatitude = matching[0].latitude;
  let maxLongitude = matching[0].longitude;
  let maxLatitude = matching[0].latitude;

  for (const location of matching.slice(1)) {
    minLongitude = Math.min(minLongitude, location.longitude);
    minLatitude = Math.min(minLatitude, location.latitude);
    maxLongitude = Math.max(maxLongitude, location.longitude);
    maxLatitude = Math.max(maxLatitude, location.latitude);
  }

  return [
    [minLongitude, minLatitude],
    [maxLongitude, maxLatitude],
  ];
}
