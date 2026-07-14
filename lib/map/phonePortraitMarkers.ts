import type { Map as MapLibreMap } from "maplibre-gl";

import {
  locationMatchesFogIntensityFilter,
  resolveMarkerDisplayIntensity,
  type FogIntensity,
} from "@/lib/map/conditions";
import {
  getPhonePortraitMarkerIconMarkup,
} from "@/lib/map/phonePortraitConditionIcons";
import type { BayAreaVisibleProductRegionId } from "@/lib/map/config";
import {
  getPhonePortraitMarkerLabelOffset,
  PHONE_PORTRAIT_ICON_COLLISION_X,
  PHONE_PORTRAIT_ICON_COLLISION_Y,
  PHONE_PORTRAIT_LOW_ZOOM_ICON_ONLY_LOCATION_IDS,
  PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD,
  PHONE_PORTRAIT_MARKER_COLLISION_X,
  PHONE_PORTRAIT_MARKER_COLLISION_Y,
  resolvePhonePortraitMarkerLabelOffset,
} from "@/lib/map/phonePortraitMapPresentation";
import {
  mapMarkerAriaLabel,
  type MapMarkerLocation,
} from "@/lib/map/markers";

const CLEAR_SUN_COLOR = "rgb(242 163 38)";

/**
 * Canonical phone-portrait marker visibility states. This is the single result
 * model shared by collision decluttering, the low-zoom policy, selection, and
 * any future emphasis consumer (search/favorite/product-region prioritization).
 *
 *   full      = weather icon + label + score (a fully identified marker)
 *   icon-only = weather icon visible, label/score suppressed (geographic
 *               presence retained; still clickable and named for a11y)
 *   hidden    = whole marker removed (only via the canonical icon-collision
 *               fallback, and never for a selected marker)
 */
export type PhonePortraitMarkerVisibility = "full" | "icon-only" | "hidden";

export type PhonePortraitDeclutterEntry = {
  locationId: string;
  element: HTMLElement;
  priority: number;
  score: number;
  isSelected: boolean;
  /**
   * Canonical product region for this marker, resolved by the caller through
   * the single product-region resolver (`getProductRegionIdForLocation`). Used
   * for region-anchor label prioritization. `null` when the location has no
   * resolvable region (it simply never becomes a region anchor).
   */
  productRegionId?: BayAreaVisibleProductRegionId | null;
};

