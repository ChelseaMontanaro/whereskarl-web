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

export type BayAreaProductRegion = {
  id: "san-francisco" | "north-bay" | "east-bay" | "south-bay";
  name: string;
  bounds: MapBounds;
};

export const BAY_AREA_PRODUCT_REGIONS: BayAreaProductRegion[] = [
  {
    id: "san-francisco",
    name: "San Francisco",
    bounds: [
      [-122.52, 37.7],
      [-122.35, 37.84],
    ],
  },
  {
    id: "north-bay",
    name: "North Bay",
    bounds: [
      [-122.68, 37.78],
      [-122.38, 38.12],
    ],
  },
  {
    id: "east-bay",
    name: "East Bay",
    bounds: [
      [-122.35, 37.72],
      [-121.82, 38.0],
    ],
  },
  {
    id: "south-bay",
    name: "South Bay",
    bounds: [
      [-122.5, 37.08],
      [-121.7, 37.58],
    ],
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
): regionId is BayAreaProductRegion["id"] {
  return BAY_AREA_PRODUCT_REGIONS.some((region) => region.id === regionId);
}
