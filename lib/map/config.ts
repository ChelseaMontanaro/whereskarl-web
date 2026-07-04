export const BAY_AREA_MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** Matches iOS `KarlMapServiceArea.boundingRegion` — wide enough for all four product regions. */
export const BAY_AREA_DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-123.37, 36.745],
  [-121.17, 38.495],
];

export const BAY_AREA_CENTER: [number, number] = [-122.27, 37.62];

export const BAY_AREA_LOCATION_ZOOM = 11.4;

export const BAY_AREA_DEFAULT_VIEWPORT_PADDING = 36;

export const BAY_AREA_DEFAULT_MAX_ZOOM = 10.2;

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
  maxZoom?: number;
};

export const BAY_AREA_PRODUCT_REGION_IDS = [
  "san-francisco",
  "north-bay",
  "east-bay",
  "south-bay",
  "peninsula",
] as const;

export type BayAreaProductRegionId = (typeof BAY_AREA_PRODUCT_REGION_IDS)[number];

export type BayAreaProductRegion = {
  id: BayAreaProductRegionId;
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
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 280,
      },
      maxZoom: 11,
    },
  },
  {
    id: "peninsula",
    name: "Peninsula",
    bounds: [
      [-122.55, 37.58],
      [-122.38, 37.72],
    ],
    viewport: {
      padding: 36,
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      maxZoom: 11.1,
    },
  },
];

export function findBayAreaProductRegion(
  regionId: string | null | undefined,
): BayAreaProductRegion | null {
  if (!regionId) {
    return null;
  }

  return BAY_AREA_PRODUCT_REGIONS.find((region) => region.id === regionId) ?? null;
}

export function isBayAreaProductRegionId(
  regionId: string,
): regionId is BayAreaProductRegionId {
  return BAY_AREA_PRODUCT_REGION_IDS.includes(regionId as BayAreaProductRegionId);
}
