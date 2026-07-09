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
 * Fixed approved camera: Marin-centered with the full SF-tab composition visible
 * (Stinson Beach, Marin towns, Richmond/Berkeley, and San Francisco).
 */
export const PHONE_PORTRAIT_MAP_CENTER = {
  latitude: 37.888,
  longitude: -122.462,
} as const;

/** Wider SF-tab framing so Marin through Berkeley/Stinson stay in view at 390px. */
export const PHONE_PORTRAIT_MAP_INITIAL_ZOOM = 8.65;

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
