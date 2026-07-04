// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  getBestRightNowScoreLabel,
  locationMatchesFogIntensityFilter,
} from "@/lib/map/conditions";
import { intensityFilterTrayItems } from "@/lib/map/intensityFilter";
import {
  createMapMarkerElement,
  isMapMarkerVisible,
} from "@/lib/map/markers";
import type { LocationWeather } from "@/lib/schemas/weather";

const baseLocation = {
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Mostly Sunny",
  temperature: 72,
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
} satisfies Omit<LocationWeather, "id" | "name" | "fogScore" | "sunshineScore">;

/**
 * Live-style data: high sunshineScore with fogScore in the 25–49 band.
 * Mirrors Tiburon (82/26), Sausalito (74/41), San Jose (76/26), Oakland (72/28).
 */
const liveMapScenario: LocationWeather[] = [
  {
    ...baseLocation,
    id: "tiburon",
    name: "Tiburon",
    fogScore: 26,
    sunshineScore: 82,
  },
  {
    ...baseLocation,
    id: "san-jose",
    name: "San Jose",
    latitude: 37.3382,
    longitude: -121.8863,
    fogScore: 26,
    sunshineScore: 76,
  },
  {
    ...baseLocation,
    id: "sausalito",
    name: "Sausalito",
    latitude: 37.8591,
    longitude: -122.4853,
    fogScore: 41,
    sunshineScore: 74,
  },
  {
    ...baseLocation,
    id: "oakland",
    name: "Oakland",
    latitude: 37.8044,
    longitude: -122.2712,
    fogScore: 28,
    sunshineScore: 72,
  },
  {
    ...baseLocation,
    id: "moderate-fog",
    name: "Moderate Fog",
    latitude: 37.5,
    longitude: -122.2,
    fogScore: 35,
    sunshineScore: 55,
  },
  {
    ...baseLocation,
    id: "ocean-beach",
    name: "Ocean Beach",
    latitude: 37.7594,
    longitude: -122.5107,
    fogScore: 96,
    sunshineScore: 18,
    status: "Karl Territory",
  },
];

describe("classification contract regression", () => {
  it("shows Clear markers for strong clear-sky locations in live-style data", () => {
    const clearMarkers = liveMapScenario.filter((location) =>
      locationMatchesFogIntensityFilter(location, "clear"),
    );

    expect(clearMarkers.map((location) => location.id)).toEqual([
      "tiburon",
      "san-jose",
      "sausalito",
      "oakland",
    ]);

    for (const location of clearMarkers) {
      expect(
        isMapMarkerVisible(location, { intensityFilter: "clear" }),
      ).toBe(true);

      const marker = createMapMarkerElement({
        location,
        isSelected: false,
        fogLayerEnabled: true,
        intensityFilter: "clear",
        onSelect: () => undefined,
      });

      expect(marker.className).toContain("is-intensity-match");
      expect(marker.className).not.toContain("is-filtered-hidden");
    }
  });

  it("keeps moderate fog locations in Light Fog rather than Clear", () => {
    const moderateFog = liveMapScenario.find(
      (entry) => entry.id === "moderate-fog",
    );

    expect(moderateFog).toBeDefined();
    expect(
      locationMatchesFogIntensityFilter(moderateFog!, "lightFog"),
    ).toBe(true);
    expect(
      locationMatchesFogIntensityFilter(moderateFog!, "clear"),
    ).toBe(false);
    expect(getBestRightNowScoreLabel(moderateFog!)).toBe("55 sunshine");
  });

  it("aligns Clear filter tray items with visible clear-sky markers", () => {
    const trayItems = intensityFilterTrayItems(
      liveMapScenario,
      "clear",
      null,
      4,
    );

    expect(trayItems.map((item) => item.locationId)).toEqual([
      "tiburon",
      "san-jose",
      "sausalito",
      "oakland",
    ]);
    expect(trayItems[0]?.scoreLabel).toBe("82 clear");
    expect(trayItems[1]?.scoreLabel).toBe("76 clear");
    expect(trayItems[2]?.scoreLabel).toBe("74 clear");
    expect(trayItems[3]?.scoreLabel).toBe("72 clear");
  });

  it("aligns Light Fog filter tray with moderate fog locations only", () => {
    const trayItems = intensityFilterTrayItems(
      liveMapScenario,
      "lightFog",
      null,
      4,
    );

    expect(trayItems.map((item) => item.locationId)).toEqual(["moderate-fog"]);
    expect(trayItems[0]?.scoreLabel).toBe("55 sunshine");
  });

  it("keeps Foggy and Karl Territory filters raw fogScore-based", () => {
    const oceanBeach = liveMapScenario.find(
      (entry) => entry.id === "ocean-beach",
    );

    expect(oceanBeach).toBeDefined();
    expect(
      locationMatchesFogIntensityFilter(oceanBeach!, "karlTerritory"),
    ).toBe(true);
    expect(
      locationMatchesFogIntensityFilter(oceanBeach!, "clear"),
    ).toBe(false);
    expect(
      locationMatchesFogIntensityFilter(oceanBeach!, "lightFog"),
    ).toBe(false);
  });
});
