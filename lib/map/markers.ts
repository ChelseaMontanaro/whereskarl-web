import {
  getMarkerDisplayConditionLabel,
  locationMatchesFogIntensityFilter,
  resolveMarkerDisplayIntensity,
  type FogIntensity,
  type LocationConditionInput,
} from "@/lib/map/conditions";
import { isBayAreaProductRegionId } from "@/lib/map/config";
import { getMarkerIconMarkup } from "@/lib/map/markerIcons";
import { getProductRegionIdForLocation } from "@/lib/map/regions";
import { isNighttime } from "@/lib/home/weatherDisplay";
import type { DataStatus } from "@/lib/schemas/shared";
import { degradedMarkerAriaSuffix } from "@/lib/weather/dataStatus";

export type MapMarkerLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sunshineScore: number;
  fogScore?: number | null;
  status?: string | null;
  region?: string | null;
  dataStatus?: DataStatus;
};

export function mapMarkerAriaLabel(
  location: MapMarkerLocation,
  isSelected: boolean,
): string {
  const conditionLabel = getMarkerDisplayConditionLabel(location, {
    isNighttime: isNighttime(new Date().getHours()),
  });

  const degradedSuffix = degradedMarkerAriaSuffix(location.dataStatus);
  const base = isSelected
    ? `${location.name}, selected, ${conditionLabel}`
    : `${location.name}, ${conditionLabel}`;

  return degradedSuffix ? `${base}, ${degradedSuffix}` : base;
}

function getMarkerDisplayIntensity(location: MapMarkerLocation): FogIntensity {
  return resolveMarkerDisplayIntensity(location);
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

  return locationMatchesFogIntensityFilter(location, intensityFilter);
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

function isOutsideSelectedRegionWhenCombinedFilter(
  location: MapMarkerLocation,
  intensityFilter: FogIntensity | null | undefined,
  selectedRegionId: string | null | undefined,
): boolean {
  if (!intensityFilter || !selectedRegionId) {
    return false;
  }

  if (!isBayAreaProductRegionId(selectedRegionId)) {
    return false;
  }

  return getProductRegionIdForLocation(location) !== selectedRegionId;
}

export function isMapMarkerVisible(
  location: MapMarkerLocation,
  options: {
    intensityFilter?: FogIntensity | null;
    selectedRegionId?: string | null;
  } = {},
): boolean {
  const { intensityFilter = null, selectedRegionId = null } = options;

  if (
    intensityFilter &&
    !matchesIntensityFilter(location, intensityFilter)
  ) {
    return false;
  }

  if (isOutsideSelectedRegionWhenCombinedFilter(
    location,
    intensityFilter,
    selectedRegionId,
  )) {
    return false;
  }

  return true;
}

export function shouldShowFoggyFilterMarkerLabel(
  layout: "mobile" | "desktop" | undefined,
  intensityFilter: FogIntensity | null | undefined,
  isFilteredOut: boolean,
): boolean {
  return (
    layout === "desktop" &&
    intensityFilter != null &&
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
  selectedRegionId?: string | null;
  layout?: "mobile" | "desktop";
  showLocationLabel?: boolean;
  onSelect: (locationId: string) => void;
}): HTMLElement {
  const intensity = getMarkerDisplayIntensity(input.location);
  const isFilteredOut = !matchesIntensityFilter(
    input.location,
    input.intensityFilter,
  );
  const isVisible = isMapMarkerVisible(input.location, {
    intensityFilter: input.intensityFilter,
    selectedRegionId: input.selectedRegionId,
  });
  const button = document.createElement("button");
  button.type = "button";
  button.className = [
    "karl-map-marker",
    getMarkerIntensityClass(input.location),
    input.isSelected ? "is-selected" : "",
    isFilteredOut ? "is-filtered-out" : "",
    !isVisible ||
    shouldHideFilteredMarker(input.intensityFilter, isFilteredOut)
      ? "is-filtered-hidden"
      : "",
    input.intensityFilter && isVisible ? "is-intensity-match" : "",
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
      !isVisible,
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
  return resolveMarkerDisplayIntensity(location);
}
