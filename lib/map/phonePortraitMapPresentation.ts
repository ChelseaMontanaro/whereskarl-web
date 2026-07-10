import type { MapBounds, ViewportPadding } from "@/lib/map/config";
import { isLocationWithinProductRegionBounds } from "@/lib/map/regions";

export type LocationWithCoordinates = {
  id: string;
  latitude: number;
  longitude: number;
};

/**
 * Phone-portrait web map presentation — aligned with the approved mobile reference.
 * Camera, marker sizing, and UI scale tokens live here so map chrome stays consistent.
 */

/** Approved SF-tab composition bounds (Marin + central Bay). */
export const PHONE_PORTRAIT_SF_CENTRAL_BAY_BOUNDS: MapBounds = [
  [-122.6444, 37.765],
  [-122.267, 38.115],
];

/**
 * SF-tab camera bounds: southern Marin (Tiburon/Sausalito) through the SF
 * peninsula and Daly City to San Bruno/Millbrae — matching the approved
 * 390x844 SF region screenshot.
 */
export const PHONE_PORTRAIT_SF_REGION_BOUNDS: MapBounds = [
  [-122.515, 37.595],
  [-122.405, 37.875],
];

/**
 * Peninsula-centered camera for the SF tab screenshot composition.
 * Offset south/west so the peninsula sits in the visible area above the
 * bottom tray and beside the left fog rail.
 */
export const PHONE_PORTRAIT_MAP_CENTER = {
  latitude: 37.705,
  longitude: -122.468,
} as const;

/** Tight peninsula span from Tiburon/Sausalito to San Bruno/Millbrae. */
export const PHONE_PORTRAIT_MAP_INITIAL_ZOOM = 9.32;

export type PhonePortraitCameraPreset = {
  latitude: number;
  longitude: number;
  zoom: number;
};

/** SF tab: SF peninsula from southern Marin to San Bruno. */
export const PHONE_PORTRAIT_SF_CAMERA: PhonePortraitCameraPreset = {
  latitude: PHONE_PORTRAIT_MAP_CENTER.latitude,
  longitude: PHONE_PORTRAIT_MAP_CENTER.longitude,
  zoom: PHONE_PORTRAIT_MAP_INITIAL_ZOOM,
};

/** North Bay tab: Marin, Novato, San Rafael, Mill Valley, Tiburon, Sausalito. */
export const PHONE_PORTRAIT_NORTH_BAY_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.97,
  longitude: -122.545,
  zoom: 9.35,
};

/** East Bay tab: Richmond, Berkeley, Oakland, Alameda. */
export const PHONE_PORTRAIT_EAST_BAY_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.83,
  longitude: -122.18,
  zoom: 9.45,
};

/** South Bay tab: San Jose, Palo Alto, Mountain View and nearby. */
export const PHONE_PORTRAIT_SOUTH_BAY_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.36,
  longitude: -122.02,
  zoom: 9.05,
};

/** Deselected / all-Bay default: wider full Bay Area view. */
export const PHONE_PORTRAIT_ALL_BAY_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.58,
  longitude: -122.27,
  zoom: 8,
};

export function getPhonePortraitCameraPreset(
  regionId: string | null | undefined,
): PhonePortraitCameraPreset {
  switch (regionId) {
    case "san-francisco":
      return PHONE_PORTRAIT_SF_CAMERA;
    case "north-bay":
      return PHONE_PORTRAIT_NORTH_BAY_CAMERA;
    case "east-bay":
      return PHONE_PORTRAIT_EAST_BAY_CAMERA;
    case "south-bay":
      return PHONE_PORTRAIT_SOUTH_BAY_CAMERA;
    default:
      return PHONE_PORTRAIT_ALL_BAY_CAMERA;
  }
}

export const PHONE_PORTRAIT_MAP_MAX_ZOOM = 10.6;

export const PHONE_PORTRAIT_MAP_VIEWPORT_PADDING: ViewportPadding = {
  top: 116,
  right: 36,
  bottom: 224,
  left: 108,
};

export const PHONE_PORTRAIT_MARKER_ICON_PX = 36;

export const PHONE_PORTRAIT_MARKER_ICON_REM = "2.25rem";

export const PHONE_PORTRAIT_MARKER_NAME_REM = "0.8125rem";

export const PHONE_PORTRAIT_MARKER_SCORE_REM = "0.75rem";

export const PHONE_PORTRAIT_MARKER_OFFSETS: Record<string, [number, number]> = {
  "mill-valley": [-14, -48],
  tiburon: [46, -30],
  sausalito: [14, 52],
  "stinson-beach": [58, 64],
  "san-francisco": [30, 10],
  "san-rafael": [-10, -8],
  novato: [0, -10],
  "san-anselmo": [12, -2],
  richmond: [16, 6],
  berkeley: [-26, 4],
  presidio: [-26, -8],
  "golden-gate-park": [-14, 34],
  "ocean-beach": [-34, 12],
  "ocean-beach-sf": [-34, 12],
  "marin-headlands": [-30, 12],
};

export function getPhonePortraitMarkerOffset(locationId: string): [number, number] {
  return PHONE_PORTRAIT_MARKER_OFFSETS[locationId] ?? [0, 0];
}

export function getPhonePortraitMarkerMapOffset(
  showLocationLabel: boolean,
): [number, number] {
  return showLocationLabel ? [0, -36] : [0, -6];
}

export const PHONE_PORTRAIT_PRIORITY_LOCATION_IDS = [
  "san-francisco",
  "berkeley",
  "tiburon",
  "sausalito",
  "mill-valley",
  "stinson-beach",
  "san-rafael",
  "novato",
  "san-anselmo",
  "richmond",
] as const;

export function getPhonePortraitMarkerPriority(locationId: string): number {
  const index = PHONE_PORTRAIT_PRIORITY_LOCATION_IDS.indexOf(
    locationId as (typeof PHONE_PORTRAIT_PRIORITY_LOCATION_IDS)[number],
  );
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export const PHONE_PORTRAIT_MARKER_COLLISION_X = 56;
export const PHONE_PORTRAIT_MARKER_COLLISION_Y = 76;

export const PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS = new Set([
  "daly-city",
  "pacifica",
  "presidio",
  "golden-gate-park",
  "ocean-beach",
  "ocean-beach-sf",
  "marin-headlands",
  "half-moon-bay",
]);

export const PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD = 9.9;

export function filterLocationsForPhonePortraitSfComposition<
  T extends LocationWithCoordinates,
>(locations: T[]): T[] {
  return locations.filter(
    (location) =>
      typeof location.latitude === "number" &&
      typeof location.longitude === "number" &&
      isLocationWithinProductRegionBounds(
        location.latitude,
        location.longitude,
        PHONE_PORTRAIT_SF_CENTRAL_BAY_BOUNDS,
      ),
  );
}
