import {
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
  type BayAreaProductRegion,
} from "@/lib/map/config";

/** Mirrors backend `LOCATION_REGION_ASSIGNMENTS` for the four product regions. */
export const LOCATION_PRODUCT_REGION_ASSIGNMENTS: Record<
  string,
  BayAreaProductRegion["id"]
> = {
  tiburon: "north-bay",
  sausalito: "north-bay",
  "mill-valley": "north-bay",
  "stinson-beach": "north-bay",
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
};

export function getProductRegionIdForLocation(
  locationId: string,
): BayAreaProductRegion["id"] | null {
  const regionId = LOCATION_PRODUCT_REGION_ASSIGNMENTS[locationId];
  if (!regionId || !isBayAreaProductRegionId(regionId)) {
    return null;
  }

  return regionId;
}

export function getProductRegionNameForLocation(locationId: string): string | null {
  const regionId = getProductRegionIdForLocation(locationId);
  if (!regionId) {
    return null;
  }

  return findBayAreaProductRegion(regionId)?.name ?? null;
}

export function filterLocationsByProductRegion<T extends { id: string }>(
  locations: T[],
  regionId: BayAreaProductRegion["id"] | null,
): T[] {
  if (!regionId) {
    return locations;
  }

  return locations.filter(
    (location) => getProductRegionIdForLocation(location.id) === regionId,
  );
}
