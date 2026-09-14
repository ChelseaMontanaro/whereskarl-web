/**
 * Canonical phone-portrait camera presets.
 *
 * Ported from the approved mobile-web reference
 * (`apps/web/lib/map/phonePortraitMapPresentation.ts` +
 * `apps/web/lib/map/phonePortraitViewport.ts`). Every region owns its own
 * bounds *and* its own edge padding — there is deliberately no single shared
 * padding, because each region's pin spread trades differently against the
 * fog rail (left), the layers control (right), and the selected-location
 * sheet (bottom).
 *
 * `null` resolves to the all-Bay default used on clean Map entry.
 */

import type { MapBounds } from '@whereskarl/domain';

import type { BayAreaVisibleProductRegionId } from '@/lib/map/regions';

export type PhonePortraitCameraPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PhonePortraitCameraPreset = {
  bounds: MapBounds;
  padding: PhonePortraitCameraPadding;
};

/** Most-zoomed-in ceiling for every phone-portrait region fit. */
export const PHONE_PORTRAIT_CAMERA_MAX_ZOOM = 10.6;

/**
 * Deselected / clean-entry default: the minimum bounding box of the canonical
 * catalog. Left padding is intentionally larger than right so catalog extremes
 * clear the Fog Intensity rail rather than the raw screen edge.
 */
export const PHONE_PORTRAIT_ALL_BAY_CAMERA: PhonePortraitCameraPreset = {
  bounds: [
    [-122.72, 37.22],
    [-121.76, 38.45],
  ],
  padding: { top: 136, right: 88, bottom: 284, left: 120 },
};

const REGION_CAMERA_PRESETS: Record<
  BayAreaVisibleProductRegionId,
  PhonePortraitCameraPreset
> = {
  'san-francisco': {
    bounds: [
      [-122.53, 37.703],
      [-122.355, 37.875],
    ],
    padding: { top: 128, right: 28, bottom: 210, left: 100 },
  },
  'north-bay': {
    bounds: [
      [-123.05, 37.78],
      [-122.26, 38.63],
    ],
    padding: { top: 100, right: 24, bottom: 188, left: 52 },
  },
  'east-bay': {
    bounds: [
      [-122.41, 37.45],
      [-121.62, 38.09],
    ],
    padding: { top: 96, right: 36, bottom: 176, left: 72 },
  },
  'south-bay': {
    bounds: [
      [-122.25, 37.1],
      [-121.63, 37.47],
    ],
    padding: { top: 112, right: 32, bottom: 184, left: 80 },
  },
  peninsula: {
    bounds: [
      [-122.55, 37.09],
      [-122.09, 37.71],
    ],
    padding: { top: 112, right: 36, bottom: 200, left: 84 },
  },
};

/**
 * Canonical camera for a region chip, or the all-Bay default when no region is
 * active. Mirrors web's `fitPhonePortraitRegionViewport` region switch.
 */
export function resolvePhonePortraitCameraPreset(
  regionId: BayAreaVisibleProductRegionId | null | undefined,
): PhonePortraitCameraPreset {
  if (!regionId) {
    return PHONE_PORTRAIT_ALL_BAY_CAMERA;
  }

  return REGION_CAMERA_PRESETS[regionId] ?? PHONE_PORTRAIT_ALL_BAY_CAMERA;
}

/** Region ids that own a canonical phone-portrait camera preset. */
export function phonePortraitCameraRegionIds(): BayAreaVisibleProductRegionId[] {
  return Object.keys(REGION_CAMERA_PRESETS) as BayAreaVisibleProductRegionId[];
}

/**
 * Fog-level filter camera, ported from the approved web reference
 * (`resolveIntensityFilterFitOptions`, immersive phone-portrait profile).
 *
 * Selecting a fog level on phone web frames the locations that qualify — that
 * fit, not marker dimming, is how the approved design answers "which locations
 * match?" (`phone-portrait-map.web.css` explicitly keeps every phone marker at
 * full opacity).
 */
export const PHONE_PORTRAIT_INTENSITY_FILTER_PADDING: PhonePortraitCameraPadding =
  { top: 72, right: 44, bottom: 208, left: 78 };

/** Closest the filter fit may zoom, matching web's `maxZoom` for this fit. */
export const PHONE_PORTRAIT_INTENSITY_FILTER_MAX_ZOOM = 10;

type IntensityFilterCandidate = {
  latitude: number;
  longitude: number;
};

/** Viewport needed to convert the max-zoom ceiling into a minimum span. */
export type IntensityFilterViewport = {
  width: number;
  height: number;
};

/**
 * Longitude span that renders at exactly `zoom` across `contentWidth` points.
 * Inverse of `estimatePhonePortraitZoom`, which is how the rest of the native
 * map converts between spans and MapLibre-equivalent zoom.
 */
function longitudeSpanForZoom(contentWidth: number, zoom: number): number {
  return (contentWidth * 360) / (512 * 2 ** zoom);
}

/**
 * Minimum bounding box of the locations matching the active fog level, or
 * `null` when nothing qualifies (web then falls through to its default fit).
 *
 * When one location matches — common for Karl Territory — the raw box is a
 * single point. `fitToCoordinates` has no `maxZoom`, so the box is widened to
 * the span that corresponds to web's zoom-10 ceiling, measured against the
 * padded content width. Without that, a lone match would slam the camera to
 * maximum zoom instead of web's capped frame.
 */
export function resolvePhonePortraitIntensityFilterCamera(
  matchingLocations: readonly IntensityFilterCandidate[],
  viewport?: IntensityFilterViewport | null,
): PhonePortraitCameraPreset | null {
  if (matchingLocations.length === 0) {
    return null;
  }

  const padding = PHONE_PORTRAIT_INTENSITY_FILTER_PADDING;
  let west = matchingLocations[0].longitude;
  let south = matchingLocations[0].latitude;
  let east = west;
  let north = south;

  for (const location of matchingLocations.slice(1)) {
    west = Math.min(west, location.longitude);
    south = Math.min(south, location.latitude);
    east = Math.max(east, location.longitude);
    north = Math.max(north, location.latitude);
  }

  if (viewport && viewport.width > 0) {
    const contentWidth = Math.max(
      1,
      viewport.width - padding.left - padding.right,
    );
    const minSpan = longitudeSpanForZoom(
      contentWidth,
      PHONE_PORTRAIT_INTENSITY_FILTER_MAX_ZOOM,
    );
    const span = east - west;

    if (span < minSpan) {
      const centre = (west + east) / 2;
      west = centre - minSpan / 2;
      east = centre + minSpan / 2;
    }
  }

  return {
    bounds: [
      [west, south],
      [east, north],
    ],
    padding,
  };
}
