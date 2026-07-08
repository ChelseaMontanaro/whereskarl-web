/**
 * Bay Area map framing — aligned with whereskarl-web/lib/map/config.ts.
 */

export const BAY_AREA_MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

/** Wide Bay Area bounds — desktop default framing. */
export const BAY_AREA_DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-123.37, 36.745],
  [-121.17, 38.495],
];

/**
 * Tighter mobile framing — SF, Marin, East Bay, and Peninsula core.
 */
export const BAY_AREA_MOBILE_BOUNDS: [[number, number], [number, number]] = [
  [-122.58, 37.2],
  [-121.98, 37.9],
];

export const BAY_AREA_CENTER = {
  latitude: 37.62,
  longitude: -122.27,
} as const;

export const BAY_AREA_MOBILE_CENTER = {
  latitude: 37.56,
  longitude: -122.28,
} as const;

export const BAY_AREA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-123.55, 36.55],
  [-121.0, 38.65],
];

export const BAY_AREA_DEFAULT_ZOOM = 8;
export const BAY_AREA_MOBILE_DEFAULT_ZOOM = 10.2;
export const BAY_AREA_DESKTOP_DEFAULT_MAX_ZOOM = 10.2;
export const BAY_AREA_MOBILE_DEFAULT_MAX_ZOOM = 10.8;
export const BAY_AREA_LOCATION_ZOOM = 11.4;

export type MapViewportPadding =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export const BAY_AREA_MOBILE_VIEWPORT_PADDING: MapViewportPadding = {
  top: 168,
  right: 24,
  bottom: 132,
  left: 24,
};

export const BAY_AREA_DESKTOP_VIEWPORT_PADDING: MapViewportPadding = 36;

export type KarlMapLayoutMode = 'mobile' | 'desktop';

export function getMapBoundsForLayout(
  layout: KarlMapLayoutMode,
): [[number, number], [number, number]] {
  return layout === 'mobile' ? BAY_AREA_MOBILE_BOUNDS : BAY_AREA_DEFAULT_BOUNDS;
}

export function getMapViewportPaddingForLayout(
  layout: KarlMapLayoutMode,
): MapViewportPadding {
  return layout === 'mobile'
    ? BAY_AREA_MOBILE_VIEWPORT_PADDING
    : BAY_AREA_DESKTOP_VIEWPORT_PADDING;
}

export function getMapDefaultMaxZoomForLayout(
  layout: KarlMapLayoutMode,
): number {
  return layout === 'mobile'
    ? BAY_AREA_MOBILE_DEFAULT_MAX_ZOOM
    : BAY_AREA_DESKTOP_DEFAULT_MAX_ZOOM;
}

export function normalizeViewportPadding(
  padding: MapViewportPadding | undefined,
  fallback = 36,
): number | { top: number; bottom: number; left: number; right: number } {
  if (padding === undefined) {
    return fallback;
  }

  if (typeof padding === 'number') {
    return padding;
  }

  return {
    top: padding.top ?? fallback,
    right: padding.right ?? fallback,
    bottom: padding.bottom ?? fallback,
    left: padding.left ?? fallback,
  };
}

export function boundsToRegion(
  bounds: [[number, number], [number, number]],
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  const [[west, south], [east, north]] = bounds;

  return {
    latitude: (north + south) / 2,
    longitude: (east + west) / 2,
    latitudeDelta: north - south,
    longitudeDelta: east - west,
  };
}