export function createPhonePortraitMapMarkerElement(input: {
  location: MapMarkerLocation;
  isSelected: boolean;
  intensityFilter?: FogIntensity | null;
  showLocationLabel: boolean;
  isNighttime?: boolean;
  onSelect: (locationId: string) => void;
}): HTMLDivElement {
  const intensity = resolveMarkerDisplayIntensity(input.location);
  const isFilteredOut =
    input.intensityFilter != null &&
    !locationMatchesFogIntensityFilter(input.location, input.intensityFilter);
  const score = Math.round(input.location.sunshineScore);

  const root = document.createElement("div");
  root.className = [
    "karl-universal-map-marker-root",
    "is-phone-portrait",
    input.showLocationLabel ? "has-label" : "",
    input.isSelected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  root.dataset.locationId = input.location.id;

  const button = document.createElement("button");
  button.type = "button";
  button.className = [
    "karl-universal-map-marker",
    `karl-universal-map-marker--${intensity}`,
    "karl-universal-map-marker--phone-portrait",
    input.isSelected ? "is-selected" : "",
    isFilteredOut ? "is-filtered-out" : "",
  ]
    .filter(Boolean)
    .join(" ");
  button.style.setProperty("--marker-scale", input.isSelected ? "1.06" : "1");
  button.style.setProperty("--score-color", CLEAR_SUN_COLOR);
  if (intensity === "clear") {
    button.style.setProperty("--clear-sun-color", CLEAR_SUN_COLOR);
  }
  button.dataset.locationId = input.location.id;
  button.dataset.testid = `map-marker-${input.location.id}`;
  button.setAttribute(
    "aria-label",
    mapMarkerAriaLabel(input.location, input.isSelected),
  );
  button.setAttribute("aria-pressed", input.isSelected ? "true" : "false");
  button.innerHTML = getPhonePortraitMarkerIconMarkup(intensity, {
    isNighttime: input.isNighttime,
  });
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    input.onSelect(input.location.id);
  });

  // The weather icon is the only in-flow child, so the MapLibre marker (anchor
  // "center", zero offset) pins the icon center exactly on the coordinate.
  root.append(button);

  // Label + score live in an absolutely positioned group so their per-location
  // declutter offset never moves the coordinate-anchored icon. The group sits
  // below the icon by default; the offset shifts only this group. The offset is
  // scaled toward the icon as the map zooms out (see
  // resolvePhonePortraitMarkerLabelOffset); the configured value is retained in
  // dataset as the canonical source, and the initial render uses the configured
  // (reference-zoom) offset until the first zoom-aware pass runs.
  const meta = document.createElement("div");
  meta.className = "karl-universal-map-marker__meta";
  const labelOffset = getPhonePortraitMarkerLabelOffset(input.location.id);
  meta.dataset.labelOffsetX = String(labelOffset[0]);
  meta.dataset.labelOffsetY = String(labelOffset[1]);
  writePhonePortraitMetaOffset(meta, labelOffset[0], labelOffset[1]);

  if (input.showLocationLabel) {
    const label = document.createElement("span");
    label.className = "karl-universal-map-marker__label";
    label.textContent = input.location.name;
    label.setAttribute("aria-hidden", "true");
    meta.append(label);
  }

  const scoreBadge = document.createElement("span");
  scoreBadge.className = "karl-universal-map-marker__score";
  scoreBadge.textContent = String(score);
  scoreBadge.setAttribute("aria-hidden", "true");
  meta.append(scoreBadge);

  root.append(meta);

  return root;
}

/**
 * Writes the rendered label/score offset onto the __meta group. Centralized so
 * marker creation and every zoom-aware update produce an identical transform
 * string and record the rendered offset consistently in dataset.
 */
function writePhonePortraitMetaOffset(
  meta: HTMLElement,
  x: number,
  y: number,
): void {
  meta.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
  meta.dataset.renderedOffsetX = String(x);
  meta.dataset.renderedOffsetY = String(y);
}

/**
 * Applies the zoom-scaled canonical label/score offset to a single marker's
 * __meta group. The coordinate-anchored icon is never touched. Safe to call
 * repeatedly (idempotent for a given zoom).
 */
export function applyPhonePortraitMarkerLabelOffset(
  root: HTMLElement,
  locationId: string,
  zoom: number,
): void {
  const meta = root.querySelector<HTMLElement>(
    ".karl-universal-map-marker__meta",
  );
  if (!meta) {
    return;
  }

  const [x, y] = resolvePhonePortraitMarkerLabelOffset(locationId, zoom);
  writePhonePortraitMetaOffset(meta, x, y);
}

/**
 * Zoom-aware update for every mounted phone-portrait marker. Intended to be
 * driven by a single map-level `zoom` handler so the label/score groups scale
 * smoothly without any per-marker listeners or React re-renders.
 */
export function updatePhonePortraitMarkerLabelOffsets(
  map: MapLibreMap,
  entries: PhonePortraitDeclutterEntry[],
): void {
  const zoom = map.getZoom();
  for (const entry of entries) {
    applyPhonePortraitMarkerLabelOffset(entry.element, entry.locationId, zoom);
  }
}

type ViewportBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type IconGeometry = {
  x: number;
  y: number;
  hasGeometry: boolean;
  box: ViewportBox;
};

type LabelGeometry = {
  x: number;
  y: number;
  box: ViewportBox;
};

