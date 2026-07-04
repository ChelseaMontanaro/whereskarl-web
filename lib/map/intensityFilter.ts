import type { MapBounds } from "@/lib/map/config";
import {
  getBestRightNowScoreLabel,
  getFogIntensityLabel,
  locationMatchesFogIntensityFilter,
  type FogIntensity,
} from "@/lib/map/conditions";
import {
  bestRightNowLocationItems,
  type BestRightNowItem,
} from "@/lib/home/weatherDisplay";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { filterLocationsByProductRegion } from "@/lib/map/regions";
import type { LocationWeather } from "@/lib/schemas/weather";
import { isLocationDataDegraded } from "@/lib/weather/dataStatus";
import type { BayAreaProductRegionId } from "@/lib/map/config";

export function locationMatchesIntensity(
  location: LocationWeather,
  intensity: FogIntensity,
): boolean {
  return locationMatchesFogIntensityFilter(location, intensity);
}

export function intensityFilterTrayItems(
  locations: LocationWeather[],
  intensity: FogIntensity,
  excludeLocationId: string | null | undefined,
  limit = 4,
  regionId: BayAreaProductRegionId | null = null,
): BestRightNowItem[] {
  const excludedId = excludeLocationId?.trim().toLowerCase() ?? null;
  const scopedLocations = filterLocationsByProductRegion(locations, regionId);

  return scopedLocations
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
      scoreLabel: getBestRightNowScoreLabel(location),
      rank: index + 1,
      isDegraded: isLocationDataDegraded(location.dataStatus),
    }));
}

/** Score-ranked tray items for the map, scoped to the active region and intensity filter. */
export function mapBestRightNowTrayItems(
  locations: LocationWeather[],
  intensityFilter: FogIntensity | null,
  regionId: BayAreaProductRegionId | null,
  excludeLocationId: string | null = null,
  limit = 4,
): BestRightNowItem[] {
  if (intensityFilter === "clear") {
    return intensityFilterTrayItems(
      locations,
      "clear",
      excludeLocationId,
      limit,
      regionId,
    );
  }

  const scopedLocations = filterLocationsByProductRegion(locations, regionId);
  return bestRightNowLocationItems(scopedLocations, excludeLocationId, limit);
}

export function intensityFilterTrayTitle(intensity: FogIntensity): string {
  return `${getFogIntensityLabel(intensity)} Locations`;
}

/** Desktop tray is shown only for actionable clear-sky recommendations. */
export function shouldShowDesktopBestRightNowTray(
  intensityFilter: FogIntensity | null,
): boolean {
  return intensityFilter === null || intensityFilter === "clear";
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
  const matching = locations.filter((location) =>
    locationMatchesFogIntensityFilter(location, intensity),
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
