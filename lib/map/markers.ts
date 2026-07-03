import {
  getFogIntensity,
  getLocationConditionLabel,
  resolveFogScore,
  type FogIntensity,
} from "@/lib/map/conditions";
import { getMarkerIconMarkup } from "@/lib/map/markerIcons";

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
  fogLayerEnabled: boolean,
): string {
  const conditionLabel = fogLayerEnabled
    ? getLocationConditionLabel(location)
    : location.status?.trim() || "Conditions unavailable";

  if (isSelected) {
    return `${location.name}, selected, ${conditionLabel}`;
  }

  return `${location.name}, ${conditionLabel}`;
}

function getMarkerIntensity(
  location: MapMarkerLocation,
  fogLayerEnabled: boolean,
): FogIntensity | "neutral" {
  if (!fogLayerEnabled) {
    return "neutral";
  }

  const fogScore = resolveFogScore(location);
  return getFogIntensity(fogScore);
}

function getMarkerIntensityClass(
  location: MapMarkerLocation,
  fogLayerEnabled: boolean,
): string {
  const intensity = getMarkerIntensity(location, fogLayerEnabled);
  if (intensity === "neutral") {
    return "karl-map-marker--neutral";
  }

  return `karl-map-marker--${intensity}`;
}

export function createMapMarkerElement(input: {
  location: MapMarkerLocation;
  isSelected: boolean;
  fogLayerEnabled: boolean;
  onSelect: (locationId: string) => void;
}): HTMLButtonElement {
  const intensity = getMarkerIntensity(input.location, input.fogLayerEnabled);
  const button = document.createElement("button");
  button.type = "button";
  button.className = [
    "karl-map-marker",
    getMarkerIntensityClass(input.location, input.fogLayerEnabled),
    input.isSelected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  button.dataset.locationId = input.location.id;
  button.dataset.testid = `map-marker-${input.location.id}`;
  button.innerHTML = getMarkerIconMarkup(intensity);
  button.setAttribute(
    "aria-label",
    mapMarkerAriaLabel(input.location, input.isSelected, input.fogLayerEnabled),
  );
  button.setAttribute("aria-pressed", input.isSelected ? "true" : "false");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    input.onSelect(input.location.id);
  });

  return button;
}

export function getMarkerFogIntensity(location: MapMarkerLocation): FogIntensity {
  return getFogIntensity(resolveFogScore(location));
}
