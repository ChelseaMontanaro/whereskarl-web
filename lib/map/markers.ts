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

export function createMapMarkerElement(input: {
  location: MapMarkerLocation;
  isSelected: boolean;
  fogLayerEnabled: boolean;
  intensityFilter?: FogIntensity | null;
  onSelect: (locationId: string) => void;
}): HTMLButtonElement {
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

  return button;
}

export function getMarkerFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  return resolveLocationFogIntensity(location);
}