function viewportBoxFromRect(rect: DOMRect): ViewportBox {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function boxesIntersect(a: ViewportBox, b: ViewportBox): boolean {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

/**
 * Returns the center of the rendered label/score group in viewport pixels.
 * This reads the live DOM (including MapLibre's translate and the per-location
 * label offset) so collision math matches exactly what the user sees. Falls
 * back to the marker root when the meta group is unexpectedly absent.
 */
function measureLabelGroup(element: HTMLElement): LabelGeometry {
  const meta = element.querySelector<HTMLElement>(
    ".karl-universal-map-marker__meta",
  );
  const rect = (meta ?? element).getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    box: viewportBoxFromRect(rect),
  };
}

/**
 * Returns the rendered center and box of the coordinate-anchored weather icon.
 * Icon collision only participates when the icon actually has laid-out
 * geometry; when the rect is degenerate (non-layout environments such as the
 * unit-test DOM) `hasGeometry` is false so icon collision is skipped and never
 * accidentally hides everything at the origin. Pixel-exact icon behavior is
 * verified at a real 390x844 viewport.
 */
function measureIcon(element: HTMLElement): IconGeometry {
  const icon = element.querySelector<HTMLElement>(
    ".karl-universal-map-marker",
  );
  const rect = (icon ?? element).getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    hasGeometry: rect.width > 0 || rect.height > 0,
    box: viewportBoxFromRect(rect),
  };
}

/**
 * Canonical writer for a marker's visibility state. This is the ONE place that
 * translates a {@link PhonePortraitMarkerVisibility} into DOM/style. Never set
 * `display` on the root or the __meta group directly elsewhere.
 *
 *   full      -> root shown, label/score group shown
 *   icon-only -> root shown, label/score group hidden (icon retains presence,
 *                stays clickable; the icon's `aria-label` keeps identity)
 *   hidden    -> root hidden entirely
 */
export function applyPhonePortraitMarkerVisibility(
  element: HTMLElement,
  visibility: PhonePortraitMarkerVisibility,
): void {
  const meta = element.querySelector<HTMLElement>(
    ".karl-universal-map-marker__meta",
  );

  element.dataset.markerVisibility = visibility;

  if (visibility === "hidden") {
    element.style.display = "none";
    if (meta) {
      meta.style.display = "";
    }
    return;
  }

  element.style.display = "";
  if (meta) {
    meta.style.display = visibility === "icon-only" ? "none" : "";
  }
}

/**
 * Canonical region-anchor selection. For every product region that has an
 * eligible entry, choose exactly one representative marker that is prioritized
 * for a readable label in the all-Bay composition. Selection is deterministic
 * and reuses the canonical priority signal:
 *
 *   1. a selected marker is always its own region's anchor (never displaced),
 *   2. otherwise the region's member with the best
 *      (product priority, then higher score, then id) wins.
 *
 * Region membership comes from `entry.productRegionId`, which the caller
 * resolves through the single canonical product-region resolver — this function
 * never introduces a second location-to-region mapping.
 */
export function selectPhonePortraitRegionAnchorIds(
  entries: PhonePortraitDeclutterEntry[],
): Set<string> {
  const byRegion = new Map<string, PhonePortraitDeclutterEntry[]>();
  for (const entry of entries) {
    const region = entry.productRegionId;
    if (!region) {
      continue;
    }
    const group = byRegion.get(region);
    if (group) {
      group.push(entry);
    } else {
      byRegion.set(region, [entry]);
    }
  }

  const anchors = new Set<string>();
  for (const group of byRegion.values()) {
    const selected = group.find((entry) => entry.isSelected);
    if (selected) {
      anchors.add(selected.locationId);
      continue;
    }
    const best = [...group].sort(comparePhonePortraitPriority)[0];
    if (best) {
      anchors.add(best.locationId);
    }
  }

  return anchors;
}

/**
 * Deterministic priority comparator (lower sorts first): product priority, then
 * higher Clear Sky Score, then a stable id tie-breaker. DOM order is never used.
 */
function comparePhonePortraitPriority(
  a: PhonePortraitDeclutterEntry,
  b: PhonePortraitDeclutterEntry,
): number {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  if (a.score !== b.score) {
    return b.score - a.score;
  }
  return a.locationId < b.locationId ? -1 : a.locationId > b.locationId ? 1 : 0;
}

