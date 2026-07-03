import {
  getFogIntensity,
  getFogIntensityLabel,
  resolveFogScore,
  type FogIntensity,
} from "@/lib/map/conditions";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
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
