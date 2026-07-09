/**
 * Bay Area product regions — aligned with whereskarl-web/lib/map/regions.ts.
 */

import {
  BAY_AREA_DESKTOP_VIEWPORT_PADDING,
  BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
  PHONE_PORTRAIT_MAP_VIEWPORT_PADDING,
  type KarlMapLayoutMode,
  type MapViewportPadding,
} from '@/lib/map/mapConfig';

export type MapBounds = [[number, number], [number, number]];

export type BayAreaProductRegionViewport = {
  padding?: MapViewportPadding;
  phonePortraitPadding?: MapViewportPadding;
  maxZoom?: number;
};

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
  bounds: MapBounds;
  viewport?: BayAreaProductRegionViewport;
};

export const BAY_AREA_PRODUCT_REGIONS: BayAreaProductRegion[] = [
  {
    id: 'san-francisco',
    name: 'San Francisco',
    chipLabel: 'SF',
    // Desktop framing. Phone-portrait web overrides this in KarlMap.web via
    // the approved PHONE_PORTRAIT_SF_CENTRAL_BAY_BOUNDS composition.
    bounds: [
      [-122.68, 37.8],
      [-122.2, 38.12],
    ],
    viewport: {
      padding: 36,
      phonePortraitPadding: PHONE_PORTRAIT_MAP_VIEWPORT_PADDING,
      maxZoom: 11.9,
    },
  },
  {
    id: 'north-bay',
    name: 'North Bay',
    chipLabel: 'North Bay',
    bounds: [
      [-122.65, 37.795],
      [-122.43, 38.02],
    ],
    viewport: {
      padding: 36,
      phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
      maxZoom: 11.3,
    },
  },
  {
    id: 'east-bay',
    name: 'East Bay',
    chipLabel: 'East Bay',
    bounds: [
      [-122.33, 37.7],
      [-121.72, 38.02],
    ],
    viewport: {
      padding: 36,
      phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
      maxZoom: 10.5,
    },
  },
  {
    id: 'south-bay',
    name: 'South Bay',
    chipLabel: 'South Bay',
    bounds: [
      [-122.5, 37.08],
      [-121.7, 37.58],
    ],
    viewport: {
      padding: 36,
      phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
      maxZoom: 11,
    },
  },
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

export type LocationWithCoordinates = LocationWithRegion & {
  latitude?: number;
  longitude?: number;
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

export function resolveRegionViewportFitOptions(
  region: BayAreaProductRegion,
  layout: KarlMapLayoutMode,
  options?: { phonePortraitWeb?: boolean },
): { padding: MapViewportPadding; maxZoom: number } {
  const viewport = region.viewport;

  if (layout === 'mobile') {
    return {
      padding: options?.phonePortraitWeb
        ? PHONE_PORTRAIT_MAP_VIEWPORT_PADDING
        : viewport?.phonePortraitPadding ??
          BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
      maxZoom: viewport?.maxZoom ?? 11,
    };
  }

  return {
    padding: viewport?.padding ?? BAY_AREA_DESKTOP_VIEWPORT_PADDING,
    maxZoom: viewport?.maxZoom ?? 11,
  };
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

export function locationMatchesProductRegion<T extends LocationWithCoordinates>(
  location: T,
  regionId: BayAreaVisibleProductRegionId,
): boolean {
  const resolvedRegionId = resolveProductRegionId(location);
  if (resolvedRegionId === regionId) {
    return true;
  }

  if (resolvedRegionId !== null) {
    return false;
  }

  const region = findBayAreaProductRegion(regionId);
  if (
    !region ||
    typeof location.latitude !== 'number' ||
    typeof location.longitude !== 'number'
  ) {
    return false;
  }

  return isLocationWithinProductRegionBounds(
    location.latitude,
    location.longitude,
    region.bounds,
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

export function filterLocationsByProductRegion<
  T extends LocationWithCoordinates,
>(
  locations: T[],
  regionId: BayAreaVisibleProductRegionId | null,
): T[] {
  if (!regionId) {
    return locations;
  }

  return locations.filter((location) =>
    locationMatchesProductRegion(location, regionId),
  );
}

export function toggleRegionFilter(
  current: BayAreaVisibleProductRegionId | null,
  next: BayAreaVisibleProductRegionId,
): BayAreaVisibleProductRegionId | null {
  return current === next ? null : next;
}
