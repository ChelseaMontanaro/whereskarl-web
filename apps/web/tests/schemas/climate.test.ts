import { describe, expect, it } from "vitest";

import {
  climateSchema,
  locationWeatherSchema,
} from "@/lib/schemas/weather";

const baseLocation = {
  id: "ocean-beach",
  name: "Ocean Beach",
  latitude: 37.7594,
  longitude: -122.5107,
  distanceText: "9 mi",
  status: "Karl Territory",
  temperature: 58,
  sunshineScore: 18,
  cloudCover: 94,
  visibility: 0.8,
  humidity: 94,
  windSpeed: 14,
  windDirection: "W",
  weatherCode: 45,
  iconName: "cloud.fog.fill",
  fogScore: 82,
  updatedAt: "2026-07-15T16:00:00.000Z",
  karlReason: "Heavy marine layer.",
  primaryDrivers: [],
  microclimateFactors: [],
  confidenceScore: 80,
  confidenceLabel: "High",
  confidenceExplanation: "Fresh fused observations.",
  confidenceComponents: {
    freshness: 80,
    observationQuality: 80,
    fieldCompleteness: 80,
    sourceReliability: 80,
  },
  prediction: {
    predictionConfidenceScore: 70,
    predictionConfidenceLabel: "Medium",
    predictionReason: "Holding steady.",
  },
};

describe("climate schema", () => {
  it("accepts exactly the approved Climate values", () => {
    for (const climate of [
      "Marine",
      "Fog Belt",
      "Transition",
      "Sun Belt",
      "Inland",
    ] as const) {
      expect(climateSchema.parse(climate)).toBe(climate);
      expect(
        locationWeatherSchema.parse({ ...baseLocation, climate }).climate,
      ).toBe(climate);
    }
  });

  it("allows missing Climate on older location payloads", () => {
    expect(locationWeatherSchema.parse(baseLocation).climate).toBeUndefined();
  });

  it("strips invalid Climate strings so the tile can render Unavailable", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      climate: "Coastal",
    });
    expect(parsed.climate).toBeUndefined();
  });

  it("rejects invalid Climate at the enum schema boundary", () => {
    expect(() => climateSchema.parse("Valley")).toThrow();
    expect(() => climateSchema.parse("Ridgeline")).toThrow();
  });
});
