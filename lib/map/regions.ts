import {
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
  type BayAreaProductRegionId,
} from "@/lib/map/config";

export type LocationWithRegion = {
  id: string;
  region?: string | null;
};

/**
 * Fallback when the API omits `region` (fixtures, older payloads).
 * Prefer `location.region` from `/locations` whenever present.
 */
export const LOCATION_PRODUCT_REGION_ASSIGNMENTS: Record<
  string,
  BayAreaProductRegionId
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
  "half-moon-bay": "south-bay",
  "daly-city": "peninsula",
  pacifica: "peninsula",
};

export function resolveProductRegionId(
  location: LocationWithRegion,
): BayAreaProductRegionId | null {
  const apiRegion = location.region?.trim().toLowerCase();
  if (apiRegion && isBayAreaProductRegionId(apiRegion)) {
    return apiRegion;
  }

  const fallbackRegion = LOCATION_PRODUCT_REGION_ASSIGNMENTS[location.id];
  if (fallbackRegion && isBayAreaProductRegionId(fallbackRegion)) {
    return fallbackRegion;
  }

  return null;
}

export function getProductRegionIdForLocation(
  locationOrId: string | LocationWithRegion,
): BayAreaProductRegionId | null {
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

export function filterLocationsByProductRegion<T extends LocationWithRegion>(
  locations: T[],
  regionId: BayAreaProductRegionId | null,
): T[] {
  if (!regionId) {
    return locations;
  }

  return locations.filter(
    (location) => resolveProductRegionId(location) === regionId,
  );
}