/**
 * The canonical declutter ordering used by the collision pass. Tiers, highest
 * priority first:
 *
 *   1. selected marker (always wins),
 *   2. required regional anchor (one representative label per region),
 *   3. product-defined priority (PHONE_PORTRAIT_PRIORITY_LOCATION_IDS),
 *   4. Clear Sky Score,
 *   5. stable id tie-breaker.
 */
export function comparePhonePortraitDeclutterOrder(
  a: PhonePortraitDeclutterEntry,
  b: PhonePortraitDeclutterEntry,
  anchorIds: Set<string>,
): number {
  if (a.isSelected !== b.isSelected) {
    return a.isSelected ? -1 : 1;
  }
  const aAnchor = anchorIds.has(a.locationId);
  const bAnchor = anchorIds.has(b.locationId);
  if (aAnchor !== bAnchor) {
    return aAnchor ? -1 : 1;
  }
  return comparePhonePortraitPriority(a, b);
}

/**
 * Canonical phone-portrait declutter pass. Resolves each marker to one
 * {@link PhonePortraitMarkerVisibility} state and writes it through
 * {@link applyPhonePortraitMarkerVisibility}. Rendering and collision share the
 * same zoom-scaled label position, so they can never diverge.
 *
 * Two deterministic phases (same priority order, no second pipeline):
 *
 *   Phase A — retained icons
 *     Icon↔icon collision is the only whole-marker hide (`hidden`). Selected
 *     markers are exempt. Surviving icons keep true MapLibre coordinates
 *     (marker offset [0,0]); their live boxes are collected for Phase B.
 *
 *   Phase B — labels
 *     A retained marker may become `full` only when its rendered `__meta` is
 *     not low-zoom-suppressed, does not collide with an already accepted label
 *     (label↔label), and does not intersect any *other* retained icon
 *     (label↔icon, AABB). Otherwise it resolves to `icon-only`.
 *
 * Selected-state exception (Phase B):
 *   The selected marker is always `full`. If its visible `__meta` AABB
 *   intersects another retained secondary icon, only that secondary marker
 *   becomes `hidden` (identity of the selection wins over geographic presence
 *   of the covered icon). Unrelated markers are untouched. Re-running the pass
 *   after selection changes restores ordinary Phase B results.
 *
 * Region anchors remain exempt from low-zoom label suppression so every product
 * region keeps one readable labeled representative where geometry permits.
 */
