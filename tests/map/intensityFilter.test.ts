import { describe, expect, it } from "vitest";

import type { FogIntensity } from "@/lib/map/conditions";
import {
  boundsForIntensityLocations,
  intensityFilterTrayItems,
  toggleIntensityFilter,
} from "@/lib/map/intensityFilter";
import type { LocationWeather } from "@/lib/schemas/weather";

const baseLocation = {
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Mostly Sunny",
  temperature: 72,
  sunshineScore: 82,
  distanceText: "9 mi",
  cloudCover: 22,
  visibility: 9.5,
  humidity: 58,
  windSpeed: 7,
  windDirection: "W",
  weatherCode: 1,
  iconName: "sun.max.fill",
  karlReason: "Clear conditions.",
  primaryDrivers: [],
  microclimateFactors: [],
  updatedAt: "2026-07-01T16:00:00.000Z",
  confidenceScore: 0,
  confidenceLabel: "Unavailable",
  confidenceExplanation: "Confidence unavailable for demo or fallback data.",
  confidenceComponents: {
    freshness: 0,
    observationQuality: 0,
    fieldCompleteness: 0,
    sourceReliability: 0,
  },
  prediction: {
    predictionConfidenceScore: 0,
    predictionConfidenceLabel: "Unavailable",
    predictionReason: "Prediction is unavailable while Karl is using fallback data.",
  },
} satisfies Omit<LocationWeather, "id" | "name" | "fogScore">;

describe("boundsForIntensityLocations", () => {
  it("returns bounds that cover matching marker locations", () => {
    const locations = [
      {
        id: "tiburon",
        name: "Tiburon",
        latitude: 37.8735,
        longitude: -122.4566,
        sunshineScore: 82,
        fogScore: 82,
        status: "Mostly Sunny",
      },
      {
        id: "san-jose",
        name: "San Jose",
        latitude: 37.3382,
        longitude: -121.8863,
        sunshineScore: 90,
        fogScore: 10,
        status: "Clear",
      },
    ];

    const bounds = boundsForIntensityLocations(locations, "clear");

    expect(bounds).toEqual([
      [-121.8863, 37.3382],
      [-121.8863, 37.3382],
    ]);
  });
});

describe("intensityFilterTrayItems", () => {
  it("returns matching locations for the selected intensity", () => {
    const locations: LocationWeather[] = [
      {
        ...baseLocation,
        id: "tiburon",
        name: "Tiburon",
        fogScore: 82,
      },
      {
        ...baseLocation,
        id: "san-jose",
        name: "San Jose",
        fogScore: 10,
        sunshineScore: 90,
      },
    ];

    const items = intensityFilterTrayItems(locations, "clear", null, 4);

    expect(items).toHaveLength(1);
    expect(items[0]?.locationId).toBe("san-jose");
    expect(items[0]?.locationName).toBe("San Jose");
  });
});

describe("toggleIntensityFilter", () => {
  const intensities: FogIntensity[] = [
    "clear",
    "lightFog",
    "foggy",
    "karlTerritory",
  ];

  it.each(intensities)("activates %s when no filter is active", (intensity) => {
    expect(toggleIntensityFilter(null, intensity)).toBe(intensity);
  });

  it.each(intensities)(
    "deactivates %s when the same intensity is clicked again",
    (intensity) => {
      expect(toggleIntensityFilter(intensity, intensity)).toBeNull();
    },
  );

  it("switches from one intensity to another without requiring Reset", () => {
    expect(toggleIntensityFilter("clear", "foggy")).toBe("foggy");
    expect(toggleIntensityFilter("karlTerritory", "lightFog")).toBe("lightFog");
  });
});
