import type { LocationWeather } from "@/lib/schemas/weather";

export type MapLocationFocus = {
  selectedLocation: LocationWeather | null;
  unknownLocationId: string | null;
};

export function findLocationById(
  locations: LocationWeather[],
  locationId: string | null,
): LocationWeather | null {
  if (!locationId) {
    return null;
  }

  return locations.find((location) => location.id === locationId) ?? null;
}

export function resolveMapLocationFocus(input: {
  requestedLocationId: string | null;
  locations: LocationWeather[];
}): MapLocationFocus {
  if (!input.requestedLocationId) {
    return {
      selectedLocation: null,
      unknownLocationId: null,
    };
  }

  const selectedLocation = findLocationById(
    input.locations,
    input.requestedLocationId,
  );

  if (selectedLocation) {
    return {
      selectedLocation,
      unknownLocationId: null,
    };
  }

  return {
    selectedLocation: null,
    unknownLocationId: input.requestedLocationId,
  };
}

export function mapViewportForLocation(location: LocationWeather): {
  centerLabel: string;
  markerLeftPercent: number;
  markerTopPercent: number;
  zoomLabel: string;
} {
  const minLat = 37.2;
  const maxLat = 38.1;
  const minLng = -122.8;
  const maxLng = -121.8;

  const latRatio = (location.latitude - minLat) / (maxLat - minLat);
  const lngRatio = (location.longitude - minLng) / (maxLng - minLng);

  return {
    centerLabel: `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`,
    markerLeftPercent: Math.min(92, Math.max(8, lngRatio * 100)),
    markerTopPercent: Math.min(88, Math.max(12, (1 - latRatio) * 100)),
    zoomLabel: "Focused on selected location",
  };
}
