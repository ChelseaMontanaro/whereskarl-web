import type { MapBounds } from "@/lib/map/config";
import {
  CLEAR_INTENSITY_SUNSHINE_THRESHOLD,
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

/** Score-ranked tray items for the map across the full Bay Area. */
export function mapBestRightNowTrayItems(
  locations: LocationWeather[],
  intensityFilter: FogIntensity | null,
  excludeLocationId: string | null = null,
  limit = 4,
): BestRightNowItem[] {
  if (intensityFilter === "clear") {
    return intensityFilterTrayItems(
      locations,
      "clear",
      excludeLocationId,
      limit,
      null,
    );
  }

  return bestRightNowLocationItems(locations, excludeLocationId, limit);
}

export const PHONE_PORTRAIT_BEST_RIGHT_NOW_MAX_ITEMS = 4;

export const PHONE_PORTRAIT_BEST_RIGHT_NOW_EMPTY_MESSAGE =
  "No clear spots above 70 right now";

/** Phone-portrait tray: only strong clear-sky scores, ranked highest first. */
export function phonePortraitBestRightNowTrayItems(
  locations: LocationWeather[],
  excludeLocationId: string | null = null,
  limit = PHONE_PORTRAIT_BEST_RIGHT_NOW_MAX_ITEMS,
): BestRightNowItem[] {
  const excludedId = excludeLocationId?.trim().toLowerCase() ?? null;

  return locations
    .filter((location) => {
      if (excludedId && location.id.trim().toLowerCase() === excludedId) {
        return false;
      }

      return (
        typeof location.sunshineScore === "number" &&
        Number.isFinite(location.sunshineScore) &&
        location.sunshineScore >= CLEAR_INTENSITY_SUNSHINE_THRESHOLD
      );
    })
    .sort((left, right) => right.sunshineScore - left.sunshineScore)
    .slice(0, limit)
    .map((location, index) => ({
      locationId: location.id,
      locationName: location.name,
      detail:
        location.status?.trim() ||
        location.karlReason?.trim() ||
        "Clear skies",
      score: location.sunshineScore,
      scoreLabel: getBestRightNowScoreLabel(location),
      rank: index + 1,
      isDegraded: isLocationDataDegraded(location.dataStatus),
    }));
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
