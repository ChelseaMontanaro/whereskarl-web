/**
 * Bay Area product regions — membership from `@whereskarl/domain`;
 * camera/viewport padding remains app-owned.
 */

import {
  BAY_AREA_PRODUCT_REGIONS as PRODUCT_REGION_CATALOG,
  findBayAreaProductRegion as findCatalogRegion,
  type BayAreaProductRegion as CatalogProductRegion,
  type BayAreaVisibleProductRegionId,
  type LocationWithCoordinates as DomainLocationWithCoordinates,
  type MapBounds,
} from '@whereskarl/domain';

import {
  BAY_AREA_DESKTOP_VIEWPORT_PADDING,
  BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
  PHONE_PORTRAIT_MAP_VIEWPORT_PADDING,
  type KarlMapLayoutMode,
  type MapViewportPadding,
} from '@/lib/map/mapConfig';

export type { MapBounds, BayAreaVisibleProductRegionId, LocationWithRegion, BayAreaBackendRegionId } from '@whereskarl/domain';

export type BayAreaProductRegionViewport = {
  padding?: MapViewportPadding;
  phonePortraitPadding?: MapViewportPadding;
  maxZoom?: number;
};

export type BayAreaProductRegion = CatalogProductRegion & {
  viewport?: BayAreaProductRegionViewport;
};

export type LocationWithCoordinates = DomainLocationWithCoordinates;

export {
  BAY_AREA_BACKEND_REGION_IDS,
  BAY_AREA_VISIBLE_PRODUCT_REGION_IDS,
  filterLocationsByProductRegion,
  isBayAreaBackendRegionId,
  isBayAreaProductRegionId,
  isLocationWithinProductRegionBounds,
  locationMatchesProductRegion,
  normalizeVisibleMapRegionId,
  resolveBackendRegionId,
  resolveProductRegionId,
} from '@whereskarl/domain';

const REGION_VIEWPORTS: Record<
  BayAreaVisibleProductRegionId,
  BayAreaProductRegionViewport
> = {
  'san-francisco': {
    padding: 36,
    phonePortraitPadding: PHONE_PORTRAIT_MAP_VIEWPORT_PADDING,
    maxZoom: 11.9,
  },
  'north-bay': {
    padding: 36,
    phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
    maxZoom: 11.3,
  },
  'east-bay': {
    padding: 36,
    phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
    maxZoom: 10.5,
  },
  'south-bay': {
    padding: 36,
    phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
    maxZoom: 11,
  },
  peninsula: {
    padding: 36,
    phonePortraitPadding: BAY_AREA_PHONE_PORTRAIT_REGION_VIEWPORT_PADDING,
    maxZoom: 9.8,
  },
};

export const BAY_AREA_PRODUCT_REGIONS: BayAreaProductRegion[] =
  PRODUCT_REGION_CATALOG.map((region) => ({
    ...region,
    viewport: REGION_VIEWPORTS[region.id],
  }));

export function findBayAreaProductRegion(
  regionId: string | null | undefined,
): BayAreaProductRegion | null {
  const region = findCatalogRegion(regionId);
  if (!region) {
    return null;
  }

  return {
    ...region,
    viewport: REGION_VIEWPORTS[region.id],
  };
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

export function toggleRegionFilter(
  current: BayAreaVisibleProductRegionId | null,
  next: BayAreaVisibleProductRegionId,
): BayAreaVisibleProductRegionId | null {
  return current === next ? null : next;
}
