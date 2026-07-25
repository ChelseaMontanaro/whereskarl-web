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
