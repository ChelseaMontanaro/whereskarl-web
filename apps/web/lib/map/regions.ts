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
 * Phase 16.2A: backend `/locations.region` is the single source of truth.
 * Do not maintain a parallel frontend catalog→region map.
 *
 * Reserved future location IDs (not in catalog; do not invent bare aliases):
 * - richmond-district — San Francisco Richmond District
 * - richmond-ca — Richmond, East Bay city
 * Canonical Ocean Beach id is `ocean-beach` only (`ocean-beach-sf` remaps in routing).
 */
export function resolveBackendRegionId(
  location: LocationWithRegion,
): BayAreaBackendRegionId | null {
  const apiRegion = location.region?.trim().toLowerCase();
  if (apiRegion && isBayAreaBackendRegionId(apiRegion)) {
    return apiRegion;
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
    // String-only ids cannot resolve a region without backend metadata.
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
 * when its resolved product region (from backend `location.region`) matches.
 * When the location has no resolvable region, fall back to canonical region
 * geometry so a valid coordinate still appears in the geographically correct
 * region instead of vanishing (audit RC-2 / RC-7).
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
