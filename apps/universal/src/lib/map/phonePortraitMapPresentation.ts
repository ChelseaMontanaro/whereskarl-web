import type { MapViewportPadding } from '@/lib/map/mapConfig';
import {
  isLocationWithinProductRegionBounds,
  type LocationWithCoordinates,
  type MapBounds,
} from '@/lib/map/regions';

/**
 * Phone-portrait web map presentation — aligned with the approved mobile reference.
 * Camera, marker sizing, and UI scale tokens live here so map chrome stays consistent.
 */

/**
 * Approved SF-tab composition bounds — used to scope which monitored
 * locations belong to the phone-portrait SF composition (Marin + central
 * Bay). The camera itself is the fixed center/zoom below.
 */
export const PHONE_PORTRAIT_SF_CENTRAL_BAY_BOUNDS: MapBounds = [
  [-122.6444, 37.765],
  [-122.267, 38.115],
];

/**
 * Fixed approved camera: Marin/Mill Valley/Tiburon/Sausalito centered,
 * San Rafael and Novato upper-left, Richmond/Berkeley right, Stinson Beach
 * lower-left, San Francisco lower-right — matching the approved 390x844
 * screenshot composition.
 */
export const PHONE_PORTRAIT_MAP_CENTER = {
  latitude: 37.89,
  longitude: -122.475,
} as const;

/** Tight enough to crop Napa/Sonoma and most of the East Bay. */
export const PHONE_PORTRAIT_MAP_INITIAL_ZOOM = 9.2;

export const PHONE_PORTRAIT_MAP_MAX_ZOOM = 10.6;

/** Room for scaled header chips, fog rail, tray, selected card, and bottom nav. */
export const PHONE_PORTRAIT_MAP_VIEWPORT_PADDING: MapViewportPadding = {
  top: 116,
  right: 36,
  bottom: 224,
  left: 108,
};

export const PHONE_PORTRAIT_MARKER_ICON_PX = 36;

export const PHONE_PORTRAIT_MARKER_ICON_REM = '2.25rem';

export const PHONE_PORTRAIT_MARKER_NAME_REM = '0.8125rem';

export const PHONE_PORTRAIT_MARKER_SCORE_REM = '0.75rem';

/**
 * Curated per-location pixel offsets for the approved fixed camera so the
 * Marin cluster reads like the approved screenshot with no label collisions.
 */
export const PHONE_PORTRAIT_MARKER_OFFSETS: Record<string, [number, number]> = {
  'mill-valley': [-14, -48],
  tiburon: [46, -30],
  sausalito: [14, 52],
  'stinson-beach': [58, 64],
  'san-francisco': [30, 10],
  'san-rafael': [-10, -8],
  novato: [0, -10],
  'san-anselmo': [12, -2],
  // Reserved future: richmond-district (SF) / richmond-ca (East Bay).
  // Do not use bare `richmond` — it is ambiguous and not a catalog id.
  berkeley: [-26, 4],
  presidio: [-26, -8],
  'golden-gate-park': [-14, 34],
  'ocean-beach': [-34, 12],
  'marin-headlands': [-30, 12],
};

export function getPhonePortraitMarkerOffset(locationId: string): [number, number] {
  return PHONE_PORTRAIT_MARKER_OFFSETS[locationId] ?? [0, 0];
}

export function getPhonePortraitMarkerMapOffset(
  showLocationLabel: boolean,
): [number, number] {
  return showLocationLabel ? [0, -36] : [0, -6];
}

/**
 * Marker priority for the phone-portrait declutter pass. The approved SF
 * composition locations always win; everything else competes by clear-sky
 * score. Lower index = higher priority.
 */
export const PHONE_PORTRAIT_PRIORITY_LOCATION_IDS = [
  'san-francisco',
  'berkeley',
  'tiburon',
  'sausalito',
  'mill-valley',
  'stinson-beach',
  'san-rafael',
  'novato',
  'san-anselmo',
  // Bare `richmond` intentionally omitted — reserve richmond-district / richmond-ca.
] as const;

export function getPhonePortraitMarkerPriority(locationId: string): number {
  const index = PHONE_PORTRAIT_PRIORITY_LOCATION_IDS.indexOf(
    locationId as (typeof PHONE_PORTRAIT_PRIORITY_LOCATION_IDS)[number],
  );
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** Approximate rendered marker footprint used for collision checks. */
export const PHONE_PORTRAIT_MARKER_COLLISION_X = 56;
export const PHONE_PORTRAIT_MARKER_COLLISION_Y = 76;

/**
 * Locations excluded from the approved wide composition (the mockup shows
 * only the ten curated Marin/central-Bay spots). They stay hidden while the
 * camera is at the composition zoom and reappear once the user zooms in past
 * this threshold.
 */
export const PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS = new Set([
  'daly-city',
  'pacifica',
  'presidio',
  'golden-gate-park',
  'ocean-beach',
  'marin-headlands',
  'half-moon-bay',
]);

export const PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD = 9.9;

/**
 * Approved SF-tab composition on phone-portrait web spans Marin + the central
 * Bay, so the SF region presents every monitored location inside the approved
 * bounds (Mill Valley, Tiburon, Sausalito, Stinson Beach, Berkeley, SF, …)
 * rather than only backend `san-francisco` locations.
 */
export function filterLocationsForPhonePortraitSfComposition<
  T extends LocationWithCoordinates,
>(locations: T[]): T[] {
  return locations.filter(
    (location) =>
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      isLocationWithinProductRegionBounds(
        location.latitude,
        location.longitude,
        PHONE_PORTRAIT_SF_CENTRAL_BAY_BOUNDS,
      ),
  );
}
