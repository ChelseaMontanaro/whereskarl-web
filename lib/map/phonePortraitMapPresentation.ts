import type { MapBounds, ViewportPadding } from "@/lib/map/config";

export type LocationWithCoordinates = {
  id: string;
  latitude: number;
  longitude: number;
};

/**
 * Phone-portrait web map presentation — aligned with the approved mobile reference.
 * Camera, marker sizing, and UI scale tokens live here so map chrome stays consistent.
 */

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
 * Peninsula tab: the full monitored Peninsula corridor after Phase 16.2A /
 * 16.2D-1 — Daly City, Pacifica, and Half Moon Bay on the coast plus San Mateo,
 * Redwood City, and Palo Alto on the bay side. Earlier coastal-only bounds
 * clipped the three bay-side pins until the user zoomed out.
 *
 * Bounds are intentionally a bit looser than the raw pin AABB so phone-portrait
 * fitBounds (with fog-rail + bottom-tray padding) still keeps every pin above
 * chrome instead of pinching the southern trio against the tray.
 */
export const PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS: MapBounds = [
  [-122.55, 37.28],
  [-121.95, 37.74],
];

/**
 * Padding tuned for Peninsula fitBounds above the bottom tray and beside the
 * fog rail. Coastal pins sit west and bay-side pins sit east, so left padding
 * clears the fog rail while right padding keeps Palo Alto / Redwood City inside
 * the frame. Bottom padding is kept moderate so southern pins are not pushed
 * under the tray on 390×844.
 */
export const PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING: ViewportPadding = {
  top: 112,
  right: 36,
  bottom: 148,
  left: 88,
};

/** Deselected / all-Bay default: wider full Bay Area view. */
export const PHONE_PORTRAIT_ALL_BAY_CAMERA: PhonePortraitCameraPreset = {
  latitude: 37.58,
  longitude: -122.27,
  zoom: 8,
};

/**
 * Deselected / no-region fallback camera. Every visible product region is
 * framed by {@link fitPhonePortraitRegionViewport} via canonical fitBounds
 * (SF / North Bay / East Bay / South Bay / Peninsula), so this helper only
 * supplies the all-Bay camera when no region is active.
 */