export function declutterPhonePortraitMarkers(
  map: MapLibreMap,
  entries: PhonePortraitDeclutterEntry[],
  options?: { applyLowZoomHiding?: boolean },
): void {
  // Low-zoom label suppression of the SF/coastal cluster is only meaningful in
  // the wide all-Bay composition, where those labels overlap into an unreadable
  // knot. Inside a specific region camera the region's own members must stay
  // eligible (collision alone declutters them), so callers pass `false` when a
  // region is active. Defaults to `true` to preserve all-Bay behavior.
  const applyLowZoomHiding = options?.applyLowZoomHiding ?? true;
  const zoom = map.getZoom();

  // Reveal every marker (icon + label) first so geometry can be measured from
  // the live DOM. This whole pass is synchronous, so the browser never paints
  // an intermediate all-visible frame before markers are re-declared.
  for (const entry of entries) {
    applyPhonePortraitMarkerVisibility(entry.element, "full");
  }

  // Apply the current zoom-scaled offset to every label/score group *before*
  // measuring, so collision detection operates on exactly the rendered
  // position. Rendering and decluttering share one offset source.
  for (const entry of entries) {
    applyPhonePortraitMarkerLabelOffset(entry.element, entry.locationId, zoom);
  }

  const anchorIds = selectPhonePortraitRegionAnchorIds(entries);
  const ordered = [...entries].sort((a, b) =>
    comparePhonePortraitDeclutterOrder(a, b, anchorIds),
  );

  type RetainedMarker = {
    entry: PhonePortraitDeclutterEntry;
    icon: IconGeometry;
  };

  const placedIconCenters: Array<{ x: number; y: number }> = [];
  const retained: RetainedMarker[] = [];

  const iconCollides = (icon: IconGeometry): boolean =>
    icon.hasGeometry &&
    placedIconCenters.some(
      (other) =>
        Math.abs(other.x - icon.x) < PHONE_PORTRAIT_ICON_COLLISION_X &&
        Math.abs(other.y - icon.y) < PHONE_PORTRAIT_ICON_COLLISION_Y,
    );

  // ---------------------------------------------------------------------------
  // Phase A — resolve retained icons (never moves coordinates)
  // ---------------------------------------------------------------------------
  for (const entry of ordered) {
    const icon = measureIcon(entry.element);

    if (entry.isSelected) {
      retained.push({ entry, icon });
      if (icon.hasGeometry) {
        placedIconCenters.push({ x: icon.x, y: icon.y });
      }
      continue;
    }

    if (iconCollides(icon)) {
      applyPhonePortraitMarkerVisibility(entry.element, "hidden");
      continue;
    }

    retained.push({ entry, icon });
    if (icon.hasGeometry) {
      placedIconCenters.push({ x: icon.x, y: icon.y });
    }
  }

  const placedLabels: Array<{ x: number; y: number }> = [];
  const hiddenBySelectedCover = new Set<string>();

  const labelCollides = (label: { x: number; y: number }): boolean =>
    placedLabels.some(
      (other) =>
        Math.abs(other.x - label.x) < PHONE_PORTRAIT_MARKER_COLLISION_X &&
        Math.abs(other.y - label.y) < PHONE_PORTRAIT_MARKER_COLLISION_Y,
    );

  const metaCoversOtherRetainedIcon = (
    metaBox: ViewportBox,
    ownerId: string,
  ): boolean =>
    retained.some(
      (other) =>
        other.entry.locationId !== ownerId &&
        !hiddenBySelectedCover.has(other.entry.locationId) &&
        other.icon.hasGeometry &&
        boxesIntersect(metaBox, other.icon.box),
    );

  // ---------------------------------------------------------------------------
  // Phase B — resolve labels (label↔label + label↔other retained icon)
  // ---------------------------------------------------------------------------
  for (const { entry } of retained) {
    if (hiddenBySelectedCover.has(entry.locationId)) {
      continue;
    }

    // Measure after Phase A so AABB coverage matches live offsets / layout
    // (markers were temporarily revealed as `full` for accurate __meta boxes).
    const liveLabel = measureLabelGroup(entry.element);

    if (entry.isSelected) {
      applyPhonePortraitMarkerVisibility(entry.element, "full");
      placedLabels.push({ x: liveLabel.x, y: liveLabel.y });

      // Selected-state exception: selection identity stays full; only secondary
      // icons actually covered by the selected __meta become hidden.
      for (const other of retained) {
        if (other.entry.locationId === entry.locationId) {
          continue;
        }
        if (!other.icon.hasGeometry) {
          continue;
        }
        if (boxesIntersect(liveLabel.box, other.icon.box)) {
          applyPhonePortraitMarkerVisibility(other.entry.element, "hidden");
          hiddenBySelectedCover.add(other.entry.locationId);
        }
      }
      continue;
    }

    const isAnchor = anchorIds.has(entry.locationId);
    const lowZoomSuppressed =
      applyLowZoomHiding &&
      !isAnchor &&
      zoom < PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD &&
      PHONE_PORTRAIT_LOW_ZOOM_ICON_ONLY_LOCATION_IDS.has(entry.locationId);

    const mayBeFull =
      !lowZoomSuppressed &&
      !labelCollides(liveLabel) &&
      !metaCoversOtherRetainedIcon(liveLabel.box, entry.locationId);

    if (mayBeFull) {
      applyPhonePortraitMarkerVisibility(entry.element, "full");
      placedLabels.push({ x: liveLabel.x, y: liveLabel.y });
    } else {
      // Label collides, covers another retained icon, or is low-zoom-suppressed:
      // keep the geographically anchored icon, drop the label/score group.
      applyPhonePortraitMarkerVisibility(entry.element, "icon-only");
    }
  }
}
