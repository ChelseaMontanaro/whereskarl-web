/**
 * Product region catalog and membership helpers.
 *
 * Membership `bounds` live here. Map camera / viewport padding profiles stay
 * application-owned (architecture §6 / ADR-012).
 *
 * Backend `/locations.region` is the single source of truth for catalog
 * membership. Do not maintain a parallel frontend catalog→region map.
 *
 * Reserved future location IDs (not in catalog; do not invent bare aliases):
 * - richmond-district — San Francisco Richmond District
 * - richmond-ca — Richmond, East Bay city
 * Canonical Ocean Beach id is `ocean-beach` only (`ocean-beach-sf` remaps in search).
 */

export type MapBounds = [[number, number], [number, number]];

/** Region chips and map filtering — SF, North Bay, East Bay, South Bay, Peninsula. */
export const BAY_AREA_VISIBLE_PRODUCT_REGION_IDS = [
  "san-francisco",
  "north-bay",
  "east-bay",
  "south-bay",
  "peninsula",
] as const;

/**
 * Backend `/locations` region values. Every backend region is also a visible
 * product region on the currently approved reference implementation (Peninsula
 * included), so this is the same canonical set as
 * {@link BAY_AREA_VISIBLE_PRODUCT_REGION_IDS}.
 */
export const BAY_AREA_BACKEND_REGION_IDS = [
  ...BAY_AREA_VISIBLE_PRODUCT_REGION_IDS,
] as const;

export type BayAreaVisibleProductRegionId =
  (typeof BAY_AREA_VISIBLE_PRODUCT_REGION_IDS)[number];

export type BayAreaBackendRegionId = (typeof BAY_AREA_BACKEND_REGION_IDS)[number];

/** Visible product region id used by chips, routing, and UI filtering. */
export type BayAreaProductRegionId = BayAreaVisibleProductRegionId;

export type BayAreaProductRegion = {
  id: BayAreaVisibleProductRegionId;
  name: string;
  /** Short label shown on region chips (e.g. "SF" for San Francisco). */
  chipLabel: string;
  /** Membership bounds for product-region filtering (not camera framing). */
  bounds: MapBounds;
};

export const BAY_AREA_PRODUCT_REGIONS: BayAreaProductRegion[] = [
  {
    id: "san-francisco",
    name: "San Francisco",
    chipLabel: "SF",
    bounds: [
      [-122.54, 37.615],
      [-122.26, 37.84],
    ],
  },
  {
    id: "north-bay",
    name: "North Bay",
    chipLabel: "North Bay",
    bounds: [
      [-122.65, 37.795],
      [-122.43, 38.02],
    ],
  },
  {
    id: "east-bay",
    name: "East Bay",
    chipLabel: "East Bay",
    // Phase 16.2E catalog: Berkeley → Oakland → Alameda plus Hayward and
    // Fremont. Earlier south edge (37.7) clipped the two southern pins until
    // the user zoomed out. Keep the inland/north context; only extend south.
    bounds: [
      [-122.33, 37.52],
      [-121.72, 38.02],
    ],
  },
  {
    id: "south-bay",
    name: "South Bay",
    chipLabel: "South Bay",
    bounds: [
      [-122.5, 37.08],
      [-121.7, 37.58],
    ],
  },
  {
    id: "peninsula",
    name: "Peninsula",
    chipLabel: "Peninsula",
    // Phase 16.2A / 16.2D-1 catalog: Daly City → Pacifica → Half Moon Bay
    // (coast) and San Mateo → Redwood City → Palo Alto (bay corridor).
    bounds: [
      [-122.55, 37.28],
      [-121.95, 37.74],
    ],
  },
];

/** Maps backend regions into visible product regions. */
const BACKEND_TO_VISIBLE_REGION: Record<
  BayAreaBackendRegionId,
  BayAreaVisibleProductRegionId
> = {
  "san-francisco": "san-francisco",
  "north-bay": "north-bay",
  "east-bay": "east-bay",
  "south-bay": "south-bay",
  peninsula: "peninsula",
};

export function findBayAreaProductRegion(
  regionId: string | null | undefined,
): BayAreaProductRegion | null {
  if (!regionId) {
    return null;
  }

  const visibleRegionId = normalizeVisibleMapRegionId(regionId);
  if (!visibleRegionId) {
    return null;
  }

  return (
    BAY_AREA_PRODUCT_REGIONS.find((region) => region.id === visibleRegionId) ??
    null
  );
}

export function isBayAreaBackendRegionId(
  regionId: string,
): regionId is BayAreaBackendRegionId {
  return BAY_AREA_BACKEND_REGION_IDS.includes(regionId as BayAreaBackendRegionId);
}

export function isBayAreaProductRegionId(
  regionId: string,
): regionId is BayAreaVisibleProductRegionId {
  return BAY_AREA_VISIBLE_PRODUCT_REGION_IDS.includes(
    regionId as BayAreaVisibleProductRegionId,
  );
}

export function normalizeVisibleMapRegionId(
  regionId: string,
): BayAreaVisibleProductRegionId | null {
  const normalized = regionId.trim().toLowerCase();

  if (isBayAreaBackendRegionId(normalized)) {
    return BACKEND_TO_VISIBLE_REGION[normalized];
  }

  return null;
}

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

/** Alias used by map consumers for locations that may include coordinates. */
export type LocationWithCoordinates = LocationWithOptionalCoordinates;

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
