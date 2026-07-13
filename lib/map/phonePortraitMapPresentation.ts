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
 * SF-tab camera bounds: the San Francisco landmass (Ocean Beach through the
 * downtown waterfront) with only a thin band of southern Marin (Sausalito /
 * Tiburon) as top context. The southern edge stops at the SF / Daly City
 * border so the frame stays on the city instead of drifting south into the
 * Peninsula or centering on open water.
 */
export const PHONE_PORTRAIT_SF_REGION_BOUNDS: MapBounds = [
  [-122.525, 37.715],
  [-122.375, 37.875],
];

/** Padding tuned for SF fitBounds above the bottom tray and beside the fog rail. */
export const PHONE_PORTRAIT_SF_VIEWPORT_PADDING: ViewportPadding = {
  top: 128,
  right: 28,
  bottom: 210,
  left: 100,
};

/**
 * Peninsula-centered fallback used before fitBounds resolves on first paint.
 */
export const PHONE_PORTRAIT_MAP_CENTER = {
  latitude: 37.718,
  longitude: -122.445,
} as const;

/** Tight peninsula span with Marin as a thin top edge only. */
export const PHONE_PORTRAIT_MAP_INITIAL_ZOOM = 9.42;

export type PhonePortraitCameraPreset = {
  latitude: number;
  longitude: number;
  zoom: number;
};

/** North Bay tab: Marin peninsula from Novato to the Gate — approved screenshot. */
export const PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS: MapBounds = [
  [-122.658, 37.808],
  [-122.453, 38.04],
];

/** Padding tuned for North Bay fitBounds above the bottom tray and beside the fog rail. */
export const PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 135,
  right: 22,
  bottom: 228,
  left: 100,
};

/**
 * East Bay tab: the Berkeley → Oakland shoreline corridor. Kept tight around
 * the monitored East Bay locations so fitBounds centers on the shoreline
 * instead of pulling the camera far inland (Livermore/Tri-Valley) and jamming
 * Berkeley/Oakland against the west edge.
 */
export const PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS: MapBounds = [
  [-122.34, 37.75],
  [-122.17, 37.91],
];

/** Padding tuned for East Bay fitBounds above the bottom tray and beside the fog rail. */
export const PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 128,
  right: 30,
  bottom: 232,
  left: 92,
};

/**
 * South Bay tab: the Silicon Valley corridor from Palo Alto through Mountain
 * View to San Jose. Bounds are tightened around the monitored South Bay
 * locations so the camera zooms into the valley instead of leaving the upper
 * viewport filled with central Bay water.
 */
export const PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS: MapBounds = [
  [-122.18, 37.3],
  [-121.85, 37.47],
];

/** Padding tuned for South Bay fitBounds above the bottom tray and beside the fog rail. */
export const PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 132,
  right: 24,
  bottom: 200,
  left: 92,
};

/**
 * Peninsula tab: land corridor only — SSF through Mountain View on the 101
 * strip. East edge stops at the hills/101 corridor so fitBounds does not
 * mathematically center open Bay water or Foster City.
 */
export const PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS: MapBounds = [
  [-122.502, 37.375],
  [-122.198, 37.668],
];

/**
 * Padding tuned for Peninsula fitBounds above the bottom tray and beside the
 * fog rail. Heavy right padding intentionally biases the visible center west
 * onto peninsula land instead of the Bay / East Bay.
 */
export const PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING: ViewportPadding = {
  top: 112,
  right: 176,
  bottom: 215,
  left: 76,
};

/** Peninsula tab: Burlingame / San Mateo land centered; bay cropped east. */
export const PHONE_PORTRAIT_PENINSULA_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.528,
  longitude: -122.402,
  zoom: 10.18,
};

/** Deselected / all-Bay default: wider full Bay Area view. */
export const PHONE_PORTRAIT_ALL_BAY_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.58,
  longitude: -122.27,
  zoom: 8,
};

