import {
  BAY_AREA_PRODUCT_REGIONS as PRODUCT_REGION_CATALOG,
  findBayAreaProductRegion as findCatalogRegion,
  type BayAreaProductRegion as CatalogProductRegion,
  type BayAreaVisibleProductRegionId,
} from "@whereskarl/domain";

export {
  BAY_AREA_BACKEND_REGION_IDS,
  BAY_AREA_VISIBLE_PRODUCT_REGION_IDS,
  isBayAreaBackendRegionId,
  isBayAreaProductRegionId,
  normalizeVisibleMapRegionId,
  type BayAreaBackendRegionId,
  type BayAreaProductRegionId,
  type BayAreaVisibleProductRegionId,
  type MapBounds,
} from "@whereskarl/domain";

export const BAY_AREA_MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** Matches iOS `KarlMapServiceArea.boundingRegion` — wide enough for all four product regions. */
export const BAY_AREA_DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-123.37, 36.745],
  [-121.17, 38.495],
];

export const BAY_AREA_CENTER: [number, number] = [-122.27, 37.62];

export const BAY_AREA_LOCATION_ZOOM = 11.4;

const immersiveViewportPadding = {
  top: 88,
  right: 28,
  bottom: 148,
  left: 28,
};

const immersivePhonePortraitViewportPadding = {
  top: 52,
  right: 28,
  bottom: 148,
  left: 78,
};

export const BAY_AREA_DEFAULT_VIEWPORT_PADDING = 36;

export const BAY_AREA_IMMERSIVE_VIEWPORT_PADDING = immersiveViewportPadding;

export const BAY_AREA_IMMERSIVE_PHONE_PORTRAIT_VIEWPORT_PADDING =
  immersivePhonePortraitViewportPadding;

export type ImmersiveOverlayProfile = "tablet" | "phone-portrait";

export const BAY_AREA_DEFAULT_MAX_ZOOM = 10.2;

/** Immersive mobile framing — wider default view and room to zoom out to the full Bay Area. */
export const BAY_AREA_IMMERSIVE_MIN_ZOOM = 6.0;
export const BAY_AREA_IMMERSIVE_MAX_ZOOM = 8.6;

/**
 * Shared MapLibre pan limits for the supported Bay Area product geography.
 * Sized to contain every canonical region-chip footprint (including North Bay
 * through Healdsburg / Calistoga) and to leave enough headroom that the
 * phone-portrait all-Bay `fitBounds` (with breathing-room padding) is not
 * center-clamped into a distorted frame. West / east already clear Peninsula,
 * South Bay, East Bay, and SF anchors; north clears Healdsburg / Calistoga;
 * south is open enough for the padded all-Bay zoom-out without clamping.
 */
export const BAY_AREA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-123.55, 36.1],
  [-121.0, 39.05],
];

export type ViewportPadding =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export type BayAreaProductRegionViewport = {
  padding?: ViewportPadding;
  desktopPadding?: ViewportPadding;
  immersivePadding?: ViewportPadding;
  maxZoom?: number;
};

/** Map-framed product region: domain catalog + app-owned camera viewport. */
export type BayAreaProductRegion = CatalogProductRegion & {
  viewport?: BayAreaProductRegionViewport;
};

const REGION_VIEWPORTS: Record<
  BayAreaVisibleProductRegionId,
  BayAreaProductRegionViewport
> = {
  "san-francisco": {
    padding: 36,
    immersivePadding: immersiveViewportPadding,
    desktopPadding: {
      top: 80,
      right: 80,
      bottom: 128,
      left: 360,
    },
    maxZoom: 10.6,
  },
  "north-bay": {
    padding: 36,
    immersivePadding: immersiveViewportPadding,
    desktopPadding: {
      top: 80,
      right: 80,
      bottom: 128,
      left: 360,
    },
    maxZoom: 11.3,
  },
  "east-bay": {
    padding: 36,
    immersivePadding: immersiveViewportPadding,
    desktopPadding: {
      top: 80,
      right: 80,
      bottom: 128,
      left: 360,
    },
    maxZoom: 10.5,
  },
  "south-bay": {
    padding: 36,
    immersivePadding: immersiveViewportPadding,
    desktopPadding: {
      top: 80,
      right: 80,
      bottom: 128,
      left: 280,
    },
    maxZoom: 11,
  },
  peninsula: {
    padding: 36,
    immersivePadding: immersiveViewportPadding,
    desktopPadding: {
      top: 80,
      right: 80,
      bottom: 128,
      left: 360,
    },
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
