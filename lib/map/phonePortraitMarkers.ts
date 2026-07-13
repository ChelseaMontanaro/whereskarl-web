import type { Map as MapLibreMap } from "maplibre-gl";

import {
  locationMatchesFogIntensityFilter,
  resolveMarkerDisplayIntensity,
  type FogIntensity,
} from "@/lib/map/conditions";
import {
  getPhonePortraitMarkerIconMarkup,
} from "@/lib/map/phonePortraitConditionIcons";
import {
  getPhonePortraitMarkerLabelOffset,
  PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS,
  PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD,
  PHONE_PORTRAIT_MARKER_COLLISION_X,
  PHONE_PORTRAIT_MARKER_COLLISION_Y,
} from "@/lib/map/phonePortraitMapPresentation";
import {
  mapMarkerAriaLabel,
  type MapMarkerLocation,
} from "@/lib/map/markers";

const CLEAR_SUN_COLOR = "rgb(242 163 38)";

export type PhonePortraitDeclutterEntry = {
  locationId: string;
  element: HTMLElement;
  priority: number;
  score: number;
  isSelected: boolean;
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
  // below the icon by default; the offset shifts only this group.
  const meta = document.createElement("div");
  meta.className = "karl-universal-map-marker__meta";
  const labelOffset = getPhonePortraitMarkerLabelOffset(input.location.id);
  meta.style.transform = `translate(calc(-50% + ${labelOffset[0]}px), ${labelOffset[1]}px)`;
  meta.dataset.labelOffsetX = String(labelOffset[0]);
  meta.dataset.labelOffsetY = String(labelOffset[1]);

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
 * Returns the center of the rendered label/score group in viewport pixels.
 * This reads the live DOM (including MapLibre's translate and the per-location
 * label offset) so collision math matches exactly what the user sees. Falls
 * back to the marker root when the meta group is unexpectedly absent.
 */
function measureLabelGroupCenter(element: HTMLElement): { x: number; y: number } {
  const meta = element.querySelector<HTMLElement>(
    ".karl-universal-map-marker__meta",
  );
  const rect = (meta ?? element).getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function declutterPhonePortraitMarkers(
  map: MapLibreMap,
  entries: PhonePortraitDeclutterEntry[],
): void {
  const zoom = map.getZoom();

  // Reveal every marker first so the label/score geometry can be measured from
  // the live DOM. This whole pass is synchronous, so the browser never paints
  // an intermediate all-visible frame before collided markers are re-hidden.
  for (const entry of entries) {
    entry.element.style.display = "";
  }

  const placed: Array<{ x: number; y: number }> = [];
  const ordered = [...entries].sort((a, b) => {
    if (a.isSelected !== b.isSelected) {
      return a.isSelected ? -1 : 1;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.score - a.score;
  });

  for (const entry of ordered) {
    if (
      !entry.isSelected &&
      zoom < PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD &&
      PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS.has(entry.locationId)
    ) {
      entry.element.style.display = "none";
      continue;
    }

    // Collision is evaluated on the rendered label/score group position — the
    // coordinate-anchored icon is never used to displace the marker. A marker
    // is hidden only when its visible label/score group would collide.
    const { x, y } = measureLabelGroupCenter(entry.element);

    const collides = placed.some(
      (other) =>
        Math.abs(other.x - x) < PHONE_PORTRAIT_MARKER_COLLISION_X &&
        Math.abs(other.y - y) < PHONE_PORTRAIT_MARKER_COLLISION_Y,
    );

    if (collides && !entry.isSelected) {
      entry.element.style.display = "none";
    } else {
      placed.push({ x, y });
    }
  }
}
