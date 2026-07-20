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
 * SF tab — canonical geographic footprint of the City and County of San
 * Francisco, independent of today's markers.
 *
 * Anchors: Lands End / Ocean Beach (west, −122.51), the San Mateo county line
 * and Candlestick Point (south, 37.708 / 37.711), Hunters Point and Treasure
 * Island (east, −122.37), and the Golden Gate (north). The previous south
 * edge (37.715) and east edge (−122.375) were fitted to current markers and
 * excluded Candlestick Point and Treasure Island; both are inside now, so any
 * future location anywhere in the city lands inside these bounds. The north
 * edge keeps a deliberate thin band of southern Marin (Sausalito) as Gate
 * context — the SF landmass itself tops out near 37.833.
 */
export const PHONE_PORTRAIT_SF_REGION_BOUNDS: MapBounds = [
  [-122.53, 37.703],
  [-122.355, 37.875],
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

/**
 * North Bay tab — canonical geographic footprint: all of Marin County
 * including the full western coast and the Point Reyes peninsula, the
 * Sonoma coast at Bodega Bay, the Russian River / Alexander Valley through
 * Healdsburg, and the Napa Valley through Calistoga and the city of Napa.
 *
 * Anchors: Bodega Bay (−123.048) and Point Reyes Lighthouse (−123.024) pin
 * the west edge; Healdsburg (38.610) the north; the city of Napa (−122.287)
 * the east; the Golden Gate / Marin Headlands (37.827) the south. Calistoga
 * sits inside the north-east quadrant of the same box. A future marker
 * anywhere on the Point Reyes peninsula, the Marin coast, Healdsburg,
 * Calistoga, or the lower/central Napa Valley lands inside these bounds
 * with no camera or pan-limit retune.
 */
export const PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS: MapBounds = [
  [-123.05, 37.78],
  [-122.26, 38.63],
];

/**
 * Padding for the footprint-wide North Bay fitBounds. Sides are slim because
 * the fitted zoom is width-bound and every horizontal pixel trades against
 * coverage; the west anchors (Bodega Bay, Point Reyes) sit below the fog
 * rail's row band, so a narrow left inset is safe. Top clears the region
 * chips for Healdsburg; bottom keeps the Gate / Marin Headlands above the
 * tray. With `BAY_AREA_MAX_BOUNDS` north at 39.05°, this fit is unclamped.
 */
export const PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 100,
  right: 24,
  bottom: 188,
  left: 52,
};

/**
 * East Bay tab — canonical geographic footprint: the full Alameda /
 * Contra Costa geography from the Richmond–San Pablo shoreline north to the
 * Carquinez Strait, east across inland Contra Costa and the Delta edge
 * (Concord, Mount Diablo, Antioch, Brentwood), through the Tri-Valley to
 * Altamont Pass, and south along the shoreline to Fremont / Mission Peak.
 *
 * Anchors: Point Richmond (−122.391) west, Carquinez Strait / Martinez
 * (38.05) north, Brentwood and Altamont Pass (−121.66) east, Mission Peak /
 * south Fremont (37.45) south. The previous east edge (−121.72) stopped at
 * the Livermore marker and the north edge (38.02) clipped the Carquinez
 * shoreline; a future marker anywhere in the supported East Bay now lands
 * inside these bounds with no retune.
 */
export const PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS: MapBounds = [
  [-122.41, 37.45],
  [-121.62, 38.09],
];

/**
 * Padding for the footprint-wide East Bay fitBounds. Left clears the fog rail
 * for the Richmond→Oakland shoreline; right/bottom keep the Altamont /
 * Mission Peak corners inside the chrome above the tray.
 */
export const PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 96,
  right: 36,
  bottom: 176,
  left: 72,
};

