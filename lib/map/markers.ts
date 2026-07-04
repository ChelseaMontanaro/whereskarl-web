import {
  getLocationConditionLabel,
  resolveLocationFogIntensity,
  type FogIntensity,
  type LocationConditionInput,
} from "@/lib/map/conditions";
import { getMarkerIconMarkup } from "@/lib/map/markerIcons";
import { isNighttime } from "@/lib/home/weatherDisplay";

export type MapMarkerLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sunshineScore: number;
  fogScore?: number | null;
  status?: string | null;
};

export function mapMarkerAriaLabel(
  location: MapMarkerLocation,
  isSelected: boolean,
): string {
  const conditionLabel = getLocationConditionLabel(location);

  if (isSelected) {
    return `${location.name}, selected, ${conditionLabel}`;
  }

  return `${location.name}, ${conditionLabel}`;
}

function getMarkerDisplayIntensity(location: MapMarkerLocation): FogIntensity {
  return resolveLocationFogIntensity(location);
}

function getMarkerIntensityClass(location: MapMarkerLocation): string {
  return `karl-map-marker--${getMarkerDisplayIntensity(location)}`;
}

function matchesIntensityFilter(
  location: MapMarkerLocation,
  intensityFilter: FogIntensity | null | undefined,
): boolean {
  if (!intensityFilter) {
    return true;
  }

  return getMarkerFogIntensity(location) === intensityFilter;
}

function shouldHideFilteredMarker(
  intensityFilter: FogIntensity | null | undefined,
  isFilteredOut: boolean,
): boolean {
  if (!isFilteredOut || !intensityFilter) {
    return false;
  }

  return (
    intensityFilter === "clear" ||
    intensityFilter === "lightFog" ||
    intensityFilter === "foggy" ||
    intensityFilter === "karlTerritory"
  );
}

export function shouldShowFoggyFilterMarkerLabel(
  layout: "mobile" | "desktop" | undefined,
  intensityFilter: FogIntensity | null | undefined,
  isFilteredOut: boolean,
): boolean {
  return (
    layout === "desktop" &&
    (intensityFilter === "foggy" || intensityFilter === "karlTerritory") &&
    !isFilteredOut
  );
}

/** Keeps the icon centered on the coordinate while the label sits below. */
export const FOGGY_FILTER_MARKER_OFFSET: [number, number] = [0, -11];

export function getMapMarkerPlacementOptions(showLocationLabel: boolean): {
  anchor: "center";
  offset?: [number, number];
} {
  if (!showLocationLabel) {
    return { anchor: "center" };
  }

  return {
    anchor: "center",
    offset: FOGGY_FILTER_MARKER_OFFSET,
  };
}

function wrapMarkerWithLocationLabel(
  button: HTMLButtonElement,
  locationName: string,
): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "karl-map-marker-root karl-map-marker-root--labeled";
  root.dataset.locationId = button.dataset.locationId ?? "";

  const label = document.createElement("span");
  label.className = "karl-map-marker__label";
  label.textContent = locationName;
  label.setAttribute("aria-hidden", "true");

  root.append(button, label);
  return root;
}

function buildMapMarkerElement(
  button: HTMLButtonElement,
  locationName: string,
  showLocationLabel: boolean,
): HTMLElement {
  if (!showLocationLabel) {
    return button;
  }

  return wrapMarkerWithLocationLabel(button, locationName);
}

export function createMapMarkerElement(input: {
  location: MapMarkerLocation;
  isSelected: boolean;
  fogLayerEnabled: boolean;
  intensityFilter?: FogIntensity | null;
  layout?: "mobile" | "desktop";
  showLocationLabel?: boolean;
  onSelect: (locationId: string) => void;
}): HTMLElement {
  const intensity = getMarkerDisplayIntensity(input.location);
  const isFilteredOut = !matchesIntensityFilter(
    input.location,
    input.intensityFilter,
  );
  const button = document.createElement("button");
  button.type = "button";
  button.className = [
    "karl-map-marker",
    getMarkerIntensityClass(input.location),
    input.isSelected ? "is-selected" : "",
    isFilteredOut ? "is-filtered-out" : "",
    shouldHideFilteredMarker(input.intensityFilter, isFilteredOut)
      ? "is-filtered-hidden"
      : "",
    input.intensityFilter && !isFilteredOut ? "is-intensity-match" : "",
  ]
    .filter(Boolean)
    .join(" ");
  button.dataset.locationId = input.location.id;
  button.dataset.testid = `map-marker-${input.location.id}`;
  button.innerHTML = getMarkerIconMarkup(intensity, {
    isNighttime: isNighttime(new Date().getHours()),
  });
  button.setAttribute(
    "aria-label",
    mapMarkerAriaLabel(input.location, input.isSelected),
  );
  button.setAttribute("aria-pressed", input.isSelected ? "true" : "false");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    input.onSelect(input.location.id);
  });

  const showLocationLabel =
    input.showLocationLabel ??
    shouldShowFoggyFilterMarkerLabel(
      input.layout,
      input.intensityFilter,
      isFilteredOut,
    );

  return buildMapMarkerElement(
    button,
    input.location.name,
    showLocationLabel,
  );
}

export function getMarkerFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  return resolveLocationFogIntensity(location);
}