export function getPhonePortraitCameraPreset(): PhonePortraitCameraPreset {
  return PHONE_PORTRAIT_ALL_BAY_CAMERA;
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
 * Exception-only pixel offsets for the phone-portrait label/score (`__meta`)
 * group, relative to a coordinate-anchored weather icon.
 *
 * Ordinary full markers must use `[0, 0]`. Attachment (icon → name → score) is
 * owned by CSS: `__meta` is centered under the icon with `margin-top` for the
 * icon-to-name gap and an internal flex gap for name-to-score. These values are
 * NOT fed into MapLibre's marker-level offset (that would move the icon).
 *
 * Keep an entry here only when a measurable geographic or viewport-edge defect
 * remains after the CSS baseline, and decluttering cannot correctly handle it.
 * Do not use this table to re-attach stacks, compensate for long names, force
 * more labels into a dense composition, or invent a universal non-zero Y.
 *
 * Positive x shifts the label group right, positive y shifts it down.
 */
export const PHONE_PORTRAIT_MARKER_LABEL_OFFSETS: Record<
  string,
  [number, number]
> = {
  // Empty by design: CSS owns ordinary attachment. Add proven exceptions only.
};

/** Per-location label/score declutter offset (relative to the anchored icon). */
export function getPhonePortraitMarkerLabelOffset(
  locationId: string,
): [number, number] {
  return PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[locationId] ?? [0, 0];
}

/**
 * Zoom breakpoints for scaling genuine exception offsets only.
 *
 * Ordinary markers stay at `[0, 0]` at every zoom (CSS owns attachment). When a
 * rare geographic/viewport exception is present in
 * {@link PHONE_PORTRAIT_MARKER_LABEL_OFFSETS}, a fixed pixel offset represents a
 * growing geographic distance as the map zooms out, so the exception is scaled
 * toward the icon as zoom decreases. Scaling never touches the icon — only the
 * label/score group — and never invents a non-zero baseline for ordinary markers.
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

/**
 * Product-defined marker priority ranking for the phone-portrait map.
 *
 * Semantic purpose: this is the *editorial / product* ordering used as ONE tier
 * of the canonical priority model (see {@link getPhonePortraitMarkerPriority} and
 * `comparePhonePortraitDeclutterOrder` in `phonePortraitMarkers.ts`). It ranks a
 * curated set of well-known locations so that, all else equal, they claim scarce
 * label space before generic score-ranked markers.
 *
 * It is deliberately NOT a region-anchor table: region-anchor selection is
 * computed independently from the canonical product-region resolver at declutter
 * time (`selectPhonePortraitRegionAnchorIds`). Region-anchor priority therefore
 * sits *above* this list in the priority model and is never duplicated inside it.
 * A location may appear here and also be chosen as its region's anchor; the two
 * concerns compose rather than conflict.
 */
export const PHONE_PORTRAIT_PRIORITY_LOCATION_IDS = [
  "san-francisco",
  "berkeley",
  "tiburon",
  "sausalito",
  "mill-valley",
  "stinson-beach",
] as const;

export function getPhonePortraitMarkerPriority(locationId: string): number {
  const index = PHONE_PORTRAIT_PRIORITY_LOCATION_IDS.indexOf(
    locationId as (typeof PHONE_PORTRAIT_PRIORITY_LOCATION_IDS)[number],
  );
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/**
 * Label/score collision box (half-extents in px). A marker's label/score group
 * is suppressed (icon-only) when its rendered center falls inside another
 * already-placed label box. This is the primary, common declutter signal.
 */
export const PHONE_PORTRAIT_MARKER_COLLISION_X = 56;
export const PHONE_PORTRAIT_MARKER_COLLISION_Y = 76;

/**
 * Weather-icon collision box (half-extents in px). Icons are
 * {@link PHONE_PORTRAIT_MARKER_ICON_PX} (36px); two icons whose centers fall
 * within this box overlap by roughly a third or more, which is unreadable. This
 * is the ONLY signal that may fully hide a marker (the canonical icon-collision
 * fallback) and is intentionally much tighter than the label box so full hiding
 * stays rarer than icon-only presentation. Label collision alone never hides the
 * icon. Selected markers are exempt.
 */
export const PHONE_PORTRAIT_ICON_COLLISION_X = 24;
export const PHONE_PORTRAIT_ICON_COLLISION_Y = 24;

/**
 * The dense San-Francisco-and-coastal cluster (Ocean Beach, Golden Gate Park,
 * Presidio, Daly City, Pacifica, Marin Headlands, Half Moon Bay) sits so close
 * together that at the wide all-Bay zoom their *labels* overlap into an
 * unreadable knot.
 *
 * Canonical policy (Phase X): membership here means "not eligible for a label in
 * the wide all-Bay composition" — i.e. the marker resolves to the `icon-only`
 * visibility state so its weather icon keeps geographic presence while its
 * label/score are suppressed. It is NOT a whole-marker hide table: only the
 * canonical icon-collision fallback may fully hide a marker, and a member that
 * is chosen as its product region's representative anchor is promoted back to a
 * label (so e.g. the Peninsula still gets one readable anchor). This set is
 * applied *only in the all-Bay composition* (no active region) — see
 * {@link declutterPhonePortraitMarkers}. Inside a specific region camera the
 * region's own members always remain eligible and collision alone declutters
 * them, so a region view never hides its own locations.
 */
export const PHONE_PORTRAIT_LOW_ZOOM_ICON_ONLY_LOCATION_IDS = new Set([
  "daly-city",
  "pacifica",
  "presidio",
  "golden-gate-park",
  "ocean-beach",
  "marin-headlands",
  "half-moon-bay",
]);

export const PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD = 9.9;
