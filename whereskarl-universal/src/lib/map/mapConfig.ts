/**
 * Bay Area map framing — aligned with whereskarl-web/lib/map/config.ts.
 */

export const BAY_AREA_MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

/** Matches iOS KarlMapServiceArea.boundingRegion. */
export const BAY_AREA_DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-123.37, 36.745],
  [-121.17, 38.495],
];

export const BAY_AREA_CENTER = {
  latitude: 37.62,
  longitude: -122.27,
} as const;

export const BAY_AREA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-123.55, 36.55],
  [-121.0, 38.65],
];

export const BAY_AREA_DEFAULT_ZOOM = 8;
export const BAY_AREA_LOCATION_ZOOM = 11.4;