/**
 * South Bay tab — canonical geographic footprint: the Santa Clara Valley
 * rim-to-rim, not the current marker cluster. West rim at the Saratoga /
 * Cupertino foothills, north at the Alviso bay edge and Milpitas, east at the
 * Alum Rock foothills, and south through the Sierra Azul ridge (Mount
 * Umunhum, New Almaden) and Coyote Valley to Morgan Hill.
 *
 * Anchors: Saratoga (−122.023) west, Alviso / Milpitas (37.43) north, Morgan
 * Hill (37.131, −121.654) south-east. The previous south edge (37.18) stopped
 * immediately below the Los Gatos marker and the east edge (−121.80) hugged
 * San Jose; a future marker anywhere in the valley — down to Morgan Hill —
 * now lands inside these bounds with no retune.
 */
export const PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS: MapBounds = [
  [-122.25, 37.10],
  [-121.63, 37.47],
];

/** Padding tuned for South Bay fitBounds above the bottom tray and beside the fog rail. */
export const PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 112,
  right: 32,
  bottom: 184,
  left: 80,
};

/**
 * Peninsula tab — canonical geographic footprint: the full San Mateo
 * peninsula, Pacific to bay. Coastside from Daly City through Montara,
 * Pillar Point / Half Moon Bay, San Gregorio, Pescadero, Pigeon Point, and
 * Año Nuevo at the county's southern coastal corner; bayside from SFO through
 * San Mateo, Redwood City, and Palo Alto; the Skyline ridge between.
 *
 * Anchors: Point Montara (−122.514) west, the SF county line (37.71) north,
 * Año Nuevo (37.109) south, Palo Alto / the Dumbarton shore (−122.12) east.
 * The previous south edge (37.36) was fitted to the Half Moon Bay marker and
 * excluded the entire southern coastside; a future marker anywhere on the
 * peninsula — down to Año Nuevo — now lands inside these bounds with no
 * retune. East stops short of Mountain View (−122.084), which is South Bay.
 */
export const PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS: MapBounds = [
  [-122.55, 37.09],
  [-122.09, 37.71],
];

/**
 * Padding tuned for Peninsula fitBounds above the bottom tray and beside the
 * fog rail. Coastal pins sit west and bay-side pins sit east, so left padding
 * clears the fog rail while right padding keeps Palo Alto inside the frame.
 */
export const PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING: ViewportPadding = {
  top: 112,
  right: 36,
  bottom: 200,
  left: 84,
};

/**
 * Deselected / all-Bay default: the minimum bounding box of the canonical
 * supported location catalog (backend `/locations`), rounded slightly outward.
 * Current extremes: Santa Rosa (north + west), Los Gatos (south), Livermore
 * (east). Framed through the same canonical fitBounds path as the five
 * regions so every supported marker is on screen when no region is active.
 *
 * The frontend deliberately has no location catalog (the backend is the single
 * source of truth and the runtime list handed to the map is filtered by region
 * chips / fog intensity), so this stays a fixed canonical constant rather than
 * a runtime derivation. When the supported catalog expands beyond this box,
 * widen it to the new catalog AABB — the geography test in
 * `tests/map/phonePortraitCameraGeography.test.ts` locks it to the full
 * catalog and will fail if it drifts.
 */
export const PHONE_PORTRAIT_ALL_BAY_BOUNDS: MapBounds = [
  [-122.72, 37.22],
  [-121.76, 38.45],
];

/**
 * Breathing room for the all-Bay fitBounds on a 390×844 portrait viewport.
 * Side padding is the binding fit dimension: it keeps Santa Rosa (west) and
 * Livermore (east) ~80px inside the screen edges so the catalog is centered
 * with clear margin rather than edge-hugging. Top/bottom place Santa Rosa
 * under the region chips and Los Gatos above the tray with similar room.
 * Shared pan limits are wide enough that this fit stays unclamped.
 */
export const PHONE_PORTRAIT_ALL_BAY_VIEWPORT_PADDING: ViewportPadding = {
  top: 112,
  right: 80,
  bottom: 260,
  left: 80,
};

/**
 * Most-zoomed-out floor for phone-portrait web. Matches the padded all-Bay
 * fit (~7.40) so pinch-zoom cannot collapse past the comfortable default
 * framing into empty water / statewide coverage.
 */
export const PHONE_PORTRAIT_MAP_MIN_ZOOM = 7.3;

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
