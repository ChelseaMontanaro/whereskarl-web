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
  top: 58,
  right: 28,
  bottom: 148,
  left: 12,
};

export const BAY_AREA_DEFAULT_VIEWPORT_PADDING = 36;

export const BAY_AREA_IMMERSIVE_VIEWPORT_PADDING = immersiveViewportPadding;

export const BAY_AREA_IMMERSIVE_PHONE_PORTRAIT_VIEWPORT_PADDING =
  immersivePhonePortraitViewportPadding;

export type ImmersiveOverlayProfile = "tablet" | "phone-portrait";

export const BAY_AREA_DEFAULT_MAX_ZOOM = 10.2;

/** Immersive mobile framing — wider default view and room to zoom out to the full Bay Area. */
export const BAY_AREA_IMMERSIVE_MIN_ZOOM = 6.4;
export const BAY_AREA_IMMERSIVE_MAX_ZOOM = 8.6;

/** Slightly wider pan limits than the default framed viewport. */
export const BAY_AREA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-123.55, 36.55],
  [-121.0, 38.65],
];

export type MapBounds = [[number, number], [number, number]];

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

/** Region chips and map framing — SF, North Bay, East Bay, South Bay only. */
export const BAY_AREA_VISIBLE_PRODUCT_REGION_IDS = [
  "san-francisco",
  "north-bay",
  "east-bay",
  "south-bay",
] as const;

/** Backend `/locations` region values, including the coastal Peninsula belt. */
export const BAY_AREA_BACKEND_REGION_IDS = [
  ...BAY_AREA_VISIBLE_PRODUCT_REGION_IDS,
  "peninsula",
] as const;

export type BayAreaVisibleProductRegionId =
  (typeof BAY_AREA_VISIBLE_PRODUCT_REGION_IDS)[number];

export type BayAreaBackendRegionId = (typeof BAY_AREA_BACKEND_REGION_IDS)[number];

/** Visible product region id used by chips, routing, and UI filtering. */
export type BayAreaProductRegionId = BayAreaVisibleProductRegionId;

export type BayAreaProductRegion = {
  id: BayAreaVisibleProductRegionId;
  name: string;
  bounds: MapBounds;
  viewport?: BayAreaProductRegionViewport;
};

export const BAY_AREA_PRODUCT_REGIONS: BayAreaProductRegion[] = [
  {
    id: "san-francisco",
    name: "San Francisco",
    bounds: [
      [-122.54, 37.615],
      [-122.26, 37.84],
    ],
    viewport: {
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
  },
  {
    id: "north-bay",
    name: "North Bay",
    bounds: [
      [-122.65, 37.795],
      [-122.43, 38.02],
    ],
    viewport: {
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
  },
  {
    id: "east-bay",
    name: "East Bay",
    bounds: [
      [-122.33, 37.7],
      [-121.72, 38.02],
    ],
    viewport: {
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
  },
  {
    id: "south-bay",
    name: "South Bay",
    bounds: [
      [-122.5, 37.08],
      [-121.7, 37.58],
    ],
    viewport: {
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
  },
];

/** Maps backend-only regions into the visible coastal fog belt grouping. */
const BACKEND_TO_VISIBLE_REGION: Record<
  BayAreaBackendRegionId,
  BayAreaVisibleProductRegionId
> = {
  "san-francisco": "san-francisco",
  "north-bay": "north-bay",
  "east-bay": "east-bay",
  "south-bay": "south-bay",
  peninsula: "san-francisco",
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
