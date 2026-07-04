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
 * Live-style mismatch: high sunshineScore with fogScore in the 25–49 band.
 * Mirrors Tiburon (82/26), Sausalito (74/41), San Jose (76/24), Oakland (72/28).
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
    fogScore: 24,
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
  it("shows at least one Clear marker when clear-band locations exist in live-style data", () => {
    const clearMarkers = liveMapScenario.filter((location) =>
      locationMatchesFogIntensityFilter(location, "clear"),
    );

    expect(clearMarkers.map((location) => location.id)).toEqual(["san-jose"]);

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

  it("keeps fogScore 25–49 locations in Light Fog rather than Clear", () => {
    for (const locationId of ["tiburon", "sausalito", "oakland"]) {
      const location = liveMapScenario.find((entry) => entry.id === locationId);

      expect(location).toBeDefined();
      expect(
        locationMatchesFogIntensityFilter(location!, "lightFog"),
      ).toBe(true);
      expect(
        locationMatchesFogIntensityFilter(location!, "clear"),
      ).toBe(false);
      expect(getBestRightNowScoreLabel(location!)).not.toContain("clear");
    }
  });

  it("aligns Clear filter tray items with visible clear-band markers", () => {
    const trayItems = intensityFilterTrayItems(
      liveMapScenario,
      "clear",
      null,
      4,
    );

    expect(trayItems.map((item) => item.locationId)).toEqual(["san-jose"]);
    expect(trayItems[0]?.scoreLabel).toBe("76 clear");
  });

  it("aligns Light Fog filter tray with fogScore 25–49 locations", () => {
    const trayItems = intensityFilterTrayItems(
      liveMapScenario,
      "lightFog",
      null,
      4,
    );

    expect(trayItems.map((item) => item.locationId)).toEqual([
      "tiburon",
      "sausalito",
      "oakland",
    ]);
    expect(trayItems[0]?.scoreLabel).toBe("82 sunshine");
  });
});