/**
 * Deselected / no-region fallback camera. Every visible product region is
 * framed by {@link fitPhonePortraitRegionViewport} (bounds for SF / North Bay /
 * East Bay / South Bay, the dedicated Peninsula preset for Peninsula), so this
 * helper only supplies the all-Bay camera when no region is active.
 */
export function getPhonePortraitCameraPreset(
  regionId: string | null | undefined,
): PhonePortraitCameraPreset {
  switch (regionId) {
    case "peninsula":
      return PHONE_PORTRAIT_PENINSULA_CAMERA;
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

/**
 * Canonical per-location declutter data for the phone-portrait map.
 *
 * Semantics: pixel offset applied to the marker's label/score group **relative
 * to a coordinate-anchored weather icon**. The weather icon always stays on the
 * true projected coordinate; only the label/score group shifts by these values
 * to avoid overlap. These values are NOT fed into MapLibre's marker-level
 * offset (doing so would move the icon off the coordinate).
 *
 * Positive x shifts the label group right, positive y shifts it down.
 */
export const PHONE_PORTRAIT_MARKER_LABEL_OFFSETS: Record<
  string,
  [number, number]
> = {
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

/** Per-location label/score declutter offset (relative to the anchored icon). */
export function getPhonePortraitMarkerLabelOffset(
  locationId: string,
): [number, number] {
  return PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[locationId] ?? [0, 0];
}

/**
 * Zoom breakpoints for scaling the canonical label/score offsets.
 *
 * The offsets in {@link PHONE_PORTRAIT_MARKER_LABEL_OFFSETS} are tuned at the
 * SF-composition reference zoom. A fixed pixel offset represents a growing
 * geographic distance as the map zooms out, so at lower zoom the label/score
 * group drifts away from its coordinate-anchored icon (into open water, etc.).
 * We keep the single canonical offset table and scale it toward the icon as
 * zoom decreases. Scaling never touches the icon — only the label/score group.
 *
 * Curve (linear between breakpoints, then clamped):
 *   zoom >= FULL_SCALE_ZOOM (10.3)  -> 1.0  (100% of configured offset)
 *   zoom == 9.3                      -> 0.6  (~60%)
 *   zoom <= MIN_SCALE_ZOOM  (8.3)    -> MIN_SCALE (0.2, ~20%)
 */
export const PHONE_PORTRAIT_LABEL_OFFSET_FULL_SCALE_ZOOM = 10.3;
export const PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM = 8.3;
export const PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE = 0.2;

/**
 * Canonical, deterministic, monotonic scale factor for the label/score offset
 * at a given map zoom. Always clamped to [0, 1] (and never below the configured
 * minimum floor). Shared by every location so scaling stays uniform.
 */
export function getPhonePortraitLabelOffsetScale(zoom: number): number {
  if (!Number.isFinite(zoom)) {
    return 1;
  }
  if (zoom >= PHONE_PORTRAIT_LABEL_OFFSET_FULL_SCALE_ZOOM) {
    return 1;
  }
  if (zoom <= PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM) {
    return PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE;
  }

  const span =
    PHONE_PORTRAIT_LABEL_OFFSET_FULL_SCALE_ZOOM -
    PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM;
  const progress =
    (zoom - PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM) / span;
  const scale =
    PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE +
    progress * (1 - PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE);

  return Math.min(1, Math.max(0, scale));
}

/**
 * Zoom-aware rendered label/score offset: the canonical per-location offset
 * scaled by {@link getPhonePortraitLabelOffsetScale}. This is the single source
 * of truth for both rendering (the __meta transform) and collision math so they
 * can never diverge.
 */
export function resolvePhonePortraitMarkerLabelOffset(
  locationId: string,
  zoom: number,
): [number, number] {
  const [x, y] = getPhonePortraitMarkerLabelOffset(locationId);
  const scale = getPhonePortraitLabelOffsetScale(zoom);
  return [x * scale, y * scale];
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
