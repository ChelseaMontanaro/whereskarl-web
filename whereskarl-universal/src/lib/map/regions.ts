/**
 * Bay Area product regions — aligned with whereskarl-web/lib/map/regions.ts.
 */

export const BAY_AREA_VISIBLE_PRODUCT_REGION_IDS = [
  'san-francisco',
  'north-bay',
  'east-bay',
  'south-bay',
] as const;

export const BAY_AREA_BACKEND_REGION_IDS = [
  ...BAY_AREA_VISIBLE_PRODUCT_REGION_IDS,
  'peninsula',
] as const;

export type BayAreaVisibleProductRegionId =
  (typeof BAY_AREA_VISIBLE_PRODUCT_REGION_IDS)[number];

export type BayAreaBackendRegionId =
  (typeof BAY_AREA_BACKEND_REGION_IDS)[number];

export type BayAreaProductRegion = {
  id: BayAreaVisibleProductRegionId;
  name: string;
  chipLabel: string;
};

export const BAY_AREA_PRODUCT_REGIONS: BayAreaProductRegion[] = [
  { id: 'san-francisco', name: 'San Francisco', chipLabel: 'SF' },
  { id: 'north-bay', name: 'North Bay', chipLabel: 'North Bay' },
  { id: 'east-bay', name: 'East Bay', chipLabel: 'East Bay' },
  { id: 'south-bay', name: 'South Bay', chipLabel: 'South Bay' },
];

const BACKEND_TO_VISIBLE_REGION: Record<
  BayAreaBackendRegionId,
  BayAreaVisibleProductRegionId
> = {
  'san-francisco': 'san-francisco',
  'north-bay': 'north-bay',
  'east-bay': 'east-bay',
  'south-bay': 'south-bay',
  peninsula: 'san-francisco',
};

/**
 * Fallback when the API omits `region` (fixtures, older payloads).
 * Prefer `location.region` from `/locations` whenever present.
 */
export const LOCATION_BACKEND_REGION_ASSIGNMENTS: Record<
  string,
  BayAreaBackendRegionId
> = {
  tiburon: 'north-bay',
  sausalito: 'north-bay',
  'mill-valley': 'north-bay',
  'stinson-beach': 'north-bay',
  'marin-headlands': 'north-bay',
  'ocean-beach': 'san-francisco',
  'san-francisco': 'san-francisco',
  presidio: 'san-francisco',
  'golden-gate-park': 'san-francisco',
  'ocean-beach-sf': 'san-francisco',
  berkeley: 'east-bay',
  oakland: 'east-bay',
  'palo-alto': 'south-bay',
  'mountain-view': 'south-bay',
  'san-jose': 'south-bay',
  'half-moon-bay': 'south-bay',
  'daly-city': 'peninsula',
  pacifica: 'peninsula',
};

export type LocationWithRegion = {
  id: string;
  region?: string | null;
};

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

export function resolveProductRegionId(
  location: LocationWithRegion,
): BayAreaVisibleProductRegionId | null {
  const backendRegionId = resolveBackendRegionId(location);
  if (!backendRegionId) {
    return null;
  }

  return normalizeVisibleMapRegionId(backendRegionId);
}

export function filterLocationsByProductRegion<T extends LocationWithRegion>(
  locations: T[],
  regionId: BayAreaVisibleProductRegionId | null,
): T[] {
  if (!regionId) {
    return locations;
  }

  return locations.filter(
    (location) => resolveProductRegionId(location) === regionId,
  );
}

export function toggleRegionFilter(
  current: BayAreaVisibleProductRegionId | null,
  next: BayAreaVisibleProductRegionId,
): BayAreaVisibleProductRegionId | null {
  return current === next ? null : next;
}
