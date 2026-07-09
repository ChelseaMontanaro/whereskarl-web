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
  longitude: number;
  latitude: number;
  offset: [number, number];
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

  const scoreBadge = document.createElement("span");
  scoreBadge.className = "karl-universal-map-marker__score";
  scoreBadge.textContent = String(score);
  scoreBadge.setAttribute("aria-hidden", "true");

  root.append(button);

  if (input.showLocationLabel) {
    const label = document.createElement("span");
    label.className = "karl-universal-map-marker__label";
    label.textContent = input.location.name;
    label.setAttribute("aria-hidden", "true");
    root.append(label);
  }

  root.append(scoreBadge);

  return root;
}

export function declutterPhonePortraitMarkers(
  map: MapLibreMap,
  entries: PhonePortraitDeclutterEntry[],
): void {
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

  const zoom = map.getZoom();

  for (const entry of ordered) {
    if (
      !entry.isSelected &&
      zoom < PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD &&
      PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS.has(entry.locationId)
    ) {
      entry.element.style.display = "none";
      continue;
    }

    const projected = map.project([entry.longitude, entry.latitude]);
    const x = projected.x + entry.offset[0];
    const y = projected.y + entry.offset[1];

    const collides = placed.some(
      (other) =>
        Math.abs(other.x - x) < PHONE_PORTRAIT_MARKER_COLLISION_X &&
        Math.abs(other.y - y) < PHONE_PORTRAIT_MARKER_COLLISION_Y,
    );

    if (collides && !entry.isSelected) {
      entry.element.style.display = "none";
    } else {
      entry.element.style.display = "";
      placed.push({ x, y });
    }
  }
}
