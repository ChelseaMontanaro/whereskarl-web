import {
  findBayAreaProductRegion,
  isBayAreaBackendRegionId,
  normalizeVisibleMapRegionId,
  type BayAreaBackendRegionId,
  type BayAreaVisibleProductRegionId,
  type MapBounds,
} from "@/lib/map/config";

export type LocationWithCoordinates = {
  id: string;
  latitude: number;
  longitude: number;
};

export function isLocationWithinProductRegionBounds(
  latitude: number,
  longitude: number,
  bounds: MapBounds,
): boolean {
  const [[west, south], [east, north]] = bounds;

  return (
    longitude >= west &&
    longitude <= east &&
    latitude >= south &&
    latitude <= north
  );
}

export type LocationWithRegion = {
  id: string;
  region?: string | null;
};

/**
 * Fallback when the API omits `region` (fixtures, older payloads).
 * Prefer `location.region` from `/locations` whenever present.
 */
export const LOCATION_BACKEND_REGION_ASSIGNMENTS: Record<
  string,
  BayAreaBackendRegionId
> = {
  tiburon: "north-bay",
  sausalito: "north-bay",
  "mill-valley": "north-bay",
  "stinson-beach": "north-bay",
  "marin-headlands": "north-bay",
  "ocean-beach": "san-francisco",
  "san-francisco": "san-francisco",
  presidio: "san-francisco",
  "golden-gate-park": "san-francisco",
  berkeley: "east-bay",
  oakland: "east-bay",
  "palo-alto": "south-bay",
  "mountain-view": "south-bay",
  "san-jose": "south-bay",
  // Half Moon Bay is a coastal Peninsula town (lon −122.43), not South Bay.
  // The South Bay camera sits east of it, so as `south-bay` it could never
  // render in its own region view; the Peninsula owns the coastal belt.
  "half-moon-bay": "peninsula",
  "daly-city": "peninsula",
  pacifica: "peninsula",
};

export function resolveBackendRegionId(
  location: LocationWithRegion,
): BayAreaBackendRegionId | null {
  const apiRegion = location.region?.trim().toLowerCase();
  if (apiRegion && isBayAreaBackendRegionId(apiRegion)) {
    return apiRegion;
  }

  const fallbackRegion = LOCATION_BACKEND_REGION_ASSIGNMENTS[location.id];
  if (fallbackRegion && isBayAreaBackendRegionId(fallbackRegion)) {
    return fallbackRegion;
  }

  return null;
}

/** Visible product region for chips, lists, markers, and trays. */
export function resolveProductRegionId(
  location: LocationWithRegion,
): BayAreaVisibleProductRegionId | null {
  const backendRegionId = resolveBackendRegionId(location);
  if (!backendRegionId) {
    return null;
  }

  return normalizeVisibleMapRegionId(backendRegionId);
}

export function getProductRegionIdForLocation(
  locationOrId: string | LocationWithRegion,
): BayAreaVisibleProductRegionId | null {
  if (typeof locationOrId === "string") {
    return resolveProductRegionId({ id: locationOrId });
  }

  return resolveProductRegionId(locationOrId);
}

export function getProductRegionNameForLocation(
  locationOrId: string | LocationWithRegion,
): string | null {
  const regionId = getProductRegionIdForLocation(locationOrId);
  if (!regionId) {
    return null;
  }

  return findBayAreaProductRegion(regionId)?.name ?? null;
}

export type LocationWithOptionalCoordinates = LocationWithRegion & {
  latitude?: number;
  longitude?: number;
};

/**
 * Canonical product-region membership test. A location belongs to `regionId`
 * when its resolved product region matches. When the location has no resolvable
 * region (backend omitted `region` and it is not in the fallback assignment
 * table) we fall back to the canonical region geometry so a valid coordinate
 * still appears in the geographically correct region instead of vanishing.
 *
 * This mirrors the universal app's `locationMatchesProductRegion` so web and
 * native share one membership rule and no future backend location silently
 * disappears from region views (audit RC-2 / RC-7).
 */
export function locationMatchesProductRegion<
  T extends LocationWithOptionalCoordinates,
>(location: T, regionId: BayAreaVisibleProductRegionId): boolean {
  const resolvedRegionId = resolveProductRegionId(location);
  if (resolvedRegionId === regionId) {
    return true;
  }

  // A location with a known (but different) region never leaks elsewhere.
  if (resolvedRegionId !== null) {
    return false;
  }

  const region = findBayAreaProductRegion(regionId);
  if (
    !region ||
    typeof location.latitude !== "number" ||
    typeof location.longitude !== "number"
  ) {
    return false;
  }

  return isLocationWithinProductRegionBounds(
    location.latitude,
    location.longitude,
    region.bounds,
  );
}

export function filterLocationsByProductRegion<
  T extends LocationWithOptionalCoordinates,
>(locations: T[], regionId: BayAreaVisibleProductRegionId | null): T[] {
  if (!regionId) {
    return locations;
  }

  return locations.filter((location) =>
    locationMatchesProductRegion(location, regionId),
  );
}
